from fastapi import APIRouter, Query, HTTPException
from typing import Optional
import logging

from backend.services.agmarknet import fetch_agmarknet_mandi_prices

router = APIRouter(prefix="/api/mandi", tags=["Mandi Prices"])
logger = logging.getLogger("mandi_routes")

@router.get("/prices")
def get_mandi_prices(
    commodity: Optional[str] = Query(None, description="Filter by commodity name (e.g., Tomato, Onion)"),
    state: Optional[str] = Query(None, description="Filter by state name"),
    district: Optional[str] = Query(None, description="Filter by district name"),
    market: Optional[str] = Query(None, description="Filter by market name"),
    limit: int = Query(50, ge=1, le=100, description="Number of records to fetch"),
    force_refresh: bool = Query(False, description="Bypass cache and fetch fresh data from Agmarknet API")
):
    """
    Fetch live or cached Mandi prices from Agmarknet.
    Returns standard benchmark reference prices as a fallback if the API is down or empty.
    """
    try:
        result = fetch_agmarknet_mandi_prices(
            commodity=commodity,
            state=state,
            district=district,
            market=market,
            limit=limit,
            force_refresh=force_refresh
        )
        return result
    except Exception as e:
        logger.error(f"Error fetching mandi prices: {e}", exc_info=True)
        # The service layer normally absorbs upstream failures and returns
        # benchmark fallbacks, so reaching here means both the live Agmarknet
        # feed and the fallback path failed. Give the caller something to act on.
        raise HTTPException(
            status_code=502,
            detail=(
                "Live mandi prices are temporarily unavailable (Agmarknet feed or cache failed). "
                "Retry in a moment; request cached data by setting force_refresh=false."
            ),
        )
