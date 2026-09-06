
# app/routes/lots.py
from fastapi import APIRouter
from app.agents.aggregations import run_aggregation

router = APIRouter()

@router.post("/api/internal/aggregate")
def aggregate():
    lot_ids = run_aggregation()
    return {"lots_created": lot_ids}

@router.get("/api/lots")
def list_lots(crop: str = None, grade: str = None,
              lat: float = None, lng: float = None, radius_km: float = None):
    """List available lots with optional filters."""
    from app.db import get_conn
    conn = get_conn()
    cur = conn.cursor()

    query = "SELECT id, crop_type, total_quantity_kg, grade, status, created_at FROM lots WHERE 1=1"
    params = []

    if crop:
        query += " AND crop_type = %s"
        params.append(crop)

    if grade:
        query += " AND grade = %s"
        params.append(grade)

    if lat and lng and radius_km:
        query += " AND ST_DWithin(centroid, ST_MakePoint(%s, %s)::geography, %s)"
        params.extend([lng, lat, radius_km * 1000])

    query += " ORDER BY created_at DESC"
    cur.execute(query, params)
    lots = cur.fetchall()
    conn.close()

    return {
        "lots": [
            {
                "id": l["id"],
                "crop_type": l["crop_type"],
                "total_quantity_kg": float(l["total_quantity_kg"]),
                "grade": l["grade"],
                "status": l["status"],
                "created_at": str(l["created_at"])
            }
            for l in lots
        ]
    }
