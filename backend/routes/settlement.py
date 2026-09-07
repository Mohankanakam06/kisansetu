from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ai.agents.settlement import process_payout

router = APIRouter()


class PayoutRequest(BaseModel):
    order_id: str
    stage: str  # 'pickup' or 'delivery'


@router.post("/api/settlement/payout")
def payout(body: PayoutRequest):
    """Process payout for an order at pickup or delivery stage."""
    if body.stage not in ("pickup", "delivery"):
        raise HTTPException(status_code=400, detail="stage must be 'pickup' or 'delivery'")
    try:
        return process_payout(body.order_id, body.stage)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Settlement error: {str(e)}")
