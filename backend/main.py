import os
import logging
from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
from backend import config
from backend.routes import lots, routing, settlement, farmer, orchestrator, quality, auth, mandi, pricing, anti_fraud, phygital
from backend.routes.auth import require_auth
from backend import payments, websockets
from backend.db import get_conn, release_conn

logger = logging.getLogger("kisansetu.main")

app = FastAPI(
    title="Kisan Setu - Direct-to-Market Agri Platform",
    description="SIH 2026 PS 26033 - Backend API for aggregation, routing, and settlement",
    version="1.0.0"
)


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Return FastAPI's crafted ``detail`` and mirror it into the error envelope.

    Keeping ``detail`` preserves the existing client/tests contract while the
    ``error`` object gives the frontend a stable shape to render.
    """
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "detail": exc.detail,
            "error": {
                "code": f"HTTP_{exc.status_code}",
                "message": exc.detail,
            },
        },
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Catch-all for unexpected errors.

    The traceback is logged server-side; the client gets a stable, actionable
    message rather than an internal error string that may leak implementation
    details or database schema.
    """
    logger.exception("Unhandled error on %s %s", request.method, request.url.path)
    message = (
        f"Something went wrong while handling {request.method} {request.url.path}. "
        "Please retry; if it keeps failing, report the action you were performing."
    )
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "detail": message,
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": message,
            },
        },
    )


# CORS middleware
cors_env = os.getenv("CORS_ORIGINS", "*")
if cors_env.strip() == "*":
    origins = ["*"]
else:
    origins = [orig.strip() for orig in cors_env.split(",") if orig.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, tags=["Authentication"])
app.include_router(lots.router, tags=["Lots & Aggregation"])
app.include_router(routing.router, tags=["Routing"])
app.include_router(settlement.router, tags=["Settlement"])
app.include_router(farmer.router, tags=["Farmer Interface"])
app.include_router(orchestrator.router, tags=["Orchestrator"])
app.include_router(quality.router, tags=["Quality Grading"])
app.include_router(mandi.router, tags=["Mandi Prices"])
app.include_router(pricing.router, tags=["Dynamic Pricing Engine"])
app.include_router(payments.router, prefix="/api/payments", tags=["Payments"])
app.include_router(payments.router, prefix="/api/payment", tags=["Payments"])
app.include_router(websockets.router, tags=["WebSockets"])
app.include_router(anti_fraud.router, tags=["Anti-Fraud Controls"])
app.include_router(phygital.router, tags=["Phygital Grading & Trust"])


# Health check
@app.get("/api/health")
@app.get("/health")
@app.get("/")
def health_check():
    return {
        "service": "Kisan Setu API",
        "status": "healthy",
        "endpoints": [
            "/api/lots",
            "/api/internal/aggregate",
            "/api/orders",
            "/api/routing/optimize",
            "/api/routing/compare",
            "/api/settlement/payout",
            "/api/auth/send-otp",
            "/api/auth/verify-otp",
            "/api/auth/register",
            "/api/auth/me",
            "/api/farmer/listing",
            "/api/orchestrator/query",
            "/api/quality/grade",
            "/api/mandi/prices",
            "/api/pricing/predict",
            "/api/pricing/dynamic-margin",
            "/api/pricing/historical-trends",
            "/api/pricing/ticker",
            "/api/payments/create-order",
            "/api/payments/verify"
        ]
    }


# Orders endpoint
class OrderCreate(BaseModel):
    buyer_id: str
    lot_id: str
    quantity_kg: float = Field(gt=0, description="Order quantity in kilograms; must be positive")


@app.post("/api/orders")
def create_order(order: OrderCreate, auth_payload: dict = Depends(require_auth)):
    """Create a new order for a lot."""
    if config.require_auth_enforced():
        # Trust the verified token, not the request body, for who is buying.
        if auth_payload.get("role") != "buyer":
            raise HTTPException(status_code=403, detail="Only buyer accounts can place orders.")
        buyer_id = auth_payload["sub"]
    else:
        buyer_id = order.buyer_id

    conn = get_conn()
    try:
        cur = conn.cursor()

        # Verify lot exists
        cur.execute("SELECT id, crop_type, total_quantity_kg, status FROM lots WHERE id = %s", (order.lot_id,))
        lot = cur.fetchone()
        if not lot:
            raise HTTPException(status_code=404, detail=f"Lot {order.lot_id} not found")
        if lot["status"] != "open":
            raise HTTPException(status_code=400, detail=f"Lot {order.lot_id} is not open for orders")

        # Verify buyer exists
        cur.execute("SELECT id FROM users WHERE id = %s AND role = 'buyer'", (buyer_id,))
        buyer = cur.fetchone()
        if not buyer:
            raise HTTPException(status_code=404, detail=f"Buyer {buyer_id} not found")

        # Create order
        cur.execute("""
            INSERT INTO orders (buyer_id, lot_id, quantity_kg, status)
            VALUES (%s, %s, %s, 'placed')
            RETURNING id, buyer_id, lot_id, quantity_kg, status, created_at
        """, (buyer_id, order.lot_id, order.quantity_kg))

        new_order = cur.fetchone()

        # Move lot out of buyer-visible state once an order is placed.
        cur.execute(
            "UPDATE lots SET status = 'ordered' WHERE id = %s AND status = 'open'",
            (order.lot_id,),
        )

        conn.commit()

        # Emit websocket broadcast
        try:
            from backend.websockets import manager as ws_manager
            ws_manager.emit_sync({
                "type": "order_placed",
                "order_id": new_order["id"],
                "buyer_id": new_order["buyer_id"],
                "lot_id": new_order["lot_id"],
                "crop_type": lot["crop_type"],
                "quantity_kg": float(new_order["quantity_kg"]),
                "status": new_order["status"]
            })
        except Exception:
            pass

        return {
            "order_id": new_order["id"],
            "buyer_id": new_order["buyer_id"],
            "lot_id": new_order["lot_id"],
            "crop_type": lot["crop_type"],
            "quantity_kg": float(new_order["quantity_kg"]),
            "status": new_order["status"],
            "created_at": str(new_order["created_at"])
        }
    finally:
        release_conn(conn)


@app.get("/api/orders")
def list_orders(auth_payload: dict = Depends(require_auth)):
    """List orders. With auth enforced, buyers only see their own orders."""
    conn = get_conn()
    try:
        cur = conn.cursor()
        query = """
            SELECT o.id, o.buyer_id, o.lot_id, o.quantity_kg, o.status, o.created_at,
                   l.crop_type, l.total_quantity_kg,
                   u.name AS buyer_name
            FROM orders o
            JOIN lots l ON o.lot_id = l.id
            LEFT JOIN users u ON o.buyer_id = u.id
        """
        params = ()
        if config.require_auth_enforced() and auth_payload.get("role") == "buyer":
            query += " WHERE o.buyer_id = %s"
            params = (auth_payload["sub"],)
        query += " ORDER BY o.created_at DESC"
        cur.execute(query, params)
        orders = cur.fetchall()
        return {
            "orders": [
                {
                    "id": o["id"],
                    "order_id": o["id"],
                    "buyer_id": o["buyer_id"],
                    "buyer_name": o["buyer_name"] or "Buyer",
                    "lot_id": o["lot_id"],
                    "crop_type": o["crop_type"],
                    "quantity_kg": float(o["quantity_kg"]),
                    "status": o["status"],
                    "created_at": str(o["created_at"])
                }
                for o in orders
            ]
        }
    finally:
        release_conn(conn)


@app.get("/api/orders/{order_id}")
def get_order(order_id: str, auth_payload: dict = Depends(require_auth)):
    """Get order details. With auth enforced, buyers can only read their own orders."""
    conn = get_conn()
    try:
        cur = conn.cursor()

        query = """
            SELECT o.id, o.buyer_id, o.lot_id, o.quantity_kg, o.status, o.created_at,
                   l.crop_type, l.total_quantity_kg,
                   u.name AS buyer_name
            FROM orders o
            JOIN lots l ON o.lot_id = l.id
            JOIN users u ON o.buyer_id = u.id
            WHERE o.id = %s
        """
        params = [order_id]
        if config.require_auth_enforced() and auth_payload.get("role") == "buyer":
            query += " AND o.buyer_id = %s"
            params.append(auth_payload["sub"])
        cur.execute(query, tuple(params))

        order = cur.fetchone()

        if not order:
            # Same message whether the order is missing or belongs to another
            # buyer, so the endpoint cannot be used to probe order IDs.
            raise HTTPException(status_code=404, detail=f"Order {order_id} not found")

        return {
            "order_id": order["id"],
            "buyer_id": order["buyer_id"],
            "buyer_name": order["buyer_name"],
            "lot_id": order["lot_id"],
            "crop_type": order["crop_type"],
            "quantity_kg": float(order["quantity_kg"]),
            "status": order["status"],
            "created_at": str(order["created_at"])
        }
    finally:
        release_conn(conn)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
