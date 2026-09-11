# app/routes/lots.py
import logging
from fastapi import APIRouter, HTTPException
from ai.agents.aggregations import run_aggregation

logger = logging.getLogger("kisansetu.lots")
router = APIRouter()

@router.post("/api/internal/aggregate")
def aggregate():
    try:
        lot_ids = run_aggregation()
        return {"lots_created": lot_ids}
    except Exception as e:
        logger.warning(f"Internal aggregation trigger failed: {e}")
        return {"lots_created": [], "error": str(e), "demo_mode": True}

@router.get("/api/lots")
def list_lots(crop: str = None, grade: str = None,
              lat: float = None, lng: float = None, radius_km: float = None):
    """List available lots with optional filters and 24-hour freshness time limit."""
    from backend.db import get_conn, release_conn
    conn = get_conn()
    try:
        cur = conn.cursor()
        query = """
            SELECT l.id, l.crop_type, l.total_quantity_kg, l.grade, l.status, l.created_at,
                   ST_Y(l.centroid::geometry) as lat, ST_X(l.centroid::geometry) as lng,
                   COUNT(DISTINCT ll.listing_id) as listings_count,
                   COALESCE(
                       AVG(li.price_expectation),
                       (SELECT avg_price FROM price_history ph WHERE ph.crop_type = l.crop_type ORDER BY date DESC LIMIT 1),
                       25.0
                   ) as price_per_kg,
                   q.photo_url, q.defects
            FROM lots l
            LEFT JOIN lot_listings ll ON l.id = ll.lot_id
            LEFT JOIN listings li ON ll.listing_id = li.id
            LEFT JOIN LATERAL (
                SELECT photo_url, defects FROM quality_grades WHERE lot_id = l.id ORDER BY graded_at DESC LIMIT 1
            ) q ON true
            WHERE 1=1 AND l.status = 'open' AND l.created_at >= NOW() - INTERVAL '24 hours'
        """
        params = []

        if crop and crop.lower() != "all":
            query += " AND LOWER(l.crop_type) = LOWER(%s)"
            params.append(crop)

        if grade and grade.lower() != "all":
            query += " AND l.grade = %s"
            params.append(grade)

        if lat is not None and lng is not None and radius_km is not None:
            query += " AND ST_DWithin(l.centroid, ST_MakePoint(%s, %s)::geography, %s)"
            params.extend([lng, lat, radius_km * 1000])

        query += " GROUP BY l.id, l.crop_type, l.total_quantity_kg, l.grade, l.status, l.created_at, l.centroid, q.photo_url, q.defects ORDER BY l.created_at DESC"
        cur.execute(query, params)
        lots = cur.fetchall()

        return {
            "lots": [
                {
                    "id": l["id"],
                    "crop_type": l["crop_type"],
                    "total_quantity_kg": float(l["total_quantity_kg"]),
                    "grade": l["grade"] or "A",
                    "centroid": {
                        "lat": float(l["lat"]) if l["lat"] else 22.6939,
                        "lng": float(l["lng"]) if l["lng"] else 72.8618
                    },
                    "status": l["status"],
                    "price_per_kg": round(float(l["price_per_kg"]), 2),
                    "listings_count": int(l["listings_count"]) if l["listings_count"] else 1,
                    "photo_url": l["photo_url"],
                    "defects": l["defects"] if isinstance(l["defects"], list) else [],
                    "created_at": str(l["created_at"])
                }
                for l in lots
            ]
        }
    finally:
        release_conn(conn)

@router.get("/api/lots/{lot_id}")
def get_lot(lot_id: str):
    """Get a specific lot by ID with member listings."""
    from backend.db import get_conn, release_conn
    conn = get_conn()
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT l.id, l.crop_type, l.total_quantity_kg, l.grade, l.status, l.created_at,
                   ST_Y(l.centroid::geometry) as lat, ST_X(l.centroid::geometry) as lng,
                   COUNT(DISTINCT ll.listing_id) as listings_count,
                   COALESCE(
                       AVG(li.price_expectation),
                       (SELECT avg_price FROM price_history ph WHERE ph.crop_type = l.crop_type ORDER BY date DESC LIMIT 1),
                       25.0
                   ) as price_per_kg,
                   q.photo_url, q.defects
            FROM lots l
            LEFT JOIN lot_listings ll ON l.id = ll.lot_id
            LEFT JOIN listings li ON ll.listing_id = li.id
            LEFT JOIN LATERAL (
                SELECT photo_url, defects FROM quality_grades WHERE lot_id = l.id ORDER BY graded_at DESC LIMIT 1
            ) q ON true
            WHERE l.id = %s
            GROUP BY l.id, l.crop_type, l.total_quantity_kg, l.grade, l.status, l.created_at, l.centroid, q.photo_url, q.defects
        """, (lot_id,))
        l = cur.fetchone()
        if not l:
            raise HTTPException(status_code=404, detail="Lot not found")

        cur.execute("""
            SELECT li.id as listing_id, u.name as farmer_name, u.phone as farmer_phone,
                   li.quantity_kg, li.price_expectation as price_per_kg,
                   ST_Y(li.location::geometry) as lat, ST_X(li.location::geometry) as lng
            FROM lot_listings ll
            JOIN listings li ON ll.listing_id = li.id
            LEFT JOIN users u ON li.farmer_id = u.id
            WHERE ll.lot_id = %s
        """, (lot_id,))
        listings = cur.fetchall()

        return {
            "id": l["id"],
            "crop_type": l["crop_type"],
            "total_quantity_kg": float(l["total_quantity_kg"]),
            "grade": l["grade"] or "A",
            "centroid": {
                "lat": float(l["lat"]) if l["lat"] else 22.6939,
                "lng": float(l["lng"]) if l["lng"] else 72.8618
            },
            "status": l["status"],
            "price_per_kg": round(float(l["price_per_kg"]), 2),
            "listings_count": len(listings) if listings else int(l["listings_count"] or 1),
            "photo_url": l["photo_url"],
            "defects": l["defects"] if isinstance(l["defects"], list) else [],
            "created_at": str(l["created_at"]),
            "listings": [
                {
                    "listing_id": item["listing_id"],
                    "farmer_name": item["farmer_name"] or "Local Farmer",
                    "farmer_phone": item["farmer_phone"] or "+91 90000 00000",
                    "quantity_kg": float(item["quantity_kg"]),
                    "price_per_kg": float(item["price_per_kg"] or l["price_per_kg"]),
                    "location": {
                        "lat": float(item["lat"]) if item["lat"] else 22.6939,
                        "lng": float(item["lng"]) if item["lng"] else 72.8618
                    }
                }
                for item in listings
            ]
        }
    finally:
        release_conn(conn)
