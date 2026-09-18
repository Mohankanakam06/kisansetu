import logging
import json
from datetime import datetime
from typing import Dict, Any, Optional

logger = logging.getLogger("kisansetu.trust_score")

# In-memory store for demo / mock resilience
FARMER_TRUST_DB: Dict[str, Dict[str, Any]] = {
    "farmer-01": {
        "farmer_id": "farmer-01",
        "farmer_name": "Rameshwar Sahu",
        "score": 84.5,
        "trust_tier": "HIGH_TRUST",
        "badge": "Gold Verified Producer",
        "instant_publish": True,
        "total_verifications": 14,
        "successful_verifications": 13,
        "disputes_count": 1,
        "history": [
            {
                "timestamp": "2026-03-01T10:00:00",
                "listing_id": "list-demo-01",
                "pregrade": "A",
                "physical_grade": "A",
                "size_delta_pct": 2.1,
                "score_delta": +2.2,
                "result": "MATCH"
            }
        ]
    },
    "farmer-02": {
        "farmer_id": "farmer-02",
        "farmer_name": "Suresh Patel",
        "score": 68.0,
        "trust_tier": "STANDARD_TRUST",
        "badge": "Silver Producer",
        "instant_publish": True,
        "total_verifications": 5,
        "successful_verifications": 4,
        "disputes_count": 1,
        "history": []
    },
    "farmer-low-trust": {
        "farmer_id": "farmer-low-trust",
        "farmer_name": "Flagged Account",
        "score": 34.0,
        "trust_tier": "LOW_TRUST_FLAGGED",
        "badge": "Inspection Required",
        "instant_publish": False,
        "total_verifications": 6,
        "successful_verifications": 2,
        "disputes_count": 4,
        "history": []
    }
}

def get_farmer_trust(farmer_id: str) -> Dict[str, Any]:
    """
    Retrieve current trust score and tier policy for a farmer.
    Defaults to 70.0 (Standard Trust) for new farmers.
    """
    if farmer_id in FARMER_TRUST_DB:
        return FARMER_TRUST_DB[farmer_id]

    # Baseline for new farmers
    new_profile = {
        "farmer_id": farmer_id,
        "farmer_name": "Verified Farmer",
        "score": 70.0,
        "trust_tier": "STANDARD_TRUST",
        "badge": "Silver Producer",
        "instant_publish": True,
        "total_verifications": 0,
        "successful_verifications": 0,
        "disputes_count": 0,
        "history": []
    }
    FARMER_TRUST_DB[farmer_id] = new_profile
    return new_profile

def calculate_trust_update(
    farmer_id: str,
    listing_id: str,
    pregrade_data: Dict[str, Any],
    physical_data: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Ticket 2.3: Dynamically updates farmer trust score on physical verification.
    ±5% tolerance delta awards score increment; larger discrepancies penalize proportionally.
    """
    profile = get_farmer_trust(farmer_id)
    current_score = profile["score"]

    pre_size = float(pregrade_data.get("estimated_size_cm", 6.0))
    phys_size = float(physical_data.get("estimated_size_cm", pre_size))

    size_delta_pct = abs(phys_size - pre_size) / max(0.1, pre_size) * 100.0
    pre_grade = pregrade_data.get("grade_estimate", "A")
    phys_grade = physical_data.get("grade_estimate", pre_grade)

    grade_match = (pre_grade == phys_grade)
    within_tolerance = size_delta_pct <= 5.0 and grade_match

    if within_tolerance:
        # Increment with diminishing returns near 100
        score_gain = round(3.5 * (1.0 - (current_score / 100.0)), 2)
        new_score = min(100.0, current_score + max(0.5, score_gain))
        verdict = "MATCH_VERIFIED"
        profile["successful_verifications"] += 1
    elif size_delta_pct <= 12.0:
        # Minor discrepancy
        new_score = max(10.0, current_score - 4.5)
        verdict = "MINOR_DISCREPANCY"
        profile["disputes_count"] += 1
    else:
        # Severe grade or size falsification
        penalty = 15.0 if grade_match else 25.0
        new_score = max(5.0, current_score - penalty)
        verdict = "FLAGGED_MISMATCH"
        profile["disputes_count"] += 1

    profile["score"] = round(new_score, 1)
    profile["total_verifications"] += 1

    # Update trust tier
    if profile["score"] >= 80.0:
        profile["trust_tier"] = "HIGH_TRUST"
        profile["badge"] = "Gold Verified Producer"
        profile["instant_publish"] = True
    elif profile["score"] >= 45.0:
        profile["trust_tier"] = "STANDARD_TRUST"
        profile["badge"] = "Silver Producer"
        profile["instant_publish"] = True
    else:
        profile["trust_tier"] = "LOW_TRUST_FLAGGED"
        profile["badge"] = "Pre-Inspection Required"
        profile["instant_publish"] = False

    history_entry = {
        "timestamp": datetime.now().isoformat(),
        "listing_id": listing_id,
        "pregrade": pre_grade,
        "physical_grade": phys_grade,
        "pre_size_cm": pre_size,
        "phys_size_cm": phys_size,
        "size_delta_pct": round(size_delta_pct, 2),
        "score_delta": round(new_score - current_score, 2),
        "result": verdict
    }
    profile["history"].insert(0, history_entry)
    if len(profile["history"]) > 20:
        profile["history"] = profile["history"][:20]

    return {
        "farmer_id": farmer_id,
        "previous_score": current_score,
        "new_score": profile["score"],
        "trust_tier": profile["trust_tier"],
        "badge": profile["badge"],
        "instant_publish": profile["instant_publish"],
        "within_tolerance": within_tolerance,
        "verdict": verdict,
        "size_delta_pct": round(size_delta_pct, 2),
        "history_entry": history_entry
    }
