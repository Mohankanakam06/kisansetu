import logging
from typing import Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field

from backend.services.phygital_service import register_pregrade, verify_physical_pickup, LISTING_LIFECYCLE_DB
from backend.services.trust_score_service import get_farmer_trust
from backend.routes.auth import require_auth

logger = logging.getLogger("kisansetu.phygital_routes")
router = APIRouter()

class PregradeRegistrationRequest(BaseModel):
    listing_id: str
    farmer_id: str
    crop_type: str = "Tomato"
    quantity_kg: float = Field(default=100.0, gt=0, description="Quantity in kg; must be positive")
    image_base64: str
    anti_fraud_data: Optional[Dict[str, Any]] = None

class PhysicalPickupVerificationRequest(BaseModel):
    listing_id: str
    pickup_agent_id: str = "agent-driver-01"
    agent_image_base64: str
    order_id: Optional[str] = None

@router.post("/api/phygital/pregrade")
def pregrade_listing(body: PregradeRegistrationRequest, auth_payload: dict = Depends(require_auth)):
    """
    Ticket 2.1: Register Produce Pregrade via Tier 1 AI inspection.
    """
    try:
        return register_pregrade(
            listing_id=body.listing_id,
            farmer_id=body.farmer_id,
            crop_type=body.crop_type,
            quantity_kg=body.quantity_kg,
            image_base64=body.image_base64,
            anti_fraud_data=body.anti_fraud_data
        )
    except Exception as e:
        logger.error(f"Error registering pregrade: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to register produce pregrade. Please check image quality and retry.")

@router.post("/api/phygital/verify-pickup")
def verify_pickup(body: PhysicalPickupVerificationRequest, auth_payload: dict = Depends(require_auth)):
    """
    Ticket 2.1, 2.2, 2.3:
    Driver/Agent spot-check on physical pickup.
    - Measures physical size and color with optical calibration.
    - Validates within ±5% tolerance.
    - Releases 50% milestone escrow payout if matched.
    - Updates farmer trust score and tier dynamically.
    """
    try:
        return verify_physical_pickup(
            listing_id=body.listing_id,
            pickup_agent_id=body.pickup_agent_id,
            agent_image_base64=body.agent_image_base64,
            order_id=body.order_id
        )
    except Exception as e:
        logger.error(f"Error verifying physical pickup: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to verify physical pickup spot-check. Please check agent capture and retry.")

@router.get("/api/phygital/trust-profile/{farmer_id}")
def get_trust_profile(farmer_id: str, auth_payload: dict = Depends(require_auth)):
    """
    Ticket 2.3: Farmer dynamic trust score profile and verification audit trail.
    """
    try:
        return get_farmer_trust(farmer_id)
    except Exception as e:
        logger.error(f"Error fetching farmer trust: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to load farmer trust profile. Please retry.")

@router.get("/api/phygital/lifecycle/{listing_id}")
def get_lifecycle_status(listing_id: str, auth_payload: dict = Depends(require_auth)):
    """
    Get produce listing lifecycle stage (pregrade -> physical_verified / disputed).
    """
    record = LISTING_LIFECYCLE_DB.get(listing_id)
    if not record:
        raise HTTPException(status_code=404, detail="Listing lifecycle record not found")
    return record
