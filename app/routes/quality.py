from fastapi import APIRouter
from app.agents.quality_grading import grade_photo

router = APIRouter()

@router.post("/api/quality/grade")
def quality_grade(body: dict):
    return grade_photo(body["lot_id"], body["photo_url"])
