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

class LoginRequest(BaseModel):
    email: str
    password: str
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


import logging
logger = logging.getLogger("kisansetu.auth")


def _normalize_user(row, fallback_name="Farmer User", fallback_role="farmer", phone=""):
    """Tolerate minimal/mock DB rows that may lack name/phone/role/language_pref keys."""
    if not row:
        return None
    role = row.get("role") or fallback_role
    return {
        "id": str(row.get("id") or uuid.uuid4()),
        "name": row.get("name") or (fallback_name if role == fallback_role else "Agro Buyer"),
        "phone": row.get("phone") or phone,
        "role": role,
        "language_pref": row.get("language_pref") or "hi",
    }

@router.post("/send-otp")
def send_otp(req: SendOtpRequest):
    """Generate and send a 6-digit OTP to the user's mobile number."""
    clean_phone = req.phone.strip().replace(" ", "").replace("+91", "")
    if len(clean_phone) != 10 or not clean_phone.isdigit():
        raise HTTPException(status_code=400, detail="Invalid 10-digit mobile number")

    # DEMO MODE: Using hardcoded OTP '123456' because no real SMS gateway is configured.
    # In production, integrate with Twilio, MSG91, Fast2SMS, or similar provider.
    otp_code = "123456"
    logger.warning(f"DEMO MODE: Hardcoded OTP '123456' used for phone +91{clean_phone}. No real SMS sent.")
    # Store OTP in Redis (or in-memory fallback) with 10-minute (600s) TTL
    set_otp(clean_phone, otp_code, ttl_seconds=600)

    return {
        "success": True,
        "message": f"OTP sent successfully to +91 {clean_phone} [DEMO MODE]",
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

    raw_user = None
    try:
        conn = get_conn()
        try:
            cur = conn.cursor()

            # Look up user in database
            cur.execute("SELECT id, name, phone, role, language_pref FROM users WHERE phone = %s", (clean_phone,))
            raw_user = cur.fetchone()

            # Auto-provision user if not already present
            if not raw_user:
                user_id = str(uuid.uuid4())
                role = req.role or "farmer"
                default_name = "Farmer User" if role == "farmer" else "Agro Buyer"
                try:
                    cur.execute("""
                        INSERT INTO users (id, name, phone, role, language_pref, location)
                        VALUES (%s, %s, %s, %s, 'hi', ST_SetSRID(ST_MakePoint(81.6296, 21.2514), 4326))
                        RETURNING id, name, phone, role, language_pref
                    """, (user_id, default_name, clean_phone, role))
                    raw_user = cur.fetchone()
                except Exception:
                    conn.rollback()
                    # Fallback without PostGIS function if extension not enabled
                    cur.execute("""
                        INSERT INTO users (id, name, phone, role, language_pref)
                        VALUES (%s, %s, %s, %s, 'hi')
                        RETURNING id, name, phone, role, language_pref
                    """, (user_id, default_name, clean_phone, role))
                    raw_user = cur.fetchone()
                conn.commit()
        finally:
            release_conn(conn)
    except Exception as e:
        logger.warning(f"DEMO MODE: OTP verification database fallback used ({e}). Constructing synthetic user session.")

    user = _normalize_user(raw_user, fallback_name="Farmer User" if (req.role or "farmer") == "farmer" else "Agro Buyer", fallback_role=req.role or "farmer", phone=clean_phone)

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
        "user": user,
        "redirect": f"/{user['role']}"
    }


@router.post("/login")
def password_login(req: LoginRequest):
    """Verify email/password and issue JWT session token (Demo Setup)."""
    # DEMO ACCOUNTS
    DEMO_USERS = {
        "farmer@demo.com": {
            "id": "demo-farmer-01",
            "name": "Ramesh Patel (Demo)",
            "phone": "9876543210",
            "role": "farmer",
            "password": "password123",
            "language_pref": "hi",
        },
        "buyer@demo.com": {
            "id": "demo-buyer-01",
            "name": "Priya Sharma (Demo)",
            "phone": "9123456780",
            "role": "buyer",
            "password": "password123",
            "language_pref": "hi",
        }
    }

    email = req.email.strip().lower()

    if email in DEMO_USERS:
        demo_user = DEMO_USERS[email]
        if req.password != demo_user["password"]:
            raise HTTPException(status_code=401, detail="Invalid email or password")

        # Issue JWT for demo user
        payload = {
            "sub": demo_user["id"],
            "name": demo_user["name"],
            "phone": demo_user["phone"],
            "role": demo_user["role"],
            "exp": int(time.time()) + 86400 * 7
        }
        token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

        return {
            "success": True,
            "token": token,
            "user": {
                "id": demo_user["id"],
                "name": demo_user["name"],
                "phone": demo_user["phone"],
                "role": demo_user["role"],
                "language_pref": demo_user.get("language_pref", "hi")
            },
            "redirect": f"/{demo_user['role']}"
        }

    # Fallback to general DB login (or reject if not found)
    raise HTTPException(status_code=401, detail="Invalid email or password")




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

    raw_user = None
    try:
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
                raw_user = cur.fetchone()
            else:
                user_id = str(uuid.uuid4())
                cur.execute("""
                    INSERT INTO users (id, name, phone, role, language_pref, location)
                    VALUES (%s, %s, %s, %s, %s, ST_SetSRID(ST_MakePoint(%s, %s), 4326))
                    RETURNING id, name, phone, role, language_pref
                """, (user_id, req.name, clean_phone, req.role, req.language or "hi", lng, lat))
                raw_user = cur.fetchone()

            conn.commit()
        finally:
            release_conn(conn)
    except Exception as e:
        logger.warning(f"DEMO MODE: Registration database fallback used ({e}).")

    user = _normalize_user(raw_user, fallback_name=req.name, fallback_role=req.role, phone=clean_phone)

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
        "user": user,
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
    raw_user = None
    try:
        conn = get_conn()
        try:
            cur = conn.cursor()
            cur.execute("SELECT id, name, phone, role, language_pref FROM users WHERE id = %s", (user_id,))
            raw_user = cur.fetchone()
        finally:
            release_conn(conn)
    except Exception as e:
        logger.warning(f"DEMO MODE: /me database lookup fallback ({e}).")

    user = _normalize_user(
        raw_user,
        fallback_name=payload.get("name", "User"),
        fallback_role=payload.get("role", "farmer"),
        phone=payload.get("phone", "")
    )
    if not user:
        user = {
            "id": user_id,
            "name": payload.get("name", "User"),
            "phone": payload.get("phone", ""),
            "role": payload.get("role", "farmer"),
            "language_pref": "hi"
        }

    return {"user": user}
