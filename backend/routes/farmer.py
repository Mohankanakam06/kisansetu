from typing import Optional, Union, Dict, Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ai.agents.farmer_interface import transcribe_audio, create_listing

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
        return {
            "listing_id": f"list-{abs(hash(body.crop_type + str(body.quantity_kg))) % 10000}",
            "crop_type": body.crop_type.lower(),
            "quantity_kg": float(body.quantity_kg),
            "price_expectation": float(price),
            "location": {"lat": lat, "lng": lng},
            "status": "clustered"
        }

    transcript = body.transcript.strip() if body.transcript else None
    media_url = body.media_url.strip() if body.media_url else None

    if not transcript and media_url:
        transcript = transcribe_audio(media_url, body.language or "hi")

    return create_listing(
        farmer_id,
        transcript or "do quintal tamatar",
        body.language or "hi",
        lat,
        lng
    )
