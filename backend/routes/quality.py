import logging
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from ai.agents.quality_grading import grade_photo
from backend.routes.auth import require_auth

logger = logging.getLogger("kisansetu.quality")
router = APIRouter()


class QualityGradeRequest(BaseModel):
    lot_id: Optional[str] = "temp-lot-01"
    crop_type: Optional[str] = "Tomato"
    photo_url: Optional[str] = "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800"
    capture_token: Optional[str] = None


@router.post("/api/quality/grade")
def quality_grade(body: QualityGradeRequest, auth_payload: dict = Depends(require_auth)):
    if body.capture_token:
        from backend.routes.anti_fraud import verify_capture_token
        verify_capture_token(body.capture_token)
    try:
        lot_id = body.lot_id or "temp-lot-01"
        photo_url = body.photo_url or "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800"
        crop_type = body.crop_type or "Tomato"
        return grade_photo(lot_id, photo_url, crop_type=crop_type)
    except Exception as e:
        logger.warning(f"Quality grading processing exception: {e}")
        return {
            "grade": "REJECTED",
            "is_produce": False,
            "defects": ["CORRUPT_OR_UNPARSEABLE_IMAGE", str(e)],
            "rubric_notes": "Could not inspect the uploaded media. Please upload a clear photo of the harvest.",
            "photo_url": body.photo_url,
            "confidence": 0.0,
            "demo_mode": False
        }
