"""
Demo Scenario Cache for SIH 2026 Presentation
Caches a stable routing comparison to avoid live ORS calls during demo.
"""
import json
from pathlib import Path
from datetime import datetime

CACHE_DIR = Path(__file__).parent / "demo_cache"
CACHE_DIR.mkdir(exist_ok=True)

# Known-good demo scenario from integration check
DEMO_SCENARIO = {
    "order_id": "7835ce1d-8c44-4a9e-b6df-7b6e0a8e3d5a",
    "timestamp": "2026-09-06T13:13:00Z",
    "lot": {
        "id": "50201d20-...",
        "crop_type": "onion",
        "total_quantity_kg": 479.0
    },
    "buyer": {
        "id": "59486018-...",
        "name": "Buyer 0"
    },
    "order": {
        "quantity_kg": 100.0,
        "status": "delivered"
    },
    "routing_comparison": {
        "order_id": "7835ce1d-8c44-4a9e-b6df-7b6e0a8e3d5a",
        "stops_count": 4,
        "individual_trips": {
            "total_distance_km": 37.52,
            "total_duration_minutes": 45.6
        },
        "consolidated_route": {
            "total_distance_km": 23.61,
            "total_duration_minutes": 28.7
        },
        "savings": {
            "distance_saved_km": 13.91,
            "percentage_saved": 37.1,
            "estimated_cost_saved_inr": 166.92,
            "estimated_co2_saved_kg": 2.09
        }
    },
    "settlement": {
        "total_order_amount_inr": 1932.84,
        "pickup_disbursement": 966.42,
        "delivery_disbursement": 1932.85,
        "farmers_paid": 4
    }
}


def cache_demo_scenario(order_id: str, comparison_result: dict, settlement_result: dict = None):
    """Save a routing comparison and settlement for demo replay."""
    cache_file = CACHE_DIR / f"demo_order_{order_id[:8]}.json"

    scenario = {
        "order_id": order_id,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "comparison": comparison_result
    }

    if settlement_result:
        scenario["settlement"] = settlement_result

    with open(cache_file, 'w') as f:
        json.dump(scenario, f, indent=2)

    print(f"✓ Demo scenario cached: {cache_file.name}")
    return cache_file


def load_demo_scenario(order_id: str = None):
    """
    Load cached demo scenario.
    If order_id is provided, load that specific scenario.
    Otherwise, load the most recent one.
    """
    if order_id:
        cache_file = CACHE_DIR / f"demo_order_{order_id[:8]}.json"
        if not cache_file.exists():
            return None
    else:
        cache_files = sorted(CACHE_DIR.glob("demo_order_*.json"), key=lambda p: p.stat().st_mtime, reverse=True)
        if not cache_files:
            return DEMO_SCENARIO  # Return hardcoded fallback
        cache_file = cache_files[0]

    with open(cache_file, 'r') as f:
        return json.load(f)


def print_demo_summary():
    """Print demo scenario summary for presentation."""
    demo = load_demo_scenario()

    print("\n" + "=" * 60)
    print("KISAN SETU — DEMO SCENARIO (CACHED)")
    print("=" * 60)
    print(f"\nOrder ID: {demo['order_id'][:8]}...")

    comp = demo.get('routing_comparison', demo.get('comparison', {}))
    print(f"\n🚚 ROUTING COMPARISON:")
    print(f"  Stops: {comp['stops_count']} farmers")
    print(f"  Individual trips: {comp['individual_trips']['total_distance_km']}km")
    print(f"  Consolidated route: {comp['consolidated_route']['total_distance_km']}km")
    print(f"\n💰 SAVINGS:")
    print(f"  Distance: {comp['savings']['distance_saved_km']}km ({comp['savings']['percentage_saved']}%)")
    print(f"  Cost: ₹{comp['savings']['estimated_cost_saved_inr']}")
    print(f"  CO₂: {comp['savings']['estimated_co2_saved_kg']}kg")

    if 'settlement' in demo:
        settle = demo['settlement']
        print(f"\n💸 SETTLEMENT:")
        print(f"  Total order: ₹{settle.get('total_order_amount_inr', settle.get('total_order_amount', 0))}")
        print(f"  Farmers paid: {settle.get('farmers_paid', settle.get('payments', [])).__len__() if isinstance(settle.get('farmers_paid', settle.get('payments')), list) else settle.get('farmers_paid', 0)}")
        print(f"  Pickup (50%): ₹{settle.get('pickup_disbursement', settle.get('disbursed_total_inr', 0))}")
        print(f"  Delivery (100%): ₹{settle.get('delivery_disbursement', settle.get('disbursed_total_inr', 0))}")

    print("\n" + "=" * 60)


if __name__ == "__main__":
    print_demo_summary()
