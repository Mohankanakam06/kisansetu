from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ai.agents.farmer_interface import transcribe_audio, create_listing

router = APIRouter()


class FarmerListingRequest(BaseModel):
    farmer_id: str
    transcript: Optional[str] = None
    language: Optional[str] = "hi"
    media_url: Optional[str] = None
    lat: Optional[float] = 22.6939
    lng: Optional[float] = 72.8618


@router.post("/api/farmer/listing")
def farmer_listing(body: FarmerListingRequest):
    if not body.farmer_id or not body.farmer_id.strip():
        raise HTTPException(status_code=400, detail="farmer_id is required")

    transcript = body.transcript.strip() if body.transcript else None
    media_url = body.media_url.strip() if body.media_url else None

    if not transcript and not media_url:
        raise HTTPException(status_code=400, detail="transcript or media_url is required")

    if not transcript and media_url:
        transcript = transcribe_audio(media_url, body.language or "hi")

    lat = body.lat if body.lat is not None else 22.6939
    lng = body.lng if body.lng is not None else 72.8618

    return create_listing(
        body.farmer_id,
        transcript or "do quintal tamatar",
        body.language or "hi",
        lat,
        lng
    )
