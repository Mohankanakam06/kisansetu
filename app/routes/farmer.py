from fastapi import APIRouter
from app.agents.farmer_interface import transcribe_audio, create_listing

router = APIRouter()

@router.post("/api/farmer/listing")
def farmer_listing(body: dict):
    # body: {farmer_id, transcript, language, media_url, lat, lng}
    transcript = body.get("transcript")
    if not transcript and body.get("media_url"):
        transcript = transcribe_audio(body["media_url"], body.get("language", "hi"))

    lat, lng = body.get("lat", 22.6939), body.get("lng", 72.8618)

    return create_listing(
        body["farmer_id"],
        transcript or "do quintal tamatar",
        body.get("language", "hi"),
        lat,
        lng
    )
