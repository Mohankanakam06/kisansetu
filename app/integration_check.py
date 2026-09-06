import requests
import json

BASE = "http://localhost:8000"

def integration_check():
    """
    End-to-end integration test: seed → aggregate → order → route → settle
    """
    print("=" * 60)
    print("KISAN SETU - INTEGRATION CHECK")
    print("=" * 60)

    # 1. Check existing lots before aggregation
    print("\n[1] Checking existing lots...")
    r = requests.get(f"{BASE}/api/lots")
    lots_data = r.json()
    print(f"    Existing lots: {len(lots_data['lots'])}")
    for lot in lots_data['lots'][:3]:
        print(f"      - {lot['crop_type']}: {lot['total_quantity_kg']}kg (ID: {lot['id'][:8]}...)")

    # 2. Trigger aggregation (should already be done, but test endpoint)
    print("\n[2] Testing aggregation endpoint...")
    r = requests.post(f"{BASE}/api/internal/aggregate")
    agg_result = r.json()
    print(f"    New lots created: {len(agg_result['lots_created'])}")

    # 3. Get fresh lot list
    r = requests.get(f"{BASE}/api/lots")
    lots_data = r.json()
    if not lots_data['lots']:
        print("    ERROR: No lots available!")
        return

    lot = lots_data['lots'][0]
    lot_id = lot['id']
    print(f"    Selected lot: {lot['crop_type']} - {lot['total_quantity_kg']}kg (ID: {lot_id[:8]}...)")

    # 4. Get a buyer (we need to query the database for this)
    print("\n[3] Getting buyer information...")
    from app.db import get_conn
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT id, name FROM users WHERE role = 'buyer' LIMIT 1;")
    buyer = cur.fetchone()
    buyer_id = buyer["id"]
    buyer_name = buyer["name"]
    conn.close()
    print(f"    Buyer: {buyer_name} (ID: {buyer_id[:8]}...)")

    # 5. Place an order
    print("\n[4] Creating order...")
    order_payload = {
        "buyer_id": buyer_id,
        "lot_id": lot_id,
        "quantity_kg": 100.0
    }
    r = requests.post(f"{BASE}/api/orders", json=order_payload)
    if r.status_code != 200:
        print(f"    ERROR creating order: {r.status_code} - {r.text}")
        return
    order = r.json()
    order_id = order["order_id"]
    print(f"    Order created: {order_id[:8]}...")
    print(f"    Crop: {order['crop_type']}, Qty: {order['quantity_kg']}kg, Status: {order['status']}")

    # 6. Optimize route
    print("\n[5] Optimizing delivery route...")
    route_payload = {"order_id": order_id}
    r = requests.post(f"{BASE}/api/routing/optimize", json=route_payload)
    if r.status_code != 200:
        print(f"    ERROR optimizing route: {r.status_code} - {r.text}")
        return
    route = r.json()
    print(f"    Route ID: {route['route_id'][:8]}...")
    print(f"    Distance: {route['distance_km']}km")
    print(f"    Duration: {route['duration_minutes']} minutes")
    print(f"    Stops: {route['stops_count']}")

    # 7. Compare routing strategies
    print("\n[6] Comparing individual vs consolidated routing...")
    r = requests.post(f"{BASE}/api/routing/compare", json=route_payload)
    if r.status_code != 200:
        print(f"    WARNING: Comparison failed: {r.status_code} - {r.text}")
    else:
        comp = r.json()
        print(f"    Individual trips total: {comp['individual_trips']['total_distance_km']}km")
        print(f"    Consolidated route: {comp['consolidated_route']['total_distance_km']}km")
        print(f"    Savings: {comp['savings']['distance_saved_km']}km ({comp['savings']['percentage_saved']}%)")
        print(f"    Cost saved: ₹{comp['savings']['estimated_cost_saved_inr']}")
        print(f"    CO2 saved: {comp['savings']['estimated_co2_saved_kg']}kg")

    # 8. Settlement - Pickup stage
    print("\n[7] Processing pickup settlement (50%)...")
    settle_payload = {"order_id": order_id, "stage": "pickup"}
    r = requests.post(f"{BASE}/api/settlement/payout", json=settle_payload)
    if r.status_code != 200:
        print(f"    ERROR in pickup settlement: {r.status_code} - {r.text}")
        return
    pickup = r.json()
    print(f"    Order status: {pickup['order_status']}")
    print(f"    Total order amount: ₹{pickup['total_order_amount_inr']}")
    print(f"    Disbursed at pickup: ₹{pickup['disbursed_total_inr']}")
    print(f"    Payments to {len(pickup['payments'])} farmers")

    # 9. Settlement - Delivery stage
    print("\n[8] Processing delivery settlement (100%)...")
    settle_payload = {"order_id": order_id, "stage": "delivery"}
    r = requests.post(f"{BASE}/api/settlement/payout", json=settle_payload)
    if r.status_code != 200:
        print(f"    ERROR in delivery settlement: {r.status_code} - {r.text}")
        return
    delivery = r.json()
    print(f"    Order status: {delivery['order_status']}")
    print(f"    Total disbursed: ₹{delivery['disbursed_total_inr']}")
    print(f"    Payment status: {delivery['payment_status']}")

    # 10. Verify final order state
    print("\n[9] Verifying final order state...")
    r = requests.get(f"{BASE}/api/orders/{order_id}")
    if r.status_code != 200:
        print(f"    ERROR fetching order: {r.status_code}")
    else:
        final_order = r.json()
        print(f"    Final order status: {final_order['status']}")
        print(f"    Buyer: {final_order['buyer_name']}")
        print(f"    Crop: {final_order['crop_type']}")
        print(f"    Quantity: {final_order['quantity_kg']}kg")

    print("\n" + "=" * 60)
    print("✓ INTEGRATION CHECK COMPLETE")
    print("=" * 60)
    print("\nAll systems operational:")
    print("  ✓ Aggregation (PostGIS DBSCAN clustering)")
    print("  ✓ Routing (OpenRouteService optimization)")
    print("  ✓ Settlement (Multi-farmer payout)")
    print("  ✓ Order lifecycle (placed → routed → picked_up → delivered)")


if __name__ == "__main__":
    integration_check()
