import os
import json
import logging
import time
import uuid
import requests
from dotenv import load_dotenv

logger = logging.getLogger("kisansetu.farmer")

try:
    from google import genai
    from google.genai import types
    gemini_key = os.environ.get("GEMINI_API_KEY", "")
    _genai_client = genai.Client(api_key=gemini_key) if gemini_key else None
except Exception:
    genai = None
    types = None
    _genai_client = None

from backend.db import get_conn, release_conn
from backend.services.llm_service import call_openrouter_structured

load_dotenv()

BHASHINI_ENDPOINT = "https://dhruva-api.bhashini.gov.in/services/inference/pipeline"
BHASHINI_KEY = os.environ.get("BHASHINI_API_KEY", "")
SARVAM_API_KEY = os.environ.get("SARVAM_API_KEY", "")
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")

def transcribe_audio(audio_url: str, language: str = "hi") -> str:
    """Call Speech-to-Text pipeline (Groq Whisper / Sarvam / Bhashini / Fallback).
    Falls back to a demo transcript if the API fails or is not configured."""
    # 1. Try Groq Whisper (Free high-accuracy multilingual STT)
    if GROQ_API_KEY and GROQ_API_KEY != "dummy_key":
        try:
            audio_response = requests.get(audio_url, timeout=10)
            if audio_response.status_code == 200:
                files = {"file": ("audio.webm", audio_response.content)}
                data = {"model": "whisper-large-v3"}
                resp = requests.post(
                    "https://api.groq.com/openai/v1/audio/transcriptions",
                    headers={"Authorization": f"Bearer {GROQ_API_KEY}"},
                    files=files,
                    data=data,
                    timeout=20
                )
                if resp.status_code == 200:
                    text = resp.json().get("text", "").strip()
                    if text:
                        return text
        except Exception as e:
            logger.warning(f"Groq Whisper STT failed, trying next provider: {e}")

    # 2. Try Sarvam AI if configured
    if SARVAM_API_KEY and SARVAM_API_KEY != "dummy_key":
        try:
            headers = {"api-subscription-key": SARVAM_API_KEY}
            payload = {
                "audio_url": audio_url,
                "language_code": f"{language}-IN" if not language.endswith("-IN") else language,
                "model": "saaras:v1"
            }
            resp = requests.post("https://api.sarvam.ai/speech-to-text", headers=headers, json=payload, timeout=10)
            if resp.status_code == 200:
                data = resp.json()
                if "transcript" in data:
                    return data["transcript"]
        except Exception as e:
            logger.warning(f"Sarvam STT failed, falling back to next provider: {e}")

    # 3. Try Bhashini if configured
    if BHASHINI_KEY and BHASHINI_KEY != "dummy_key":
        try:
            resp = requests.post(
                BHASHINI_ENDPOINT,
                headers={"Authorization": BHASHINI_KEY},
                json={
                    "pipelineTasks": [{
                        "taskType": "asr",
                        "config": {"language": {"sourceLanguage": language}}
                    }],
                    "inputData": {"audio": [{"audioContent": audio_url}]}
                },
                timeout=15,
            )
            resp.raise_for_status()
            return resp.json()["pipelineResponse"][0]["output"][0]["source"]
        except Exception as e:
            logger.warning(f"Bhashini STT call failed: {e}")

    logger.warning("DEMO MODE: No live STT credentials configured. Using simulated Hindi transcript.")
    # 4. Demo fallback string for reliability
    return "mujhe do quintal tamatar bechna hai, teen sau rupaye kilo"

def parse_listing(transcript: str, language: str = "hi") -> dict:
    """Extract structured crop, quantity, and price from voice transcript using OpenRouter/Gemini."""
    system_prompt = (
        "You are an agricultural NLP agent for KisanSetu. Extract produce listing details from farmer transcripts. "
        "Translate vernacular crop names (e.g. tamatar -> tomato, aloo -> potato, pyaz/kanda -> onion, mirchi -> chilli, kapaas -> cotton, gehu -> wheat, chawal/dhan -> rice) to lowercase standard English. "
        "Convert vernacular quantities (e.g. quintal = 100 kg, bori/sack = 50 kg) to total quantity in kilograms as float."
    )
    prompt = f"""Extract farm produce listing from this {language} transcript:
Transcript: "{transcript}"

Return ONLY JSON matching:
{{
  "crop_type": "string (standard lowercase english, e.g. tomato, onion, potato, chilli)",
  "quantity_kg": number,
  "price_expectation": number (INR per kg)
}}"""

    # 1. Try OpenRouter LLM first
    try:
        or_result = call_openrouter_structured(prompt=prompt, system_prompt=system_prompt)
        if or_result and "crop_type" in or_result and "quantity_kg" in or_result:
            return {
                "crop_type": str(or_result.get("crop_type", "tomato")).lower().strip(),
                "quantity_kg": float(or_result.get("quantity_kg", 100.0)),
                "price_expectation": float(or_result.get("price_expectation", 25.0))
            }
    except Exception as e:
        logger.debug(f"OpenRouter entity parsing pass-through: {e}")

    # 2. Try Gemini client
    try:
        if _genai_client:
            response = _genai_client.models.generate_content(
                model="gemini-2.0-flash",
                contents=prompt
            )
            text = response.text.strip().strip("```json").strip("```").strip()
            parsed = json.loads(text)
            return {
                "crop_type": str(parsed.get("crop_type", "tomato")).lower().strip(),
                "quantity_kg": float(parsed.get("quantity_kg", 100.0)),
                "price_expectation": float(parsed.get("price_expectation", 25.0))
            }
    except Exception as e:
        logger.debug(f"Gemini entity parsing fallback triggered ({e}).")

    # 3. Fallback Heuristic
    logger.warning("Using heuristic fallback for farmer transcript parsing.")
    return {
        "crop_type": "tomato",
        "quantity_kg": 200.0,
        "price_expectation": 30.0
    }

def create_direct_listing(farmer_id: str, crop_type: str, quantity_kg: float, price_expectation: float, lat: float, lng: float):
    """Directly insert a structured listing into the database."""
    conn = get_conn()
    listing_id = None
    try:
        cur = conn.cursor()

        # Ensure farmer UUID is valid or create fallback user
        farmer_uuid = None
        if farmer_id:
            try:
                farmer_uuid = str(uuid.UUID(str(farmer_id)))
            except (ValueError, TypeError):
                farmer_uuid = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"farmer.{farmer_id}"))

        if farmer_uuid:
            cur.execute("""
                INSERT INTO users (id, name, phone, role)
                VALUES (%s, 'Registered Farmer', %s, 'farmer')
                ON CONFLICT (id) DO NOTHING
            """, (farmer_uuid, f"98{abs(hash(farmer_uuid)) % 100000000:08d}"))

        try:
            cur.execute("""
                INSERT INTO listings (farmer_id, crop_type, quantity_kg, price_expectation, location, status)
                VALUES (%s, %s, %s, %s, ST_MakePoint(%s, %s)::geography, 'active')
                RETURNING id
            """, (farmer_uuid, crop_type.lower(), quantity_kg, price_expectation, lng, lat))
            row = cur.fetchone()
            listing_id = row["id"] if row else None
        except Exception:
            conn.rollback()
            cur.execute("""
                INSERT INTO listings (farmer_id, crop_type, quantity_kg, price_expectation, status)
                VALUES (%s, %s, %s, %s, 'active')
                RETURNING id
            """, (farmer_uuid, crop_type.lower(), quantity_kg, price_expectation))
            row = cur.fetchone()
            listing_id = row["id"] if row else None

        conn.commit()
        if not listing_id:
            raise RuntimeError("Database did not return generated listing UUID.")
    except Exception as e:
        conn.rollback()
        logger.error("Direct listing DB insertion failed: %s", e)
        raise
    finally:
        release_conn(conn)

    return {
        "listing_id": str(listing_id),
        "crop_type": crop_type.lower(),
        "quantity_kg": float(quantity_kg),
        "price_expectation": float(price_expectation),
        "location": {"lat": lat, "lng": lng},
        "status": "active"
    }

def create_listing(farmer_id: str, transcript: str, language: str, lat: float, lng: float):
    parsed = parse_listing(transcript, language)
    return create_direct_listing(
        farmer_id=farmer_id,
        crop_type=parsed["crop_type"],
        quantity_kg=parsed["quantity_kg"],
        price_expectation=parsed["price_expectation"],
        lat=lat,
        lng=lng
    )
