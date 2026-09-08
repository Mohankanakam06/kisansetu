import os
import uuid
import time
import jwt
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from backend.db import get_conn, release_conn
from backend.redis_client import set_otp, get_otp, delete_otp

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

SECRET_KEY = os.getenv("JWT_SECRET", "kisansetu-sih-26033-supersecret-jwt-key")
ALGORITHM = "HS256"

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

    # For robust demo and live preview, generate standard 6-digit OTP
    otp_code = "123456"
    # Store OTP in Redis (or in-memory fallback) with 10-minute (600s) TTL
    set_otp(clean_phone, otp_code, ttl_seconds=600)

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
    stored_otp = get_otp(clean_phone)

    # Validate OTP (accept stored OTP or standard demo OTP '123456')
    if req.otp != "123456" and req.otp != stored_otp:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP code")

    # Clean up OTP after verification
    delete_otp(clean_phone)

    user = None
    try:
        conn = get_conn()
        try:
            cur = conn.cursor()

            # Look up user in database
            cur.execute("SELECT id, name, phone, role, language_pref FROM users WHERE phone = %s", (clean_phone,))
            user = cur.fetchone()

            # Auto-provision user if not already present
            if not user:
                user_id = str(uuid.uuid4())
                role = req.role or "farmer"
                default_name = "Farmer User" if role == "farmer" else "Agro Buyer"
                try:
                    cur.execute("""
                        INSERT INTO users (id, name, phone, role, language_pref, location)
                        VALUES (%s, %s, %s, %s, 'hi', ST_SetSRID(ST_MakePoint(81.6296, 21.2514), 4326))
                        RETURNING id, name, phone, role, language_pref
                    """, (user_id, default_name, clean_phone, role))
                    user = cur.fetchone()
                except Exception:
                    conn.rollback()
                    # Fallback without PostGIS function if extension not enabled
                    cur.execute("""
                        INSERT INTO users (id, name, phone, role, language_pref)
                        VALUES (%s, %s, %s, %s, 'hi')
                        RETURNING id, name, phone, role, language_pref
                    """, (user_id, default_name, clean_phone, role))
                    user = cur.fetchone()
                conn.commit()
        finally:
            release_conn(conn)
    except Exception:
        # Graceful fallback if database connection is unavailable
        user = {
            "id": str(uuid.uuid4()),
            "name": "Farmer User" if (req.role or "farmer") == "farmer" else "Agro Buyer",
            "phone": clean_phone,
            "role": req.role or "farmer",
            "language_pref": "hi"
        }

    if not user:
        user = {
            "id": str(uuid.uuid4()),
            "name": "Farmer User" if (req.role or "farmer") == "farmer" else "Agro Buyer",
            "phone": clean_phone,
            "role": req.role or "farmer",
            "language_pref": "hi"
        }

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
    try:
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
    finally:
        release_conn(conn)

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
    try:
        cur = conn.cursor()
        cur.execute("SELECT id, name, phone, role, language_pref FROM users WHERE id = %s", (user_id,))
        user = cur.fetchone()
    finally:
        release_conn(conn)

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
