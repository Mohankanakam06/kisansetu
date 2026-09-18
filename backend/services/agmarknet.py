import os
import logging
import requests
from typing import Optional, List, Dict, Any
from datetime import datetime
from dotenv import load_dotenv
from backend.redis_client import get_cache, set_cache

load_dotenv()

logger = logging.getLogger("agmarknet_service")

AGMARKNET_RESOURCE_ID = os.getenv("AGMARKNET_RESOURCE_ID", "9ef84268-d588-465a-a308-a864a43d0070")
AGMARKNET_API_KEY = os.getenv("AGMARKNET_API_KEY", "")
AGMARKNET_BASE_URL = f"https://api.data.gov.in/resource/{AGMARKNET_RESOURCE_ID}"
CACHE_TTL_SECONDS = int(os.getenv("AGMARKNET_CACHE_TTL", "7200")) # 2 hours default

# Standard reference benchmarks (Rs/Kg) used when external government API is unreachable or has zero records for a region
DEFAULT_REFERENCE_BENCHMARKS: Dict[str, Dict[str, Any]] = {
    "tomato": {"modal_price_kg": 22.0, "min_price_kg": 18.0, "max_price_kg": 26.0, "variety": "Desi / Hybrid", "market": "Raipur APMC", "state": "Chhattisgarh"},
    "onion": {"modal_price_kg": 28.0, "min_price_kg": 24.0, "max_price_kg": 32.0, "variety": "Red / Nasik", "market": "Lasalgaon APMC", "state": "Maharashtra"},
    "potato": {"modal_price_kg": 18.0, "min_price_kg": 15.0, "max_price_kg": 22.0, "variety": "Jyoti / Local", "market": "Durg Mandi", "state": "Chhattisgarh"},
    "chilli": {"modal_price_kg": 65.0, "min_price_kg": 55.0, "max_price_kg": 75.0, "variety": "Guntur / Green", "market": "Tilda Mandi", "state": "Chhattisgarh"},
    "wheat": {"modal_price_kg": 26.0, "min_price_kg": 22.5, "max_price_kg": 28.5, "variety": "Sharbati / Lokwan", "market": "Indore Mandi", "state": "Madhya Pradesh"},
    "rice": {"modal_price_kg": 32.0, "min_price_kg": 28.0, "max_price_kg": 38.0, "variety": "HMT / Sona Masoori", "market": "Dhamtari APMC", "state": "Chhattisgarh"},
    "soybean": {"modal_price_kg": 44.0, "min_price_kg": 38.0, "max_price_kg": 48.0, "variety": "Yellow", "market": "Ujjain APMC", "state": "Madhya Pradesh"},
    "cotton": {"modal_price_kg": 72.0, "min_price_kg": 64.0, "max_price_kg": 78.0, "variety": "Medium Staple", "market": "Adilabad APMC", "state": "Telangana"},
}


def _safe_float(val: Any) -> float:
    """Safely parse numbers from strings/floats/ints, removing commas and invalid chars."""
    if val is None:
        return 0.0
    if isinstance(val, (int, float)):
        return float(val)
    try:
        cleaned = str(val).replace(",", "").strip()
        return float(cleaned)
    except (ValueError, TypeError):
        return 0.0


def _normalize_record(raw: Dict[str, Any]) -> Dict[str, Any]:
    """
    Normalizes Agmarknet records into a consistent internal schema.
    Prices from Agmarknet are in Rs/Quintal (1 Quintal = 100 Kg).
    """
    # Keys might have varying cases or whitespace in raw API
    keys_lower = {k.lower().strip(): v for k, v in raw.items()}

    commodity = str(keys_lower.get("commodity") or keys_lower.get("commodity_name") or "Produce").strip()
    state = str(keys_lower.get("state") or keys_lower.get("state_name") or "India").strip()
    district = str(keys_lower.get("district") or keys_lower.get("district_name") or "").strip()
    market = str(keys_lower.get("market") or keys_lower.get("market_name") or "Mandi Hub").strip()
    variety = str(keys_lower.get("variety") or "Standard").strip()
    grade = str(keys_lower.get("grade") or "FAQ").strip()

    # Raw arrival date or price date
    arrival_date = str(keys_lower.get("arrival_date") or keys_lower.get("price_date") or datetime.now().strftime("%d/%m/%Y")).strip()

    # Parse prices in Rs/Quintal
    min_price_q = _safe_float(keys_lower.get("min_price") or keys_lower.get("min_price_rs_quintal"))
    max_price_q = _safe_float(keys_lower.get("max_price") or keys_lower.get("max_price_rs_quintal"))
    modal_price_q = _safe_float(keys_lower.get("modal_price") or keys_lower.get("modal_price_rs_quintal"))

    # If modal price is 0 but min/max are present, compute average
    if modal_price_q <= 0 and (min_price_q > 0 or max_price_q > 0):
        modal_price_q = (min_price_q + max_price_q) / 2.0 if (min_price_q > 0 and max_price_q > 0) else (min_price_q or max_price_q)

    # Convert Rs/Quintal to Rs/Kg (1 Quintal = 100 Kg)
    min_price_kg = round(min_price_q / 100.0, 2) if min_price_q > 0 else 0.0
    max_price_kg = round(max_price_q / 100.0, 2) if max_price_q > 0 else 0.0
    modal_price_kg = round(modal_price_q / 100.0, 2) if modal_price_q > 0 else 0.0

    return {
        "commodity": commodity,
        "state": state,
        "district": district,
        "market": market,
        "variety": variety,
        "grade": grade,
        "min_price": min_price_q,
        "max_price": max_price_q,
        "modal_price": modal_price_q,
        "min_price_kg": min_price_kg,
        "max_price_kg": max_price_kg,
        "modal_price_kg": modal_price_kg,
        "price_date": arrival_date,
    }


def fetch_agmarknet_mandi_prices(
    commodity: Optional[str] = None,
    state: Optional[str] = None,
    district: Optional[str] = None,
    market: Optional[str] = None,
    limit: int = 50,
    force_refresh: bool = False
) -> Dict[str, Any]:
    """
    Fetches real-time or cached Mandi price records from Agmarknet (data.gov.in).
    Guaranteed not to throw an unhandled exception or 500 on network/timeout failure.
    """
    clean_commodity = commodity.strip() if commodity else ""
    clean_state = state.strip() if state else ""
    clean_district = district.strip() if district else ""
    clean_market = market.strip() if market else ""

    cache_key = f"agmarknet:{clean_commodity.lower()}:{clean_state.lower()}:{clean_district.lower()}:{clean_market.lower()}:{limit}"

    # 1. Check cache first unless forced refresh
    if not force_refresh:
        cached_data = get_cache(cache_key)
        if cached_data:
            cached_data["cached"] = True
            return cached_data

    # 2. Build API Request
    params: Dict[str, Any] = {
        "api-key": AGMARKNET_API_KEY,
        "format": "json",
        "limit": min(limit, 100),
    }

    if clean_commodity and clean_commodity.lower() != "all":
        params["filters[commodity]"] = clean_commodity
    if clean_state and clean_state.lower() != "all":
        params["filters[state]"] = clean_state
    if clean_district:
        params["filters[district]"] = clean_district
    if clean_market:
        params["filters[market]"] = clean_market

    headers = {
        "User-Agent": "KisanSetu-AgriPlatform/1.0 (Direct-to-Market Agri Platform; support@kisansetu.in)",
        "Accept": "application/json"
    }

    try:
        logger.info("Calling Agmarknet API: %s with params %s", AGMARKNET_BASE_URL, {k: v for k, v in params.items() if k != "api-key"})
        response = requests.get(
            AGMARKNET_BASE_URL,
            params=params,
            headers=headers,
            timeout=8.0
        )

        if response.status_code == 200:
            data = response.json()
            raw_records = data.get("records", [])
            normalized_records = [_normalize_record(r) for r in raw_records]

            result = {
                "success": True,
                "count": len(normalized_records),
                "total_available": data.get("total", len(normalized_records)),
                "records": normalized_records,
                "last_updated": data.get("updated_date") or datetime.now().isoformat(),
                "source": "Agmarknet (data.gov.in)",
                "cached": False,
                "is_fallback": False,
            }

            # Save to cache with TTL
            set_cache(cache_key, result, ttl_seconds=CACHE_TTL_SECONDS)
            return result
        else:
            logger.warning("Agmarknet returned status code %s: %s", response.status_code, response.text[:200])
    except Exception as e:
        logger.error("Agmarknet API request failed: %s", str(e))

    # 3. Fallback Handling
    fallback_records: List[Dict[str, Any]] = []
    if clean_commodity and clean_commodity.lower() != "all":
        crop_key = clean_commodity.lower()
        matched_key = next((k for k in DEFAULT_REFERENCE_BENCHMARKS if k in crop_key or crop_key in k), None)
        if matched_key:
            bench = DEFAULT_REFERENCE_BENCHMARKS[matched_key]
            fallback_records.append({
                "commodity": clean_commodity.capitalize(),
                "state": clean_state or bench["state"],
                "district": clean_district or "Benchmark Hub",
                "market": clean_market or bench["market"],
                "variety": bench["variety"],
                "grade": "FAQ",
                "min_price": bench["min_price_kg"] * 100.0,
                "max_price": bench["max_price_kg"] * 100.0,
                "modal_price": bench["modal_price_kg"] * 100.0,
                "min_price_kg": bench["min_price_kg"],
                "max_price_kg": bench["max_price_kg"],
                "modal_price_kg": bench["modal_price_kg"],
                "price_date": datetime.now().strftime("%d/%m/%Y"),
            })
    else:
        # Return all default reference benchmarks so general mandi queries always have rich data
        for crop_name, bench in DEFAULT_REFERENCE_BENCHMARKS.items():
            fallback_records.append({
                "commodity": crop_name.capitalize(),
                "state": clean_state or bench["state"],
                "district": clean_district or "Benchmark Hub",
                "market": clean_market or bench["market"],
                "variety": bench["variety"],
                "grade": "FAQ",
                "min_price": bench["min_price_kg"] * 100.0,
                "max_price": bench["max_price_kg"] * 100.0,
                "modal_price": bench["modal_price_kg"] * 100.0,
                "min_price_kg": bench["min_price_kg"],
                "max_price_kg": bench["max_price_kg"],
                "modal_price_kg": bench["modal_price_kg"],
                "price_date": datetime.now().strftime("%d/%m/%Y"),
            })

    fallback_result = {
        "success": True,
        "count": len(fallback_records),
        "total_available": len(fallback_records),
        "records": fallback_records,
        "last_updated": datetime.now().isoformat(),
        "source": "Agmarknet Benchmark Fallback",
        "cached": False,
        "is_fallback": True,
        "note": "Live API temporarily unavailable or no transactions logged for this combination today. Showing benchmark reference price."
    }

    return fallback_result
