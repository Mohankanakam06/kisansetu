import os
import logging
from fastapi import APIRouter, HTTPException, Request, Depends
from pydantic import BaseModel, Field
from backend import config
from backend.db import get_conn, release_conn
from backend.routes.auth import require_auth
from backend.services.demo_payment import DemoPaymentService, DemoPaymentRequest, DemoPaymentResponse

logger = logging.getLogger("kisansetu.payments")
router = APIRouter()

# Load credentials from environment variables. In production, ensure these are set via .env or hosting dashboard.
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "rzp_test_your_key_id")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "your_key_secret")

# True while the repo's placeholder values are still in place. Real gateway
# calls can never succeed with these, so the API refuses to pretend otherwise
# outside demo mode.
PLACEHOLDER_KEYS = "your_key_id" in RAZORPAY_KEY_ID or "your_key_secret" in RAZORPAY_KEY_SECRET

try:
    import razorpay
    client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
except Exception:
    razorpay = None
    client = None

class CreateOrderRequest(BaseModel):
    amount: float = Field(gt=0, description="Amount in INR (e.g., 100.50); must be positive")
    currency: str = "INR"
    receipt: str = "kisansetu_receipt_01"
    user_id: str

class VerifyPaymentRequest(BaseModel):
    order_id: str
    payment_id: str
    signature: str

@router.post("/create-order")
async def create_order(payload: CreateOrderRequest, auth_payload: dict = Depends(require_auth)):
    try:
        # Razorpay expects amount in paise (multiply by 100)
        amount_in_paise = int(payload.amount * 100)

        # Create an order in Razorpay's system
        order_response = client.order.create({
            "amount": amount_in_paise,
            "currency": payload.currency,
            "receipt": payload.receipt,
            "payment_capture": 1 # Auto-capture payment
        })

        return {
            "order_id": order_response.get("id"),
            "amount": amount_in_paise,
            "currency": payload.currency,
            "key_id": RAZORPAY_KEY_ID
        }
    except Exception as e:
        logger.error("Razorpay order creation failed: %s", e)
        # Only fake a gateway order when running the demo with placeholder keys.
        # A real deployment must never report a payment order that does not exist.
        if config.is_demo_mode() and (PLACEHOLDER_KEYS or client is None or "BAD_REQUEST" in str(e)):
            import uuid
            mock_id = f"order_test_{uuid.uuid4().hex[:14]}"
            logger.warning("DEMO MODE: returning mock Razorpay order %s; no real payment order was created.", mock_id)
            return {
                "order_id": mock_id,
                "amount": amount_in_paise,
                "currency": payload.currency,
                "key_id": RAZORPAY_KEY_ID,
                "demo": True,
            }
        raise HTTPException(status_code=502, detail="Payment gateway is unavailable. No payment was taken; please retry.")

@router.post("/verify")
async def verify_payment(payload: VerifyPaymentRequest, auth_payload: dict = Depends(require_auth)):
    is_test_mode = PLACEHOLDER_KEYS or client is None

    if is_test_mode:
        if not config.is_demo_mode():
            raise HTTPException(
                status_code=503,
                detail="Payment verification is not configured: Razorpay keys are missing. Payments cannot be accepted.",
            )
        logger.warning("DEMO MODE: Razorpay keys/SDK missing; skipping signature verification.")

    try:
        # Verify the payment signature to ensure the request came from Razorpay if not in test mode
        if not is_test_mode and client:
            client.utility.verify_payment_signature({
                "razorpay_order_id": payload.order_id,
                "razorpay_payment_id": payload.payment_id,
                "razorpay_signature": payload.signature
            })

        # If signature is valid (or bypassed in test mode), update your database.
        # NOTE: payload.order_id is Razorpay's order id, not our internal orders.id.
        # The two are not mapped yet, so this may update zero rows; log loudly so
        # a "verified" payment that marked no order is visible instead of silent.
        conn = get_conn()
        try:
            cur = conn.cursor()
            cur.execute("UPDATE orders SET status = 'paid' WHERE id = %s", (payload.order_id,))
            if getattr(cur, "rowcount", None) == 0:
                logger.error(
                    "Payment %s verified but no internal order matched razorpay order id %s; "
                    "order status was NOT updated. Persist a razorpay_order_id mapping.",
                    payload.payment_id, payload.order_id,
                )
            conn.commit()
            logger.info("Verified payment %s for order %s.", payload.payment_id, payload.order_id)
        except Exception as db_err:
            logger.error("DB update failed after payment verification for order %s: %s", payload.order_id, db_err)
            # We don't want to fail the user request if the DB write fails after successful payment, but we must log it.
        finally:
            release_conn(conn)

        return {"status": "success", "message": "Payment verified successfully"}
    except Exception as e:
        if razorpay and isinstance(e, razorpay.errors.SignatureVerificationError):
            raise HTTPException(status_code=400, detail="Invalid payment signature. Tampering detected.")
        logger.error(f"Payment verification exception: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Payment verification encountered an internal server error. Please retry or contact support.",
        )


@router.post("/demo-checkout", response_model=DemoPaymentResponse)
async def demo_checkout(payload: DemoPaymentRequest):
    """
    Isolated simulated payment and escrow gateway for demo & hackathon walkthroughs.
    Generates authentic transaction IDs, updates order & payment records,
    and returns immediate escrow verification.
    """
    return DemoPaymentService.process_checkout(payload)

