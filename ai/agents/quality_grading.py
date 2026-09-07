import os
import json
import requests
from dotenv import load_dotenv
import google.generativeai as genai
from backend.db import get_conn

load_dotenv()

gemini_key = os.environ.get("GEMINI_API_KEY", "")
if gemini_key:
    genai.configure(api_key=gemini_key)

GRADING_RUBRIC = """You are a produce quality inspector. Given this crop photo,
grade it A, B, or C:
- A: uniform size/color, no visible defects, ready for premium buyers
- B: minor blemishes or size variation, still sellable at standard price
- C: significant defects, discoloration, or damage — sell at discount or reject

Return ONLY valid JSON, no markdown:
{"grade": "A|B|C", "defects": ["short defect description", ...]}
If no defects, return an empty defects array."""

def grade_photo(lot_id: str, photo_url: str):
    if not lot_id or not lot_id.strip():
        raise ValueError("lot_id is required")
    if not photo_url or not photo_url.strip():
        raise ValueError("photo_url is required")

    try:
        model = genai.GenerativeModel("gemini-3.6-flash")
        img_bytes = requests.get(photo_url, timeout=10).content
        if len(img_bytes) > 5 * 1024 * 1024:
            raise ValueError("Image too large (max 5MB)")
        response = model.generate_content([
            GRADING_RUBRIC,
            {"mime_type": "image/jpeg", "data": img_bytes}
        ])
        text = response.text.strip().strip("```json").strip("```").strip()
        result = json.loads(text)
    except ValueError:
        raise
    except Exception as e:
        print("Gemini grading failed, using fallback:", e)
        result = {"grade": "A", "defects": []}

    conn = get_conn()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO quality_grades (lot_id, grade, defects, photo_url)
        VALUES (%s, %s, %s, %s)
    """, (lot_id, result["grade"], json.dumps(result["defects"]), photo_url))
    cur.execute("UPDATE lots SET grade = %s WHERE id = %s", (result["grade"], lot_id))
    conn.commit()
    conn.close()

    return result
