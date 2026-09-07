# pyrefly: ignore [missing-import]
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ai.agents.routing import optimize_route, compare_individual_vs_consolidated

router = APIRouter()


class OptimizeRequest(BaseModel):
    order_id: str


@router.post("/api/routing/optimize")
def optimize(body: OptimizeRequest):
    """Optimize delivery route for an order."""
    try:
        return optimize_route(body.order_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Routing error: {str(e)}")


@router.post("/api/routing/compare")
def compare(body: OptimizeRequest):
    """Compare individual vs consolidated routing for demo."""
    try:
        return compare_individual_vs_consolidated(body.order_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Comparison error: {str(e)}")
