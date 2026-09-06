from app.db import get_conn
from app.agents.routing import optimize_route, compare_individual_vs_consolidated
import uuid

def test_routing():
    conn = get_conn()
    cur = conn.cursor()

    # Get a buyer
    cur.execute("SELECT id FROM users WHERE role = 'buyer' LIMIT 1;")
    buyer = cur.fetchone()
    buyer_id = buyer["id"]

    # Get a lot with listings
    cur.execute("""
        SELECT l.id, l.crop_type, l.total_quantity_kg, count(ll.listing_id) as stop_count
        FROM lots l
        JOIN lot_listings ll ON l.id = ll.lot_id
        GROUP BY l.id, l.crop_type, l.total_quantity_kg
        HAVING count(ll.listing_id) >= 2
        LIMIT 1;
    """)
    lot = cur.fetchone()
    if not lot:
        print("No lot with >= 2 listings found. Taking first lot.")
        cur.execute("SELECT id, crop_type, total_quantity_kg FROM lots LIMIT 1;")
        lot = cur.fetchone()

    lot_id = lot["id"]
    print(f"Testing with Buyer: {buyer_id}, Lot: {lot_id} ({lot['crop_type']})")

    # Create a test order
    cur.execute("""
        INSERT INTO orders (buyer_id, lot_id, quantity_kg, status)
        VALUES (%s, %s, %s, 'placed')
        RETURNING id
    """, (buyer_id, lot_id, 50))
    order_id = cur.fetchone()["id"]
    conn.commit()
    conn.close()

    print(f"Created order: {order_id}")

    # Test optimize_route
    print("\n--- Testing optimize_route ---")
    route_res = optimize_route(str(order_id))
    print("Route ID:", route_res["route_id"])
    print("Distance:", route_res["distance_km"], "km")
    print("Duration:", route_res["duration_minutes"], "min")
    print("Stops:", route_res["stops_count"])

    # Test compare_individual_vs_consolidated
    print("\n--- Testing compare_individual_vs_consolidated ---")
    comp_res = compare_individual_vs_consolidated(str(order_id))
    print("Individual Total Distance:", comp_res["individual_trips"]["total_distance_km"], "km")
    print("Consolidated Distance:", comp_res["consolidated_route"]["total_distance_km"], "km")
    print("Distance Saved:", comp_res["savings"]["distance_saved_km"], "km", f"({comp_res['savings']['percentage_saved']}%)")
    print("Cost Saved (₹):", comp_res["savings"]["estimated_cost_saved_inr"])
    print("CO2 Saved (kg):", comp_res["savings"]["estimated_co2_saved_kg"])

if __name__ == "__main__":
    test_routing()
