from typing import Optional
from fastapi import APIRouter
from pydantic import BaseModel
from ai.agents.orchestrator import handle_query

router = APIRouter()

class OrchestratorQueryRequest(BaseModel):
    user_id: Optional[str] = "farmer-01"
    message: str = ""
    message_type: Optional[str] = "text"
    media_url: Optional[str] = None

@router.post("/api/orchestrator/query")
def orchestrator_query(body: OrchestratorQueryRequest):
    return handle_query(
        body.user_id or "farmer-01",
        body.message,
        body.message_type or "text",
        body.media_url,
    )