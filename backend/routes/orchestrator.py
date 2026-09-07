from fastapi import APIRouter
from ai.agents.orchestrator import handle_query

router = APIRouter()

@router.post("/api/orchestrator/query")
def orchestrator_query(body: dict):
    return handle_query(
        body.get("user_id"),
        body.get("message", ""),
        body.get("message_type", "text"),
        body.get("media_url"),
    )