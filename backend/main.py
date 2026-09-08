import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from backend.routes import lots, routing, settlement, farmer, orchestrator, quality, auth
from backend import payments
from backend.db import get_conn, release_conn

app = FastAPI(
    title="Kisan Setu - Direct-to-Market Agri Platform",
    description="SIH 2026 PS 26033 - Backend API for aggregation, routing, and settlement",
    version="1.0.0"
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
app.include_router(payments.router, prefix="/api/payments", tags=["Payments"])


# Health check
@app.get("/")
def root():
    return {
        "service": "Kisan Setu API",
        "status": "running",
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
            "/api/farmer/listing"
        ]
    }


# Orders endpoint
class OrderCreate(BaseModel):
    buyer_id: str
    lot_id: str
    quantity_kg: float


@app.post("/api/orders")
def create_order(order: OrderCreate):
    """Create a new order for a lot."""
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
        cur.execute("SELECT id FROM users WHERE id = %s AND role = 'buyer'", (order.buyer_id,))
        buyer = cur.fetchone()
        if not buyer:
            raise HTTPException(status_code=404, detail=f"Buyer {order.buyer_id} not found")

        # Create order
        cur.execute("""
            INSERT INTO orders (buyer_id, lot_id, quantity_kg, status)
            VALUES (%s, %s, %s, 'placed')
            RETURNING id, buyer_id, lot_id, quantity_kg, status, created_at
        """, (order.buyer_id, order.lot_id, order.quantity_kg))

        new_order = cur.fetchone()
        conn.commit()

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
def list_orders():
    """List all orders."""
    conn = get_conn()
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT o.id, o.buyer_id, o.lot_id, o.quantity_kg, o.status, o.created_at,
                   l.crop_type, l.total_quantity_kg,
                   u.name AS buyer_name
            FROM orders o
            JOIN lots l ON o.lot_id = l.id
            LEFT JOIN users u ON o.buyer_id = u.id
            ORDER BY o.created_at DESC
        """)
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
def get_order(order_id: str):
    """Get order details."""
    conn = get_conn()
    try:
        cur = conn.cursor()

        cur.execute("""
            SELECT o.id, o.buyer_id, o.lot_id, o.quantity_kg, o.status, o.created_at,
                   l.crop_type, l.total_quantity_kg,
                   u.name AS buyer_name
            FROM orders o
            JOIN lots l ON o.lot_id = l.id
            JOIN users u ON o.buyer_id = u.id
            WHERE o.id = %s
        """, (order_id,))

        order = cur.fetchone()

        if not order:
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
