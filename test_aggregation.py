from app.agents.aggregations import run_aggregation
from app.db import get_conn

def test_aggregation():
    lot_ids = run_aggregation(eps_km=3.0, min_points=2)
    print(f"Aggregation completed. Lots created: {len(lot_ids)}")
    print("Lot IDs:", lot_ids)

    # Check lots
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT * FROM lots;")
    lots = cur.fetchall()
    print(f"Lots in DB: {len(lots)}")
    for l in lots:
        print(f"  Lot ID: {l['id']}, Crop: {l['crop_type']}, Qty: {l['total_quantity_kg']}")

    # Check lot_listings
    cur.execute("SELECT * FROM lot_listings;")
    ll = cur.fetchall()
    print(f"Lot listings in DB: {len(ll)}")
    conn.close()

if __name__ == "__main__":
    test_aggregation()
