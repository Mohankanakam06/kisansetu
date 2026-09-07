from ai.agents.settlement import process_payout
from backend.db import get_conn
import json
import uuid

def test_settlement():
    conn = get_conn()
    cur = conn.cursor()

    # Get a lot
    cur.execute("SELECT id FROM lots LIMIT 1;")
    lot_id = cur.fetchone()["id"]

    # Get a buyer
    cur.execute("SELECT id FROM users WHERE role = 'buyer' LIMIT 1;")
    buyer_id = cur.fetchone()["id"]

    # Create dummy order for settlement test with valid status
    cur.execute("""
        INSERT INTO orders (buyer_id, lot_id, quantity_kg, status)
        VALUES (%s, %s, %s, 'placed')
        RETURNING id
    """, (buyer_id, lot_id, 100))
    order_id = cur.fetchone()["id"]
    conn.commit()
    conn.close()

    print(f"Testing Settlement for Order: {order_id}")

    print("\n--- Testing Pickup Stage (50%) ---")
    pickup_res = process_payout(str(order_id), stage="pickup")
    print(json.dumps(pickup_res, indent=2, default=str))
    print(f"\nDisbursed Total: {pickup_res['disbursed_total_inr']} INR")

    print("\n--- Testing Delivery Stage (100%) ---")
    delivery_res = process_payout(str(order_id), stage="delivery")
    print(json.dumps(delivery_res, indent=2, default=str))
    print(f"\nDisbursed Total: {delivery_res['disbursed_total_inr']} INR")

if __name__ == "__main__":
    test_settlement()
