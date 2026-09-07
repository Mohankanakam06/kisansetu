import uuid
import time
import jwt
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from backend.db import get_conn

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

SECRET_KEY = "kisansetu-sih-26033-supersecret-jwt-key"
ALGORITHM = "HS256"

# In-memory OTP storage for demo/dev: { "phone": {"otp": "123456", "expires_at": timestamp} }
OTP_STORE = {}

class SendOtpRequest(BaseModel):
    phone: str
    role: Optional[str] = "farmer"

class VerifyOtpRequest(BaseModel):
    phone: str
    otp: str
    role: Optional[str] = "farmer"

class RegisterRequest(BaseModel):
    name: str
    phone: str
    role: str
    language: Optional[str] = "hi"
    location: Optional[str] = ""
    lat: Optional[float] = 21.2514
    lng: Optional[float] = 81.6296
    aadhaar: Optional[str] = None


@router.post("/send-otp")
def send_otp(req: SendOtpRequest):
    """Generate and send a 6-digit OTP to the user's mobile number."""
    clean_phone = req.phone.strip().replace(" ", "").replace("+91", "")
    if len(clean_phone) != 10 or not clean_phone.isdigit():
        raise HTTPException(status_code=400, detail="Invalid 10-digit mobile number")

    # In production with SMS gateway (Fast2SMS / Twilio), generate random 6-digit OTP.
    # For robust demo and offline development, default to 123456 with fallback.
    otp_code = "123456"
    OTP_STORE[clean_phone] = {
        "otp": otp_code,
        "expires_at": time.time() + 600,  # 10 minutes
        "role": req.role
    }

    return {
        "success": True,
        "message": f"OTP sent successfully to +91 {clean_phone}",
        "phone": clean_phone,
        "otp_debug": otp_code
    }


@router.post("/verify-otp")
def verify_otp(req: VerifyOtpRequest):
    """Verify 6-digit OTP and issue JWT session token."""
    clean_phone = req.phone.strip().replace(" ", "").replace("+91", "")
    stored = OTP_STORE.get(clean_phone)

    # Validate OTP (accept stored OTP or standard demo OTP '123456')
    if req.otp != "123456":
        if not stored or stored["otp"] != req.otp or stored["expires_at"] < time.time():
            raise HTTPException(status_code=400, detail="Invalid or expired OTP code")

    conn = get_conn()
    cur = conn.cursor()

    # Look up user in database
    cur.execute("SELECT id, name, phone, role, language_pref FROM users WHERE phone = %s", (clean_phone,))
    user = cur.fetchone()

    # Auto-provision demo user if not already present
    if not user:
        user_id = str(uuid.uuid4())
        role = req.role or "farmer"
        default_name = "Farmer User" if role == "farmer" else "Agro Buyer"
        cur.execute("""
            INSERT INTO users (id, name, phone, role, language_pref, location)
            VALUES (%s, %s, %s, %s, 'hi', ST_SetSRID(ST_MakePoint(81.6296, 21.2514), 4326))
            RETURNING id, name, phone, role, language_pref
        """, (user_id, default_name, clean_phone, role))
        user = cur.fetchone()
        conn.commit()

    conn.close()

    # Create JWT Token
    payload = {
        "sub": str(user["id"]),
        "name": user["name"],
        "phone": user["phone"],
        "role": user["role"],
        "exp": int(time.time()) + 86400 * 7 # 7 days validity
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

    return {
        "success": True,
        "token": token,
        "user": {
            "id": str(user["id"]),
            "name": user["name"],
            "phone": user["phone"],
            "role": user["role"],
            "language_pref": user.get("language_pref", "hi")
        },
        "redirect": f"/{user['role']}"
    }


@router.post("/register")
def register_user(req: RegisterRequest):
    """Register a new user (Farmer or Buyer)."""
    clean_phone = req.phone.strip().replace(" ", "").replace("+91", "")
    if len(clean_phone) != 10 or not clean_phone.isdigit():
        raise HTTPException(status_code=400, detail="Invalid 10-digit mobile number")

    if req.role not in ["farmer", "buyer"]:
        raise HTTPException(status_code=400, detail="Role must be either 'farmer' or 'buyer'")

    lat = req.lat or 21.2514
    lng = req.lng or 81.6296

    conn = get_conn()
    cur = conn.cursor()

    # Check if user already exists
    cur.execute("SELECT id FROM users WHERE phone = %s", (clean_phone,))
    existing = cur.fetchone()
    if existing:
        # Update existing user details
        cur.execute("""
            UPDATE users
            SET name = %s, role = %s, language_pref = %s, location = ST_SetSRID(ST_MakePoint(%s, %s), 4326)
            WHERE phone = %s
            RETURNING id, name, phone, role, language_pref
        """, (req.name, req.role, req.language or "hi", lng, lat, clean_phone))
        user = cur.fetchone()
    else:
        user_id = str(uuid.uuid4())
        cur.execute("""
            INSERT INTO users (id, name, phone, role, language_pref, location)
            VALUES (%s, %s, %s, %s, %s, ST_SetSRID(ST_MakePoint(%s, %s), 4326))
            RETURNING id, name, phone, role, language_pref
        """, (user_id, req.name, clean_phone, req.role, req.language or "hi", lng, lat))
        user = cur.fetchone()

    conn.commit()
    conn.close()

    # Generate JWT for seamless onboarding
    payload = {
        "sub": str(user["id"]),
        "name": user["name"],
        "phone": user["phone"],
        "role": user["role"],
        "exp": int(time.time()) + 86400 * 7
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

    return {
        "success": True,
        "message": "User registered successfully",
        "token": token,
        "user": {
            "id": str(user["id"]),
            "name": user["name"],
            "phone": user["phone"],
            "role": user["role"],
            "language_pref": user.get("language_pref", "hi")
        },
        "redirect": f"/{user['role']}"
    }


@router.get("/me")
def get_current_user(authorization: Optional[str] = Header(None)):
    """Get current logged-in user details from JWT token."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")

    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user_id = payload.get("sub")
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT id, name, phone, role, language_pref FROM users WHERE id = %s", (user_id,))
    user = cur.fetchone()
    conn.close()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "user": {
            "id": str(user["id"]),
            "name": user["name"],
            "phone": user["phone"],
            "role": user["role"],
            "language_pref": user.get("language_pref", "hi")
        }
    }
