import logging
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from ai.agents.settlement import process_payout
from backend.routes.auth import require_auth

logger = logging.getLogger("kisansetu.settlement_routes")

router = APIRouter()


class PayoutRequest(BaseModel):
    order_id: str
    stage: str  # 'pickup' or 'delivery'


@router.post("/api/settlement/payout")
def payout(body: PayoutRequest, auth_payload: dict = Depends(require_auth)):
    """Process payout for an order at pickup or delivery stage.

    Moves money, so it requires an authenticated caller. In production this
    should additionally be limited to staff/agent roles once those exist;
    today any authenticated user can trigger a payout for an order they know.
    """
    if body.stage not in ("pickup", "delivery"):
        raise HTTPException(status_code=400, detail="stage must be 'pickup' or 'delivery'")
    try:
        return process_payout(body.order_id, body.stage)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Settlement error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Settlement payout processing failed. Please check order status and retry.")
