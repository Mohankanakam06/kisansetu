import os
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

router = APIRouter()

# Load credentials from environment variables. In production, ensure these are set via .env or hosting dashboard.
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "rzp_test_your_key_id")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "your_key_secret")

try:
    import razorpay
    client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
except Exception:
    razorpay = None
    client = None

class CreateOrderRequest(BaseModel):
    amount: float  # Amount in INR (e.g., 100.50)
    currency: str = "INR"
    receipt: str = "kisansetu_receipt_01"
    user_id: str

class VerifyPaymentRequest(BaseModel):
    order_id: str
    payment_id: str
    signature: str
    listing_id: str

@router.post("/create-order")
async def create_order(payload: CreateOrderRequest):
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
        # Fallback for development if no valid keys are provided
        if "BAD_REQUEST" in str(e) or "your_key_id" in RAZORPAY_KEY_ID:
             # Create a mock response for frontend UI testing
             import uuid
             mock_id = f"order_test_{uuid.uuid4().hex[:14]}"
             return {
                 "order_id": mock_id,
                 "amount": int(payload.amount * 100),
                 "currency": payload.currency,
                 "key_id": RAZORPAY_KEY_ID
             }
        raise HTTPException(status_code=500, detail=f"Payment Gateway Error: {str(e)}")

@router.post("/verify")
async def verify_payment(payload: VerifyPaymentRequest):
    try:
        # Check if keys are valid before verifying
        if "your_key_id" in RAZORPAY_KEY_ID:
             return {"status": "success", "message": "Mock verification successful (Test Mode)"}

        # Verify the payment signature to ensure the request came from Razorpay
        client.utility.verify_payment_signature({
            "razorpay_order_id": payload.order_id,
            "razorpay_payment_id": payload.payment_id,
            "razorpay_signature": payload.signature
        })

        # If signature is valid, update your database
        # Example: await db.execute("UPDATE orders SET status='paid' WHERE id=%s", payload.listing_id)

        return {"status": "success", "message": "Payment verified successfully"}
    except razorpay.errors.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid payment signature. Tampering detected.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
