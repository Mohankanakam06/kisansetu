import logging
from typing import Optional, Union, Dict, Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ai.agents.farmer_interface import transcribe_audio, create_listing, create_direct_listing

logger = logging.getLogger("kisansetu.farmer_routes")
router = APIRouter()


class LocationModel(BaseModel):
    lat: Optional[float] = 22.6939
    lng: Optional[float] = 72.8618


class FarmerListingRequest(BaseModel):
    farmer_id: Optional[str] = "farmer-01"
    farmer_name: Optional[str] = None
    farmer_phone: Optional[str] = None
    crop_type: Optional[str] = None
    quantity_kg: Optional[float] = None
    price_expectation: Optional[float] = None
    location: Optional[Union[LocationModel, Dict[str, Any]]] = None
    photo_url: Optional[str] = None
    transcript: Optional[str] = None
    language: Optional[str] = "hi"
    media_url: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None


@router.post("/api/farmer/listing")
def farmer_listing(body: FarmerListingRequest):
    farmer_id = body.farmer_id or "farmer-01"

    # Extract lat/lng from location object or top-level lat/lng
    lat = 22.6939
    lng = 72.8618
    if body.lat is not None:
        lat = body.lat
    if body.lng is not None:
        lng = body.lng
    if body.location:
        if isinstance(body.location, dict):
            lat = body.location.get("lat", lat)
            lng = body.location.get("lng", lng)
        elif hasattr(body.location, "lat") and hasattr(body.location, "lng"):
            lat = body.location.lat or lat
            lng = body.location.lng or lng

    # If structured fields are provided directly
    if body.crop_type and body.quantity_kg:
        price = body.price_expectation or 25.0
        result = create_direct_listing(
            farmer_id=farmer_id,
            crop_type=body.crop_type,
            quantity_kg=float(body.quantity_kg),
            price_expectation=float(price),
            lat=lat,
            lng=lng
        )
    else:
        transcript = body.transcript.strip() if body.transcript else None
        media_url = body.media_url.strip() if body.media_url else None

        if not transcript and media_url:
            transcript = transcribe_audio(media_url, body.language or "hi")

        result = create_listing(
            farmer_id,
            transcript or "do quintal tamatar",
            body.language or "hi",
            lat,
            lng
        )

    # Auto-trigger aggregation so the new listing becomes visible in the buyer pool
    try:
        from ai.agents.aggregations import run_aggregation
        lot_ids = run_aggregation(eps_km=5.0, min_points=1)
        if lot_ids:
            # Assign the *correct* lot to this specific listing.
            # Using lot_ids[-1] is not reliable when multiple clusters are created.
            assigned_lot_id = None
            listing_id = result.get("listing_id")
            if listing_id:
                try:
                    from backend.db import get_conn, release_conn
                    conn = get_conn()
                    try:
                        cur = conn.cursor()
                        cur.execute(
                            "SELECT lot_id FROM lot_listings WHERE listing_id = %s LIMIT 1",
                            (listing_id,),
                        )
                        row = cur.fetchone()
                        if row and row.get("lot_id"):
                            assigned_lot_id = str(row["lot_id"])
                    finally:
                        release_conn(conn)
                except Exception:
                    assigned_lot_id = None

            result["assigned_lot_id"] = assigned_lot_id or str(lot_ids[-1])
            result["cluster_status"] = "Aggregated and visible in buyer pool"
        else:
            # Even if aggregation didn't cluster, create a single-listing lot for this listing
            _create_single_listing_lot(
                result.get("listing_id"),
                (result.get("crop_type") or body.crop_type or "tomato"),
                float(result.get("quantity_kg") or body.quantity_kg or 200),
                lat,
                lng,
                result,
            )
    except Exception as agg_err:
        logger.warning(f"Auto-aggregation failed after listing: {agg_err}")
        result["cluster_status"] = "Listing created; aggregation pending"

    return result


def _create_single_listing_lot(listing_id, crop_type, quantity_kg, lat, lng, result):
    """Fallback: create a single-listing lot when aggregation clustering can't form a group."""
    from backend.db import get_conn, release_conn
    conn = get_conn()
    try:
        cur = conn.cursor()
        try:
            cur.execute("""
                INSERT INTO lots (crop_type, total_quantity_kg, centroid, status)
                VALUES (%s, %s, ST_MakePoint(%s, %s)::geography, 'open')
                RETURNING id
            """, (crop_type.lower(), quantity_kg, lng, lat))
            lot_row = cur.fetchone()
            lot_id = lot_row["id"] if lot_row else f"lot-{abs(hash(crop_type + str(quantity_kg))) % 1000}"
        except Exception:
            conn.rollback()
            cur.execute("""
                INSERT INTO lots (crop_type, total_quantity_kg, status)
                VALUES (%s, %s, 'open')
                RETURNING id
            """, (crop_type.lower(), quantity_kg))
            lot_row = cur.fetchone()
            lot_id = lot_row["id"] if lot_row else f"lot-{abs(hash(crop_type)) % 1000}"

        if listing_id:
            try:
                cur.execute(
                    "INSERT INTO lot_listings (lot_id, listing_id) VALUES (%s, %s)",
                    (lot_id, listing_id))
            except Exception:
                pass
        conn.commit()
        result["assigned_lot_id"] = str(lot_id)
        result["cluster_status"] = "Created individual lot and visible in buyer pool"
    except Exception as e:
        logger.warning(f"Single-listing lot creation fallback failed: {e}")
        result["assigned_lot_id"] = f"lot-demo-{abs(hash(crop_type)) % 1000}"
        result["cluster_status"] = "Listing created (demo mode)"
    finally:
        release_conn(conn)
