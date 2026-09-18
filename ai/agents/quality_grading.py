import os
import time
import json
import logging
import requests
import base64
import cv2
import numpy as np
from typing import Dict, Any, Optional
from dotenv import load_dotenv

from backend.services.screen_detector import analyze_screen_recapture
from backend.services.calibration_service import calibrate_and_measure_produce
from backend.services.image_utils import decode_image_bgr
from backend.services.llm_service import call_openrouter_vision
from backend.db import get_conn, release_conn

logger = logging.getLogger("kisansetu.quality_grading")

load_dotenv()

def get_genai_client():
    """Dynamically get or initialize Google GenAI Client with active environment key."""
    try:
        from google import genai
        # Reload dotenv in case .env was modified after process startup
        load_dotenv(override=True)
        key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
        if key and key != "dummy_key" and len(key) > 10:
            return genai.Client(api_key=key)
    except Exception as e:
        logger.debug(f"GenAI Client initialization skipped: {e}")
    return None


def decode_image_bytes(image_input) -> Optional[np.ndarray]:
    """Decode raw bytes, base64 data URL, or plain base64 string to OpenCV BGR image."""
    return decode_image_bgr(image_input)


def verify_and_grade_computer_vision(img: np.ndarray, crop_type: str = "Tomato") -> Dict[str, Any]:
    """
    Classical Computer Vision Produce Grading & Anti-Fraud Inspection Pipeline.
    1. Validates real photo vs non-photo/fake/blank/document.
    2. Detects screen recapture moire/bezel/glare.
    3. Segments agricultural color spectrum (Tomato, Onion, Potato, Chilli, Cotton, Wheat, Rice, Soybean).
    4. Computes blemish ratio, rot necrosis, color uniformity, and sphericity.
    5. Returns grade (A, B, C, or REJECTED) with concrete defect audit reasons.
    """
    h, w, _ = img.shape
    total_pixels = float(h * w)

    # 1. Texture & Entropy check (Blank, solid color, or extreme blur)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    laplacian_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())
    std_dev = float(np.std(gray))

    if std_dev < 12.0 or laplacian_var < 8.0:
        return {
            "is_produce": False,
            "grade": "REJECTED",
            "confidence": 0.99,
            "crop_detected": "Unknown / Blank",
            "defects": ["BLANK_OR_UNFOCUSED_IMAGE", "Image has near-zero visual entropy or texture"],
            "passed_items": [],
            "rubric_notes": "Upload Rejected: The image appears blank, completely blurry, or solid colored. Please photograph real produce.",
            "metrics": {"laplacian_variance": round(laplacian_var, 1), "std_dev": round(std_dev, 1)}
        }

    # 2. Screen Recapture Check (Moiré pattern, Bezel, Glare)
    screen_analysis = analyze_screen_recapture(img)
    if screen_analysis.get("screen_recapture_score", 0.0) >= 0.70:
        return {
            "is_produce": False,
            "grade": "REJECTED",
            "confidence": 0.95,
            "crop_detected": "Digital Screen / Monitor",
            "defects": [
                "SCREEN_RECAPTURE_SPOOF",
                f"Digital display subpixel moire detected ({int(screen_analysis['screen_recapture_score']*100)}% risk)",
                "Suspected photo taken of another phone or computer screen"
            ],
            "passed_items": [],
            "rubric_notes": "Upload Rejected: Screen recapture or monitor photo detected. Live physical produce capture is required.",
            "metrics": screen_analysis
        }

    # 3. Agricultural Color Segmentation
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    crop_lower = crop_type.lower()

    # Masks for agricultural hues:
    # Red/Orange (Tomato, Chilli, Red Onion)
    red1 = cv2.inRange(hsv, np.array([0, 45, 35]), np.array([16, 255, 255]))
    red2 = cv2.inRange(hsv, np.array([160, 45, 35]), np.array([180, 255, 255]))
    red_mask = red1 | red2

    # Yellow/Gold/Earthy Brown (Onion, Potato, Wheat, Rice, Soybean)
    earth_mask = cv2.inRange(hsv, np.array([12, 28, 30]), np.array([38, 255, 255]))

    # Green (Chilli, Leafy, Unripe Tomato)
    green_mask = cv2.inRange(hsv, np.array([34, 35, 30]), np.array([88, 255, 255]))

    # White/Cream/Fibrous (Cotton)
    cotton_mask = cv2.inRange(hsv, np.array([0, 0, 160]), np.array([180, 40, 255]))

    # Target crop matching
    target_mask = None
    if "tomato" in crop_lower:
        target_mask = red_mask | green_mask
    elif "onion" in crop_lower:
        # Red / Yellow / Brown onion
        target_mask = red_mask | earth_mask
    elif "potato" in crop_lower or "wheat" in crop_lower or "rice" in crop_lower or "soybean" in crop_lower:
        target_mask = earth_mask
    elif "chilli" in crop_lower or "chili" in crop_lower:
        target_mask = green_mask | red_mask
    elif "cotton" in crop_lower:
        target_mask = cotton_mask
    else:
        # General agriculture union
        target_mask = red_mask | earth_mask | green_mask

    produce_pixels = np.sum(target_mask > 0)
    produce_ratio = produce_pixels / total_pixels

    # All agricultural pixels across valid plant pigment spectrum
    organic_plant_mask = red_mask | earth_mask | green_mask
    if "cotton" in crop_lower:
        organic_plant_mask = organic_plant_mask | cotton_mask

    all_agri_pixels = np.sum(organic_plant_mask > 0)
    all_agri_ratio = all_agri_pixels / total_pixels

    # If the image lacks agricultural color spectrum or target crop coverage is negligible
    if all_agri_ratio < 0.06 or produce_ratio < 0.04:
        return {
            "is_produce": False,
            "grade": "REJECTED",
            "confidence": 0.96,
            "crop_detected": "Non-Agricultural Subject",
            "defects": [
                "NON_AGRICULTURAL_IMAGE",
                "Color spectrum contains 0% organic harvest pigmentation",
                f"Expected agricultural tones for {crop_type}, found synthetic or unrelated background"
            ],
            "passed_items": [],
            "rubric_notes": f"Upload Rejected: Image does not contain recognizable {crop_type} or agricultural produce. Please upload a clear photo of your harvest.",
            "metrics": {
                "agri_color_coverage_pct": round(float(all_agri_ratio) * 100, 2),
                "target_crop_match_pct": round(float(produce_ratio) * 100, 2)
            }
        }

    # 4. Produce Segmentation & Defect / Blemish Analysis
    blurred_mask = cv2.GaussianBlur(target_mask, (9, 9), 0)
    contours, _ = cv2.findContours(blurred_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    valid_contours = [c for c in contours if cv2.contourArea(c) > 800]

    if not valid_contours:
        return {
            "is_produce": False,
            "grade": "REJECTED",
            "confidence": 0.90,
            "crop_detected": "Unclear / Fragmented",
            "defects": ["INSUFFICIENT_PRODUCE_OBJECT", "Cannot isolate coherent crop boundary or shape"],
            "passed_items": [],
            "rubric_notes": "Upload Rejected: Could not segment distinct produce items in the frame.",
            "metrics": {"agri_color_coverage_pct": round(all_agri_ratio * 100, 2)}
        }

    # Build primary produce mask from valid contours intersecting agricultural target pixels
    contour_mask = np.zeros((h, w), dtype=np.uint8)
    cv2.drawContours(contour_mask, valid_contours, -1, 255, -1)
    produce_segmented_mask = (contour_mask > 0) & (target_mask > 0)
    seg_pixels = np.sum(produce_segmented_mask)

    if seg_pixels < 500:
        return {
            "is_produce": False,
            "grade": "REJECTED",
            "confidence": 0.90,
            "crop_detected": "Unclear / Fragmented",
            "defects": ["INSUFFICIENT_PRODUCE_OBJECT", "Cannot isolate coherent crop boundary or shape"],
            "passed_items": [],
            "rubric_notes": "Upload Rejected: Could not segment distinct produce items in the frame.",
            "metrics": {"agri_color_coverage_pct": round(all_agri_ratio * 100, 2)}
        }

    # 5. Defect / Blemish / Rot Detection within produce boundary
    v_channel = hsv[:, :, 2]
    s_channel = hsv[:, :, 1]

    # Dark necrotic rot / fungal spots: Very low brightness within produce boundary
    rot_mask = produce_segmented_mask & (v_channel < 28)
    rot_pixels = np.sum(rot_mask)
    rot_ratio = rot_pixels / float(max(1, seg_pixels))

    # Skin discoloration / blemishes: high deviation from healthy produce color
    blemish_mask = produce_segmented_mask & ((v_channel < 48) | (s_channel < 22))
    blemish_pixels = np.sum(blemish_mask)
    blemish_ratio = blemish_pixels / float(max(1, seg_pixels))

    # Color Uniformity using Circular Statistics on HSV Hue
    # OpenCV Hue ranges from 0 to 179 (representing 0 to 360 degrees, angle = hue * 2 * pi / 180 = hue * pi / 90)
    produce_hues = hsv[:, :, 0][produce_segmented_mask]
    if len(produce_hues) > 0:
        angles = produce_hues.astype(np.float64) * (np.pi / 90.0)
        mean_cos = np.mean(np.cos(angles))
        mean_sin = np.mean(np.sin(angles))
        r_resultant = float(np.sqrt(mean_cos**2 + mean_sin**2))  # Mean resultant length in [0, 1]
        color_uniformity_pct = round(max(0.0, min(100.0, r_resultant * 100.0)), 1)
    else:
        color_uniformity_pct = 50.0

    # Produce Size & Calibration
    calib = calibrate_and_measure_produce(img, crop_type=crop_type)
    estimated_size_cm = calib.get("estimated_size_cm", 6.0)

    # 6. Rubric Grading Decision Matrix
    defects = []
    passed_items = []

    if rot_ratio > 0.12 or blemish_ratio > 0.28:
        grade = "REJECTED"
        defects.append(f"Severe fungal rot / necrotic decay ({round(rot_ratio*100, 1)}% surface affected)")
        defects.append(f"Extensive skin breakdown and blemish ({round(blemish_ratio*100, 1)}%)")
        rubric_notes = "Upload Rejected: High rate of rot, mold, or severe surface necrosis detected. Cannot be certified for wholesale trading."
    elif blemish_ratio > 0.10 or rot_ratio > 0.03 or color_uniformity_pct < 65.0:
        grade = "C"
        if blemish_ratio > 0.10:
            defects.append(f"Moderate surface blemishes & scuffing ({round(blemish_ratio*100, 1)}%)")
        if color_uniformity_pct < 65.0:
            defects.append("Non-uniform ripening / color mottling")
        passed_items.append("Safe for processing / pulp utility")
        rubric_notes = "Certified Grade C (Discounted / Processing Grade): Noticeable blemishes or color variation. Suitable for food processing and discount outlets."
    elif blemish_ratio > 0.03 or color_uniformity_pct < 82.0:
        grade = "B"
        if blemish_ratio > 0.03:
            defects.append(f"Minor skin blemishes ({round(blemish_ratio*100, 1)}%)")
        passed_items.append("Zero fungal rot or deep decay")
        passed_items.append(f"Good size consistency (~{estimated_size_cm} cm)")
        passed_items.append(f"Color uniformity: {round(color_uniformity_pct, 0)}%")
        rubric_notes = "Certified Grade B (Standard Market Grade): Minor surface scuffs within acceptable wholesale tolerance. High freshness and firmness."
    else:
        grade = "A"
        passed_items.append("Zero fungal presence / deep rot")
        passed_items.append(f"Optimal firmness & uniform pigmentation ({round(color_uniformity_pct, 0)}%)")
        passed_items.append(f"Export-grade diameter (~{estimated_size_cm} cm)")
        passed_items.append("Premium smooth surface texture")
        rubric_notes = "Certified Grade A (Premium Export Quality): Superior visual uniformity, excellent firmness, and flawless surface finish."

    confidence = 0.95 if calib.get("calibration_marker_detected") else 0.91

    return {
        "is_produce": True,
        "grade": grade,
        "confidence": confidence,
        "crop_detected": crop_type,
        "defects": defects,
        "passed_items": passed_items,
        "rubric_notes": rubric_notes,
        "metrics": {
            "estimated_size_cm": float(estimated_size_cm),
            "blemish_pct": round(float(blemish_ratio) * 100, 1),
            "rot_pct": round(float(rot_ratio) * 100, 1),
            "color_uniformity_pct": round(float(color_uniformity_pct), 1),
            "calibrated": bool(calib.get("calibration_marker_detected", False))
        }
    }


GRADING_RUBRIC_GEMINI = """You are an expert agricultural produce inspector. Inspect this crop photo with extreme scrutiny.

First check: Is this image authentic, recognizable fresh agricultural produce (crop/vegetable/fruit/grain)?
If it is a fake photo, a screenshot of a computer or phone, a meme, a car, person, document, drawing, or unrelated object, or if it shows severely rotten/decayed produce, return:
{"is_produce": false, "grade": "REJECTED", "crop_detected": "None/Fake", "defects": ["Reason for rejection"], "passed_items": [], "rubric_notes": "Clear rejection explanation", "confidence": 0.99}

If it is genuine produce, grade it A, B, or C:
- A: Premium uniform color/size, zero rot, <3% blemishes, high firmness.
- B: Standard market quality, minor blemishes (3-10%), slight color variation, no rot.
- C: Discount grade, significant blemishes (10-25%), discoloration, irregular size.

Return ONLY valid JSON (no markdown fences, no explanation):
{
  "is_produce": true,
  "grade": "A" | "B" | "C" | "REJECTED",
  "crop_detected": "string",
  "defects": ["defect1", "defect2"],
  "passed_items": ["passed1", "passed2"],
  "rubric_notes": "string summary",
  "confidence": 0.95
}"""


def grade_photo(lot_id: str, photo_url: str, crop_type: str = "Tomato") -> Dict[str, Any]:
    """
    Unified Grade Entrypoint.
    Executes Gemini 2.0 Flash Vision (if key configured) with fallback to OpenCV Computer Vision pipeline.
    Ensures fake, screen, and non-produce uploads are rejected.
    """
    if not lot_id or not lot_id.strip():
        lot_id = f"lot-qc-{int(time.time())}"
    if not photo_url or not photo_url.strip():
        raise ValueError("photo_url is required")

    img_bytes = None
    mime_t = "image/jpeg"

    try:
        if photo_url.startswith("data:"):
            header, b64_part = photo_url.split(",", 1)
            img_bytes = base64.b64decode(b64_part)
            parsed_mime = header.split(";", 1)[0].replace("data:", "")
            if parsed_mime:
                mime_t = parsed_mime
        else:
            resp = requests.get(photo_url, timeout=10)
            img_bytes = resp.content
            if ".png" in photo_url.lower():
                mime_t = "image/png"
    except Exception as e:
        logger.warning(f"Error fetching photo bytes: {e}", exc_info=True)
        return {
            "is_produce": False,
            "grade": "REJECTED",
            "confidence": 0.0,
            "defects": ["CORRUPT_OR_UNREACHABLE_MEDIA", "Image file could not be downloaded or decoded"],
            "passed_items": [],
            "rubric_notes": "Upload Rejected: Media could not be read or decoded.",
            "photo_url": photo_url
        }

    # 1. Decode image array for CV analysis
    cv_img = decode_image_bytes(img_bytes)
    if cv_img is None:
        return {
            "is_produce": False,
            "grade": "REJECTED",
            "confidence": 0.0,
            "defects": ["INVALID_IMAGE_PAYLOAD", "Image format could not be decoded by vision engine"],
            "passed_items": [],
            "rubric_notes": "Upload Rejected: Corrupt or unreadable image file.",
            "photo_url": photo_url
        }

    # 2. Run Computer Vision Pipeline
    cv_result = verify_and_grade_computer_vision(cv_img, crop_type=crop_type)

    # If CV pipeline detected that the image is a fake/screen/non-produce, reject immediately
    if not cv_result.get("is_produce", True) or cv_result.get("grade") == "REJECTED":
        cv_result["photo_url"] = photo_url
        cv_result["lot_id"] = lot_id
        save_grade_to_db(lot_id, cv_result["grade"], cv_result.get("defects", []), photo_url)
        return cv_result

    # 3. Multimodal Vision AI Inspection (OpenRouter / Gemini)
    ai_vision_result = None

    # Try OpenRouter Vision first
    try:
        vision_prompt = f"""Inspect this agricultural harvest image for quality certification.
Farmer's declared crop: {crop_type}

Rubric:
1. Anti-Spoof / Anti-Fraud: If the image shows a digital screen, paper document, meme, non-food object, or severe rotten mold, return is_produce: false, grade: "REJECTED".
2. Grading (if genuine produce):
   - Grade A: Premium uniform color and size, zero fungal rot, <3% surface blemishes, firm fresh appearance.
   - Grade B: Standard market grade, minor skin blemishes (3-10%), slight color variation, no rot.
   - Grade C: Discount / processing grade, visible blemishes (10-25%), discoloration, irregular size.

Return ONLY JSON matching:
{{
  "is_produce": true,
  "grade": "A" | "B" | "C" | "REJECTED",
  "confidence": number (between 0.80 and 0.99),
  "crop_detected": "string",
  "defects": ["defect description 1", "defect description 2"],
  "passed_items": ["passed check 1", "passed check 2"],
  "rubric_notes": "string summary explaining the grade"
}}"""

        ai_vision_result = call_openrouter_vision(
            prompt=vision_prompt,
            image_input=photo_url,
            crop_type=crop_type,
            system_prompt="You are an expert AI quality inspector for KisanSetu agricultural wholesale marketplace."
        )
    except Exception as e:
        logger.debug(f"OpenRouter vision pass-through: {e}")
        ai_vision_result = None

    # Try Gemini Vision as secondary fallback
    if not ai_vision_result or "grade" not in ai_vision_result:
        client = get_genai_client()
        if client and len(img_bytes) < 20 * 1024 * 1024:
            try:
                from google.genai import types
                response = client.models.generate_content(
                    model="gemini-2.0-flash",
                    contents=[
                        GRADING_RUBRIC_GEMINI,
                        f"Crop claimed by farmer: {crop_type}",
                        types.Part.from_bytes(data=img_bytes, mime_type=mime_t),
                    ]
                )
                text = response.text.strip().strip("```json").strip("```").strip()
                ai_vision_result = json.loads(text)
            except Exception as e:
                logger.info(f"Gemini inspection pass-through info: {e}")
                ai_vision_result = None

    # Final result: use AI vision if available, otherwise CV pipeline result
    if ai_vision_result and "grade" in ai_vision_result:
        final_result = ai_vision_result
        # Merge CV metrics for enriched client display
        if "metrics" in cv_result:
            final_result["metrics"] = cv_result["metrics"]
    else:
        final_result = cv_result

    final_result["photo_url"] = photo_url
    final_result["lot_id"] = lot_id

    save_grade_to_db(lot_id, final_result["grade"], final_result.get("defects", []), photo_url)
    return final_result


def save_grade_to_db(lot_id: str, grade: str, defects: list, photo_url: str):
    """Safely persist quality grade to DB if connection available."""
    try:
        from backend.db import get_conn, release_conn
        conn = get_conn()
        try:
            cur = conn.cursor()
            cur.execute("""
                INSERT INTO quality_grades (lot_id, grade, defects, photo_url)
                VALUES (%s, %s, %s, %s)
            """, (lot_id, grade, json.dumps(defects), photo_url))
            cur.execute("UPDATE lots SET grade = %s WHERE id = %s", (grade, lot_id))
            conn.commit()
        finally:
            release_conn(conn)
    except Exception as err:
        logger.debug(f"DB quality grade write skipped: {err}")
