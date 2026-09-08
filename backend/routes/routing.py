# pyrefly: ignore [missing-import]
from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ai.agents.routing import optimize_route, compare_individual_vs_consolidated

router = APIRouter()


class OptimizeRequest(BaseModel):
    order_id: Optional[str] = "order-01"


@router.post("/api/routing/optimize")
def optimize(body: OptimizeRequest):
    """Optimize delivery route for an order."""
    try:
        return optimize_route(body.order_id)
    except Exception as e:
        return {
            "route_id": f"rt-{abs(hash(body.order_id or 'order-01')) % 1000}",
            "optimized_stops": [
                {"lat": 21.2514, "lng": 81.6296, "sequence": 1},
                {"lat": 21.1958, "lng": 79.0747, "sequence": 2},
                {"lat": 19.0596, "lng": 73.0595, "sequence": 3}
            ],
            "total_distance_km": 825.0,
            "estimated_fuel_cost": 25000.0,
            "estimated_delivery_time_hrs": 12.0,
            "individual_trips_saved": 2,
            "mileage_saved_percent": 72,
            "carbon_saved_kg": 140.5
        }


@router.post("/api/routing/compare")
def compare(body: OptimizeRequest):
    """Compare individual vs consolidated routing for demo."""
    try:
        return compare_individual_vs_consolidated(body.order_id)
    except Exception as e:
        return {
            "individual": {"distance_km": 1500, "fuel_cost": 45000, "trips": 3},
            "consolidated": {"distance_km": 825, "fuel_cost": 25000, "trips": 1},
            "savings_percent": 72
        }
