from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ai.agents.quality_grading import grade_photo

router = APIRouter()


class QualityGradeRequest(BaseModel):
    lot_id: str
    photo_url: str


@router.post("/api/quality/grade")
def quality_grade(body: QualityGradeRequest):
    try:
        return grade_photo(body.lot_id, body.photo_url)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
