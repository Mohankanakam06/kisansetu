import logging
from datetime import datetime
from typing import Dict, Any, Optional
from backend.services.calibration_service import calibrate_and_measure_produce
from backend.services.trust_score_service import calculate_trust_update, get_farmer_trust
from ai.agents.settlement import process_payout

logger = logging.getLogger("kisansetu.phygital_service")

# In-memory storage for demo and mock resilience
LISTING_LIFECYCLE_DB: Dict[str, Dict[str, Any]] = {
    "list-demo-01": {
        "listing_id": "list-demo-01",
        "farmer_id": "farmer-01",
        "crop_type": "Tomato",
        "quantity_kg": 250,
        "grade_stage": "pregrade",
        "pregrade_result": {
            "grade_estimate": "A",
            "estimated_size_cm": 6.2,
            "color_calibrated_RGB": {"r": 220, "g": 40, "b": 35},
            "calibration_confidence": 0.95,
            "timestamp": "2026-03-08T10:00:00"
        },
        "physical_grade_result": None,
        "pickup_agent_id": None,
        "dispute_status": "NONE",
        "escrow_pickup_released": False,
        "escrow_final_released": False
    }
}

def register_pregrade(
    listing_id: str,
    farmer_id: str,
    crop_type: str,
    quantity_kg: float,
    image_base64: str,
    anti_fraud_data: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Stage 1: Farmer upload -> Runs Tier 1 AI pipeline -> Generates tentative pregrade.
    Marks listing grade_stage as 'pregrade' for DBSCAN clustering and buyer pre-orders.
    """
    calib = calibrate_and_measure_produce(image_base64, crop_type=crop_type)
    trust_profile = get_farmer_trust(farmer_id)

    pregrade_result = {
        "grade_estimate": calib.get("grade_estimate", "A"),
        "estimated_size_cm": calib.get("estimated_size_cm", 6.0),
        "color_calibrated_RGB": calib.get("color_calibrated_RGB", {"r": 210, "g": 45, "b": 30}),
        "calibration_confidence": calib.get("calibration_confidence", 0.90),
        "calibration_marker_detected": calib.get("calibration_marker_detected", False),
        "anti_fraud_summary": anti_fraud_data or {"status": "APPROVED"},
        "timestamp": datetime.now().isoformat()
    }

    record = {
        "listing_id": listing_id,
        "farmer_id": farmer_id,
        "crop_type": crop_type,
        "quantity_kg": quantity_kg,
        "grade_stage": "pregrade",
        "pregrade_result": pregrade_result,
        "physical_grade_result": None,
        "pickup_agent_id": None,
        "dispute_status": "NONE",
        "instant_publish": trust_profile["instant_publish"],
        "escrow_pickup_released": False,
        "escrow_final_released": False,
        "created_at": datetime.now().isoformat()
    }
    LISTING_LIFECYCLE_DB[listing_id] = record

    return {
        "listing_id": listing_id,
        "grade_stage": "pregrade",
        "pregrade_result": pregrade_result,
        "farmer_trust_tier": trust_profile["trust_tier"],
        "instant_publish": trust_profile["instant_publish"],
        "status": "VISIBLE_IN_AGGREGATION_POOL" if trust_profile["instant_publish"] else "HELD_FOR_INSPECTION"
    }

def verify_physical_pickup(
    listing_id: str,
    pickup_agent_id: str,
    agent_image_base64: str,
    order_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Stage 2: Driver / Agent scans produce on physical arrival.
    1. Measures physical produce properties with optical rig / camera.
    2. Compares physical result against farmer's pregrade_result.
    3. If within ±5% tolerance: locks final grade, triggers 50% escrow payout, increments trust score.
    4. If discrepancy > tolerance: flags dispute, halts escrow, decrements trust score.
    """
    record = LISTING_LIFECYCLE_DB.get(listing_id)
    if not record:
        # Generate mock record if not found in memory
        record = {
            "listing_id": listing_id,
            "farmer_id": "farmer-01",
            "crop_type": "Tomato",
            "quantity_kg": 200,
            "grade_stage": "pregrade",
            "pregrade_result": {
                "grade_estimate": "A",
                "estimated_size_cm": 6.2,
                "color_calibrated_RGB": {"r": 220, "g": 40, "b": 35},
                "calibration_confidence": 0.95
            },
            "pickup_agent_id": None,
            "dispute_status": "NONE",
            "escrow_pickup_released": False,
            "escrow_final_released": False
        }
        LISTING_LIFECYCLE_DB[listing_id] = record

    # Perform physical calibration measurement
    phys_calib = calibrate_and_measure_produce(agent_image_base64, crop_type=record["crop_type"])
    physical_grade_result = {
        "grade_estimate": phys_calib.get("grade_estimate", "A"),
        "estimated_size_cm": phys_calib.get("estimated_size_cm", 6.1),
        "color_calibrated_RGB": phys_calib.get("color_calibrated_RGB", {"r": 218, "g": 42, "b": 36}),
        "calibration_confidence": phys_calib.get("calibration_confidence", 0.98),
        "agent_id": pickup_agent_id,
        "verified_at": datetime.now().isoformat()
    }

    # Evaluate discrepancy and update farmer trust score
    trust_update = calculate_trust_update(
        farmer_id=record["farmer_id"],
        listing_id=listing_id,
        pregrade_data=record["pregrade_result"],
        physical_data=physical_grade_result
    )

    record["physical_grade_result"] = physical_grade_result
    record["pickup_agent_id"] = pickup_agent_id

    escrow_payout_details = None

    if trust_update["within_tolerance"]:
        # Passed verification
        record["grade_stage"] = "physical_verified"
        record["dispute_status"] = "RESOLVED_MATCH"
        record["escrow_pickup_released"] = True

        # Trigger Milestone Escrow: Tranche 1 (50% upfront disbursement)
        if order_id:
            try:
                escrow_payout_details = process_payout(order_id, stage="pickup")
            except Exception as e:
                logger.warning(f"Auto escrow payout error: {e}")
                escrow_payout_details = {"stage": "pickup", "tranche": "50%", "status": "partial_paid_simulated"}
        else:
            escrow_payout_details = {
                "stage": "pickup",
                "tranche": "50%",
                "status": "partial_paid",
                "message": "50% milestone escrow released to farmer UPI."
            }
    else:
        # Discrepancy > tolerance
        record["grade_stage"] = "disputed"
        record["dispute_status"] = "FLAGGED_DISCREPANCY"
        record["escrow_pickup_released"] = False

        escrow_payout_details = {
            "stage": "pickup",
            "tranche": "50%",
            "status": "HALTED_FOR_DISPUTE_REVIEW",
            "message": f"Escrow halted. Physical grade discrepancy: {trust_update['size_delta_pct']}% delta."
        }

    return {
        "listing_id": listing_id,
        "grade_stage": record["grade_stage"],
        "dispute_status": record["dispute_status"],
        "pregrade_result": record["pregrade_result"],
        "physical_grade_result": physical_grade_result,
        "tolerance_verified": trust_update["within_tolerance"],
        "size_delta_pct": trust_update["size_delta_pct"],
        "trust_score_update": trust_update,
        "milestone_escrow": escrow_payout_details
    }
