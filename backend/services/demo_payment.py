import os
import uuid
import datetime
import logging
from typing import Optional
from fastapi import HTTPException
from pydantic import BaseModel, Field
from backend.db import get_conn, release_conn

logger = logging.getLogger("kisansetu.demo_payment")


class DemoPaymentRequest(BaseModel):
    listing_id: Optional[str] = None
    lot_id: Optional[str] = None
    buyer_id: str = "buyer-01"
    farmer_id: Optional[str] = "farmer-01"
    crop_type: str
    quantity_kg: float = Field(gt=0, description="Quantity in kg; must be positive")
    price_per_kg: float = Field(gt=0, description="Price per kg; must be positive")
    total_amount: float = Field(gt=0, description="Total amount in INR; must be positive")
    payment_method: str = "upi"  # upi, card, cod
    upi_id: Optional[str] = None
    card_last4: Optional[str] = None
    delivery_address: Optional[str] = "Agri Market Yard, Sector 4, Raipur"


class DemoPaymentResponse(BaseModel):
    success: bool
    transaction_id: str
    order_id: str
    amount: float
    status: str
    timestamp: str
    message: str


class DemoPaymentService:
    @staticmethod
    def process_checkout(req: DemoPaymentRequest) -> DemoPaymentResponse:
        txn_hex = uuid.uuid4().hex[:8].upper()
        transaction_id = f"TXN_KS_{txn_hex}"
        timestamp = datetime.datetime.now(datetime.timezone.utc).isoformat()

        # Resolve / normalize UUIDs for relational foreign keys
        buyer_uuid = None
        farmer_uuid = None
        listing_uuid = None
        lot_uuid = None

        if req.buyer_id:
            try:
                buyer_uuid = str(uuid.UUID(str(req.buyer_id)))
            except (ValueError, TypeError):
                # Deterministic synthetic UUID for demo buyer IDs
                buyer_uuid = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"buyer.{req.buyer_id}"))

        if req.farmer_id:
            try:
                farmer_uuid = str(uuid.UUID(str(req.farmer_id)))
            except (ValueError, TypeError):
                farmer_uuid = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"farmer.{req.farmer_id}"))

        if req.listing_id:
            try:
                listing_uuid = str(uuid.UUID(str(req.listing_id)))
            except (ValueError, TypeError):
                listing_uuid = None

        if req.lot_id:
            try:
                lot_uuid = str(uuid.UUID(str(req.lot_id)))
            except (ValueError, TypeError):
                lot_uuid = None

        conn = get_conn()
        order_db_id = None
        try:
            cur = conn.cursor()

            # 1. Ensure buyer user exists in users table
            if buyer_uuid:
                cur.execute("""
                    INSERT INTO users (id, name, phone, role)
                    VALUES (%s, 'Verified Buyer', %s, 'buyer')
                    ON CONFLICT (id) DO NOTHING
                """, (buyer_uuid, f"91{abs(hash(buyer_uuid)) % 100000000:08d}"))

            # 2. Ensure farmer user exists in users table
            if farmer_uuid:
                cur.execute("""
                    INSERT INTO users (id, name, phone, role)
                    VALUES (%s, 'Registered Farmer', %s, 'farmer')
                    ON CONFLICT (id) DO NOTHING
                """, (farmer_uuid, f"98{abs(hash(farmer_uuid)) % 100000000:08d}"))

            # 3. Create order record within the atomic transaction
            order_status = "placed" if req.payment_method == "cod" else "routed"
            cur.execute("""
                INSERT INTO orders (
                    id, lot_id, listing_id, buyer_id, quantity_kg, total_price,
                    payment_method, delivery_address, status
                )
                VALUES (
                    gen_random_uuid(), %s, %s, %s, %s, %s, %s, %s, %s
                )
                RETURNING id;
            """, (
                lot_uuid,
                listing_uuid,
                buyer_uuid,
                req.quantity_kg,
                req.total_amount,
                req.payment_method,
                req.delivery_address,
                order_status
            ))
            order_row = cur.fetchone()
            if not order_row:
                raise HTTPException(status_code=500, detail="Failed to create order in database.")

            order_db_id = str(order_row["id"])
            order_display_id = f"ORD_{order_db_id[:8].upper()}"

            # 4. Create payment record within the SAME atomic transaction
            payment_status = "pending" if req.payment_method == "cod" else "settled"
            cur.execute("""
                INSERT INTO payments (
                    id, order_id, farmer_id, buyer_id, amount, currency,
                    payment_method, status, transaction_id, paid_at
                )
                VALUES (
                    gen_random_uuid(), %s, %s, %s, %s, 'INR',
                    %s, %s, %s, %s
                );
            """, (
                order_db_id,
                farmer_uuid,
                buyer_uuid,
                req.total_amount,
                req.payment_method,
                payment_status,
                transaction_id,
                datetime.datetime.now(datetime.timezone.utc) if req.payment_method != "cod" else None
            ))

            # 5. Commit both operations atomically
            conn.commit()
            logger.info("Successfully committed order %s and payment %s to PostgreSQL.", order_db_id, transaction_id)
        except Exception as e:
            conn.rollback()
            logger.error("Database transaction failed during checkout: %s", e)
            raise HTTPException(status_code=500, detail=f"Database transaction error: {str(e)}")
        finally:
            release_conn(conn)

        # Broadcast order placed via websockets
        try:
            from backend.websockets import manager as ws_manager
            ws_manager.emit_sync({
                "type": "order_placed",
                "order_id": order_display_id,
                "order_db_id": order_db_id,
                "transaction_id": transaction_id,
                "buyer_id": req.buyer_id,
                "farmer_id": req.farmer_id,
                "crop_type": req.crop_type,
                "quantity_kg": req.quantity_kg,
                "total_amount": req.total_amount,
                "payment_method": req.payment_method,
                "status": "paid" if req.payment_method != "cod" else "placed"
            })
        except Exception:
            pass

        return DemoPaymentResponse(
            success=True,
            transaction_id=transaction_id,
            order_id=order_display_id or f"ORD_{uuid.uuid4().hex[:8].upper()}",
            amount=req.total_amount,
            status="escrow_locked" if req.payment_method != "cod" else "placed",
            timestamp=timestamp,
            message="KisanSetu Demo Escrow: Funds secured in virtual vault."
        )
