import logging
from backend.db import get_conn, release_conn

logger = logging.getLogger("kisansetu.settlement")


def process_payout(order_id: str, stage: str):
    """
    Process payout to farmers for a fulfilled or picked-up order.
    Stage:
      - 'pickup': 40% / 50% upfront disbursement upon physical pickup
      - 'delivery': Final settlement (100%) upon verified delivery to buyer
    """
    conn = get_conn()
    try:
        cur = conn.cursor()

        cur.execute("SELECT id, quantity_kg, lot_id, status FROM orders WHERE id = %s", (order_id,))
        order = cur.fetchone()

        # If running in mock mode or order not found in DB
        if not order:
            logger.warning(f"DEMO MODE: Order '{order_id}' not found in database; generating synthetic payout calculation.")
            unit_price = 22.0
            order_qty = 2400.0
            full_order_amount = order_qty * unit_price
            disbursement_ratio = 0.4 if stage == "pickup" else 1.0
            payment_status = "partial_paid" if stage == "pickup" else "settled"
            new_order_status = "picked_up" if stage == "pickup" else "delivered"

            return {
                "order_id": order_id,
                "stage": stage,
                "order_status": new_order_status,
                "unit_price_inr": unit_price,
                "total_order_amount_inr": full_order_amount,
                "disbursed_total_inr": round(full_order_amount * disbursement_ratio, 2),
                "payment_status": payment_status,
                "utr_number": f"UTR-SBIN{abs(hash(order_id + stage)) % 1000000000:09d}",
                "demo_mode": True,
                "payments": [
                    {
                        "payment_id": f"pay-{abs(hash(order_id)) % 1000}",
                        "farmer_id": "farmer-01",
                        "farmer_name": "Ramesh Patel",
                        "amount": round(full_order_amount * disbursement_ratio * 0.6, 2),
                        "status": payment_status,
                    },
                    {
                        "payment_id": f"pay-{abs(hash(order_id) + 1) % 1000}",
                        "farmer_id": "farmer-02",
                        "farmer_name": "Suresh Verma",
                        "amount": round(full_order_amount * disbursement_ratio * 0.4, 2),
                        "status": payment_status,
                    }
                ],
            }

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

        # Update lot lifecycle for buyer pool visibility.
        # - pickup stage keeps lots in ordered state
        # - delivery stage marks lots delivered
        next_lot_status = "delivered" if stage == "delivery" else "ordered"
        cur.execute("UPDATE lots SET status = %s WHERE id = %s", (next_lot_status, order["lot_id"]))

        conn.commit()

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
    finally:
        release_conn(conn)
