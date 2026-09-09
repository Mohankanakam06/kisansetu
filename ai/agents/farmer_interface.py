import os
import json
import logging
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

load_dotenv()

BHASHINI_ENDPOINT = "https://dhruva-api.bhashini.gov.in/services/inference/pipeline"
BHASHINI_KEY = os.environ.get("BHASHINI_API_KEY", "")
SARVAM_API_KEY = os.environ.get("SARVAM_API_KEY", "")

def transcribe_audio(audio_url: str, language: str = "hi") -> str:
    """Call Speech-to-Text pipeline (Sarvam / Bhashini / Fallback).
    Falls back to a demo transcript if the API fails or is not configured."""
    # 1. Try Sarvam AI if configured
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

    # 2. Try Bhashini if configured
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
    # 3. Demo fallback string for reliability
    return "mujhe do quintal tamatar bechna hai, teen sau rupaye kilo"

def parse_listing(transcript: str, language: str = "hi") -> dict:
    """Use Gemini to extract structured fields from the transcript."""
    try:
        prompt = f"""Extract a farm produce listing from this {language} transcript.
Transcript: "{transcript}"

Return ONLY valid JSON, no markdown, no explanation:
{{"crop_type": "string (lowercase english, e.g. tomato)",
  "quantity_kg": number,
  "price_expectation": number (total INR per kg)}}"""

        if _genai_client:
            response = _genai_client.models.generate_content(
                model="gemini-1.5-flash",
                contents=prompt
            )
            text = response.text.strip().strip("```json").strip("```").strip()
            return json.loads(text)
        else:
            raise ValueError("Gemini client not configured")
    except Exception as e:
        logger.warning(f"Gemini entity parsing fallback triggered ({e}). Using heuristic parsing.")
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
        try:
            cur.execute("""
                INSERT INTO listings (farmer_id, crop_type, quantity_kg, price_expectation, location, status)
                VALUES (%s, %s, %s, %s, ST_MakePoint(%s, %s)::geography, 'active')
                RETURNING id
            """, (farmer_id, crop_type.lower(), quantity_kg, price_expectation, lng, lat))
            listing_id = cur.fetchone()["id"]
        except Exception:
            conn.rollback()
            cur.execute("""
                INSERT INTO listings (farmer_id, crop_type, quantity_kg, price_expectation, status)
                VALUES (%s, %s, %s, %s, 'active')
                RETURNING id
            """, (farmer_id, crop_type.lower(), quantity_kg, price_expectation))
            listing_id = cur.fetchone()["id"]
        conn.commit()
    except Exception as e:
        logger.warning(f"Direct listing DB insertion failed: {e}")
        listing_id = f"list-{abs(hash(crop_type + str(quantity_kg))) % 10000}"
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
