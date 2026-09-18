from typing import Optional
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from ai.agents.orchestrator import handle_query
from backend.routes.auth import require_auth

router = APIRouter()

class OrchestratorQueryRequest(BaseModel):
    user_id: Optional[str] = "farmer-01"
    message: str = ""
    message_type: Optional[str] = "text"
    media_url: Optional[str] = None

@router.post("/api/orchestrator/query")
def orchestrator_query(body: OrchestratorQueryRequest, auth_payload: dict = Depends(require_auth)):
    # With auth enforced the token decides who the query is for; the body's
    # user_id must not be able to impersonate another user's conversation.
    from backend import config
    user_id = auth_payload["sub"] if config.require_auth_enforced() else (body.user_id or "farmer-01")
    return handle_query(
        user_id,
        body.message,
        body.message_type or "text",
        body.media_url,
    )