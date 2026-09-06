from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from app.routes import lots, routing, settlement
from app.db import get_conn

app = FastAPI(
    title="Kisan Setu - Direct-to-Market Agri Platform",
    description="SIH 2026 PS 26033 - Backend API for aggregation, routing, and settlement",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(lots.router, tags=["Lots & Aggregation"])
app.include_router(routing.router, tags=["Routing"])
app.include_router(settlement.router, tags=["Settlement"])


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
            "/api/settlement/payout"
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
    conn.close()

    return {
        "order_id": new_order["id"],
        "buyer_id": new_order["buyer_id"],
        "lot_id": new_order["lot_id"],
        "crop_type": lot["crop_type"],
        "quantity_kg": float(new_order["quantity_kg"]),
        "status": new_order["status"],
        "created_at": str(new_order["created_at"])
    }


@app.get("/api/orders/{order_id}")
def get_order(order_id: str):
    """Get order details."""
    conn = get_conn()
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
    conn.close()

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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
