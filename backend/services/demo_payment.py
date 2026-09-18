import os
import uuid
import datetime
import logging
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field

logger = logging.getLogger("kisansetu.demo_payment")

class DemoPaymentRequest(BaseModel):
    listing_id: Optional[str] = None
    lot_id: Optional[str] = None
    buyer_id: str = "buyer-01"
    farmer_id: Optional[str] = "farmer-01"
    crop_type: str
    quantity_kg: float = Field(gt=0)
    price_per_kg: float = Field(gt=0)
    total_amount: float = Field(gt=0)
    payment_method: str = "upi"  # upi, card, cod
    upi_id: Optional[str] = None
    card_last4: Optional[str] = None

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
        order_id = f"ORD_{uuid.uuid4().hex[:8].upper()}"
        timestamp = datetime.datetime.now(datetime.timezone.utc).isoformat()

        # Save to database if available, else log and simulate
        try:
            from backend.db import get_conn, release_conn
            conn = get_conn()
            if conn:
                try:
                    with conn.cursor() as cur:
                        cur.execute("""
                            INSERT INTO orders (id, lot_id, listing_id, buyer_id, farmer_id, crop_type, quantity_kg, price_per_kg, total_amount, payment_method, transaction_id, status)
                            VALUES (gen_random_uuid(), %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'paid')
                        """, (
                            req.lot_id if req.lot_id and len(req.lot_id) == 36 else None,
                            req.listing_id if req.listing_id and len(req.listing_id) == 36 else None,
                            req.buyer_id if len(req.buyer_id) == 36 else None,
                            req.farmer_id if req.farmer_id and len(req.farmer_id) == 36 else None,
                            req.crop_type,
                            req.quantity_kg,
                            req.price_per_kg,
                            req.total_amount,
                            req.payment_method,
                            transaction_id
                        ))
                    conn.commit()
                except Exception as db_err:
                    logger.warning("DB insert for demo order skipped/failed (using memory fallback): %s", db_err)
                finally:
                    release_conn(conn)
        except Exception as e:
            logger.info("Database pool not available for demo payment: %s", e)

        # Broadcast order placed via websockets if available
        try:
            from backend.websockets import manager as ws_manager
            ws_manager.emit_sync({
                "type": "order_placed",
                "order_id": order_id,
                "transaction_id": transaction_id,
                "buyer_id": req.buyer_id,
                "farmer_id": req.farmer_id,
                "crop_type": req.crop_type,
                "quantity_kg": req.quantity_kg,
                "total_amount": req.total_amount,
                "payment_method": req.payment_method,
                "status": "paid"
            })
        except Exception:
            pass

        return DemoPaymentResponse(
            success=True,
            transaction_id=transaction_id,
            order_id=order_id,
            amount=req.total_amount,
            status="escrow_locked" if req.payment_method != "cod" else "placed",
            timestamp=timestamp,
            message="KisanSetu Demo Escrow: Funds secured in virtual vault."
        )
