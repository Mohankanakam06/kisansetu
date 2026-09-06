from app.db import get_conn


def process_payout(order_id: str, stage: str):
    """
    Process payout to farmers for a fulfilled or picked-up order.
    Stage:
      - 'pickup': 50% upfront disbursement upon physical pickup
      - 'delivery': Final settlement (100%) upon verified delivery to buyer
    """
    conn = get_conn()
    cur = conn.cursor()

    cur.execute("SELECT id, quantity_kg, lot_id, status FROM orders WHERE id = %s", (order_id,))
    order = cur.fetchone()
    if not order:
        raise ValueError(f"Order {order_id} not found.")

    cur.execute("SELECT id, total_quantity_kg, crop_type FROM lots WHERE id = %s", (order["lot_id"],))
    lot = cur.fetchone()
    if not lot:
        raise ValueError(f"Lot {order['lot_id']} for order {order_id} not found.")

    # Pull market price from price_history or fallback to ₹20/kg
    cur.execute("""
        SELECT avg_price FROM price_history
        WHERE crop_type = %s
        ORDER BY date DESC LIMIT 1
    """, (lot["crop_type"],))
    p_row = cur.fetchone()
    unit_price = float(p_row["avg_price"]) if p_row and p_row["avg_price"] else 20.0

    order_qty = float(order["quantity_kg"])
    lot_total_qty = float(lot["total_quantity_kg"]) if float(lot["total_quantity_kg"]) > 0 else order_qty
    full_order_amount = order_qty * unit_price

    if stage == "pickup":
        disbursement_ratio = 0.5
        payment_status = "partial_paid"
        new_order_status = "picked_up"
    elif stage == "delivery":
        disbursement_ratio = 1.0
        payment_status = "settled"
        new_order_status = "delivered"
    else:
        disbursement_ratio = 1.0
        payment_status = f"stage_{stage}"
        new_order_status = stage

    # Fetch all farmers who contributed to this lot
    cur.execute("""
        SELECT li.farmer_id, li.quantity_kg
        FROM listings li
        JOIN lot_listings ll ON li.id = ll.listing_id
        WHERE ll.lot_id = %s
    """, (order["lot_id"],))
    farmer_listings = cur.fetchall()

    payments_created = []

    if farmer_listings:
        for fl in farmer_listings:
            farmer_id = fl["farmer_id"]
            farmer_share = float(fl["quantity_kg"]) / lot_total_qty
            farmer_amount = round(full_order_amount * farmer_share * disbursement_ratio, 2)

            cur.execute("""
                INSERT INTO payments (order_id, farmer_id, amount, status, paid_at)
                VALUES (%s, %s, %s, %s, now())
                RETURNING id, farmer_id, amount, status, paid_at
            """, (order_id, farmer_id, farmer_amount, payment_status))
            pay_row = cur.fetchone()
            payments_created.append({
                "payment_id": pay_row["id"],
                "farmer_id": pay_row["farmer_id"],
                "amount": float(pay_row["amount"]),
                "status": pay_row["status"],
            })
    else:
        # Fallback single farmer query
        single_amount = round(full_order_amount * disbursement_ratio, 2)
        cur.execute("""
            INSERT INTO payments (order_id, farmer_id, amount, status, paid_at)
            VALUES (%s, (SELECT id FROM users WHERE role = 'farmer' LIMIT 1), %s, %s, now())
            RETURNING id, farmer_id, amount, status, paid_at
        """, (order_id, single_amount, payment_status))
        pay_row = cur.fetchone()
        payments_created.append({
            "payment_id": pay_row["id"],
            "farmer_id": pay_row["farmer_id"],
            "amount": float(pay_row["amount"]),
            "status": pay_row["status"],
        })

    cur.execute("UPDATE orders SET status = %s WHERE id = %s", (new_order_status, order_id))
    conn.commit()
    conn.close()

    return {
        "order_id": order_id,
        "stage": stage,
        "order_status": new_order_status,
        "unit_price_inr": round(unit_price, 2),
        "total_order_amount_inr": round(full_order_amount, 2),
        "disbursed_total_inr": sum(p["amount"] for p in payments_created),
        "payment_status": payment_status,
        "payments": payments_created,
    }
