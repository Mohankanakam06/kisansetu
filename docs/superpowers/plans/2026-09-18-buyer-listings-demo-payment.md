# Buyer Dashboard, Direct Farmer Listings & Isolated Demo Payment Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a direct farmer produce listing feed and an isolated, high-fidelity demo payment gateway on the KisanSetu Buyer Dashboard, complete with real-time sync, metric summary strip, and earthy agri-tech UI.

**Architecture:** 
- **Backend**: FastAPI REST endpoints `GET /api/farmer/listings` and `POST /api/payment/demo-checkout` backed by an isolated `DemoPaymentService` and WebSocket event broadcasting (`ws/orders`).
- **Frontend**: Next.js 16 App Router client component on `/buyer` with dual tabs for Direct Farmer Listings and Aggregated Wholesale Pools, top metric summary strip, responsive filters/sorts, `FarmerListingCard`, and a 4-step `DemoPaymentModal` generating authentic mock transaction IDs and updating order history.

**Tech Stack:** Next.js 16 (React 19, Tailwind CSS v4, Lucide Icons, Canvas Confetti), FastAPI, Python 3.11+, Pytest, WebSockets.

**Spec:** `docs/superpowers/specs/2026-09-18-buyer-listings-demo-payment-ui-design.md`

## Global Constraints
- Target WCAG AA color contrast, touch targets ≥ 44px on mobile devices.
- Earthy green and warm neutral theme (`#065F46`, `#047857`, `#F8FAFC`, `text-slate-900`, `border-slate-200`).
- Multi-lingual string support (`t("English", "हिन्दी", "छत्तीसगढ़ी")`) using `useLanguage()`.
- Isolated Demo Payment service cleanly decoupled in `backend/services/demo_payment.py` and `src/services/demoPayment.ts`.
- Zero TypeScript compiler errors (`npx tsc --noEmit`) and zero test failures in pytest.

---

### Task 1: Backend Isolated Demo Payment Service & Endpoint (`POST /api/payment/demo-checkout`)

**Files:**
- Create: `backend/services/demo_payment.py`
- Modify: `backend/payments.py`
- Modify: `backend/main.py`
- Test: `backend/tests/test_demo_payment.py`

**Interfaces:**
- Produces: `POST /api/payment/demo-checkout` taking `DemoPaymentRequest` payload and returning `DemoPaymentResponse`.
- Consumes: `backend.db.get_conn`, `backend.websockets.broadcast_order_update`.

- [ ] **Step 1: Write the failing test**

Create `backend/tests/test_demo_payment.py`:
```python
import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_demo_payment_checkout_upi_success():
    payload = {
        "listing_id": "list-101",
        "buyer_id": "buyer-01",
        "farmer_id": "farmer-01",
        "crop_type": "Tomato",
        "quantity_kg": 500,
        "price_per_kg": 22.0,
        "total_amount": 11000.0,
        "payment_method": "upi",
        "upi_id": "buyer@okhdfcbank"
    }
    response = client.post("/api/payment/demo-checkout", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["transaction_id"].startswith("TXN_KS_")
    assert data["order_id"].startswith("ORD_")
    assert data["amount"] == 11000.0
    assert data["status"] in ["paid", "escrow_locked"]

def test_demo_payment_checkout_card_success():
    payload = {
        "listing_id": "list-102",
        "buyer_id": "buyer-02",
        "crop_type": "Onion",
        "quantity_kg": 1000,
        "price_per_kg": 28.0,
        "total_amount": 28000.0,
        "payment_method": "card",
        "card_last4": "4242"
    }
    response = client.post("/api/payment/demo-checkout", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["transaction_id"].startswith("TXN_KS_")
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest backend/tests/test_demo_payment.py -v`
Expected: FAIL with 404 or connection error.

- [ ] **Step 3: Implement DemoPaymentService and endpoint**

Create `backend/services/demo_payment.py`:
```python
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

        return DemoPaymentResponse(
            success=True,
            transaction_id=transaction_id,
            order_id=order_id,
            amount=req.total_amount,
            status="escrow_locked" if req.payment_method != "cod" else "placed",
            timestamp=timestamp,
            message="KisanSetu Demo Escrow: Funds secured in virtual vault."
        )
```

Mount `POST /api/payment/demo-checkout` in `backend/payments.py` (or router mounted at `/api/payment`):
```python
from backend.services.demo_payment import DemoPaymentService, DemoPaymentRequest, DemoPaymentResponse

@router.post("/demo-checkout", response_model=DemoPaymentResponse)
async def demo_checkout(payload: DemoPaymentRequest):
    res = DemoPaymentService.process_checkout(payload)
    return res
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest backend/tests/test_demo_payment.py -v`
Expected: PASS with 2 passed tests.

- [ ] **Step 5: Commit**

```bash
git add backend/services/demo_payment.py backend/payments.py backend/main.py backend/tests/test_demo_payment.py
git commit -m "feat(backend): implement isolated demo payment service and checkout endpoint"
```

---

### Task 2: Backend Direct Farmer Listings Endpoint (`GET /api/farmer/listings`)

**Files:**
- Modify: `backend/routes/farmer.py`
- Test: `backend/tests/test_farmer_listings.py`

**Interfaces:**
- Produces: `GET /api/farmer/listings` returning list of active farmer listings with crop, district, price, and distance filters.
- Consumes: `backend.db.get_conn`, mock dataset fallback.

- [ ] **Step 1: Write the failing test**

Create `backend/tests/test_farmer_listings.py`:
```python
import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_get_farmer_listings_default():
    response = client.get("/api/farmer/listings")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "listings" in data
    assert len(data["listings"]) > 0
    first = data["listings"][0]
    assert "farmer_name" in first
    assert "crop_type" in first
    assert "price_per_kg" in first
    assert "grade" in first

def test_get_farmer_listings_filter_crop():
    response = client.get("/api/farmer/listings?crop=Tomato")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    for item in data["listings"]:
        assert item["crop_type"].lower() == "tomato"

def test_get_farmer_listings_filter_district_and_sort():
    response = client.get("/api/farmer/listings?district=Raipur&sort=price_asc")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    prices = [item["price_per_kg"] for item in data["listings"]]
    assert prices == sorted(prices)
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest backend/tests/test_farmer_listings.py -v`
Expected: FAIL with 404 Not Found.

- [ ] **Step 3: Implement `GET /api/farmer/listings` in `backend/routes/farmer.py`**

Add endpoint in `backend/routes/farmer.py`:
```python
# Rich mock listings for Raipur, Durg, Bilaspur, Nashik agricultural hubs
MOCK_FARMER_LISTINGS = [
    {
        "id": "list-101",
        "farmer_id": "farmer-01",
        "farmer_name": "Devkaran Sahu",
        "farmer_phone": "+91 98261 22334",
        "fpo_name": "Mahanadi Krishi FPO",
        "crop_type": "Tomato",
        "quantity_kg": 850.0,
        "price_per_kg": 21.5,
        "district": "Raipur",
        "address": "Village Abhanpur, Raipur District",
        "grade": "A",
        "harvest_date": "2026-09-17",
        "photo_url": "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800",
        "defects": ["None", "Optimal Firmness", "92% Color Uniformity"],
        "status": "active",
        "created_at": "2026-09-17T14:30:00Z"
    },
    {
        "id": "list-102",
        "farmer_id": "farmer-02",
        "farmer_name": "Santosh Baghel",
        "farmer_phone": "+91 98262 44556",
        "fpo_name": "Shivnath Valley FPO",
        "crop_type": "Onion",
        "quantity_kg": 1400.0,
        "price_per_kg": 27.0,
        "district": "Durg",
        "address": "Patan Mandi Belt, Durg",
        "grade": "A",
        "harvest_date": "2026-09-16",
        "photo_url": "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800",
        "defects": ["Single Centered", "Cured Outer Skin"],
        "status": "active",
        "created_at": "2026-09-16T10:15:00Z"
    },
    {
        "id": "list-103",
        "farmer_id": "farmer-03",
        "farmer_name": "Ghanshyam Patel",
        "farmer_phone": "+91 98263 77889",
        "fpo_name": "Kisan Kalyan Samiti",
        "crop_type": "Potato",
        "quantity_kg": 2100.0,
        "price_per_kg": 18.5,
        "district": "Bilaspur",
        "address": "Takhatpur Block, Bilaspur",
        "grade": "B",
        "harvest_date": "2026-09-15",
        "photo_url": "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800",
        "defects": ["Minor Soil Adhesion", "Uniform Size"],
        "status": "active",
        "created_at": "2026-09-15T08:45:00Z"
    },
    {
        "id": "list-104",
        "farmer_id": "farmer-04",
        "farmer_name": "Ramswaroop Chandrakar",
        "farmer_phone": "+91 98264 11223",
        "fpo_name": "Mahanadi Krishi FPO",
        "crop_type": "Chilli",
        "quantity_kg": 320.0,
        "price_per_kg": 68.0,
        "district": "Raipur",
        "address": "Arang Vegetable Cluster, Raipur",
        "grade": "A",
        "harvest_date": "2026-09-17",
        "photo_url": "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=800",
        "defects": ["High Pungency", "Deep Green"],
        "status": "active",
        "created_at": "2026-09-17T11:20:00Z"
    },
    {
        "id": "list-105",
        "farmer_id": "farmer-05",
        "farmer_name": "Tukaram Shinde",
        "farmer_phone": "+91 98221 55667",
        "fpo_name": "Sahyadri Agro Producer Co",
        "crop_type": "Soybean",
        "quantity_kg": 3500.0,
        "price_per_kg": 44.5,
        "district": "Nashik",
        "address": "Niphad Taluka, Nashik",
        "grade": "A",
        "harvest_date": "2026-09-14",
        "photo_url": "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=800",
        "defects": ["Moisture < 10%", "High Oil Content"],
        "status": "active",
        "created_at": "2026-09-14T16:00:00Z"
    }
]

@router.get("/api/farmer/listings")
def get_farmer_listings(
    crop: Optional[str] = None,
    district: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    min_quantity: Optional[float] = None,
    sort: Optional[str] = "date_desc",
    search: Optional[str] = None,
):
    results = list(MOCK_FARMER_LISTINGS)
    
    # Try querying DB if available
    try:
        conn = get_conn()
        if conn:
            try:
                with conn.cursor() as cur:
                    cur.execute("""
                        SELECT id, farmer_id, farmer_name, farmer_phone, crop_type, quantity_kg, 
                               price_expectation, district, address, grade, harvest_date, photo_url, status, created_at
                        FROM listings
                        WHERE status = 'active'
                        ORDER BY created_at DESC
                    """)
                    rows = cur.fetchall()
                    if rows:
                        db_listings = []
                        for r in rows:
                            db_listings.append({
                                "id": str(r[0]),
                                "farmer_id": str(r[1]) if r[1] else "farmer-01",
                                "farmer_name": r[2] or "Registered Producer",
                                "farmer_phone": r[3] or "+91 98000 00000",
                                "fpo_name": "Local Krishi Hub",
                                "crop_type": r[4],
                                "quantity_kg": float(r[5]),
                                "price_per_kg": float(r[6]),
                                "district": r[7] or "Raipur",
                                "address": r[8] or "District Agri Hub",
                                "grade": r[9] or "A",
                                "harvest_date": str(r[10]),
                                "photo_url": r[11] or "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800",
                                "defects": ["Verified Grade"],
                                "status": r[12],
                                "created_at": r[13].isoformat() if hasattr(r[13], 'isoformat') else str(r[13])
                            })
                        results = db_listings
            except Exception as e:
                logger.info("DB query for listings failed, using memory fallback: %s", e)
            finally:
                release_conn(conn)
    except Exception:
        pass

    # Apply filters
    if crop and crop.lower() != "all":
        results = [l for l in results if l["crop_type"].lower() == crop.lower()]
    
    if district and district.lower() != "all":
        results = [l for l in results if l.get("district", "").lower() == district.lower()]
        
    if min_price is not None:
        results = [l for l in results if l["price_per_kg"] >= min_price]
        
    if max_price is not None:
        results = [l for l in results if l["price_per_kg"] <= max_price]
        
    if min_quantity is not None:
        results = [l for l in results if l["quantity_kg"] >= min_quantity]
        
    if search:
        q = search.lower()
        results = [
            l for l in results 
            if q in l["crop_type"].lower() 
            or q in l.get("farmer_name", "").lower() 
            or q in l.get("district", "").lower() 
            or q in l.get("address", "").lower()
            or q in l.get("fpo_name", "").lower()
        ]
        
    # Apply sorting
    if sort == "price_asc":
        results.sort(key=lambda x: x["price_per_kg"])
    elif sort == "price_desc":
        results.sort(key=lambda x: x["price_per_kg"], reverse=True)
    elif sort == "qty_desc":
        results.sort(key=lambda x: x["quantity_kg"], reverse=True)
    else:  # date_desc
        results.sort(key=lambda x: x.get("created_at", ""), reverse=True)

    return {
        "success": True,
        "total": len(results),
        "listings": results
    }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest backend/tests/test_farmer_listings.py -v`
Expected: PASS with 3 passed tests.

- [ ] **Step 5: Commit**

```bash
git add backend/routes/farmer.py backend/tests/test_farmer_listings.py
git commit -m "feat(backend): add GET /api/farmer/listings with multi-attribute filtering and sorting"
```

---

### Task 3: Frontend TypeScript Types & Demo Payment API Service

**Files:**
- Modify: `src/types/index.ts`
- Create: `src/services/demoPayment.ts`
- Modify: `src/services/api.ts`

**Interfaces:**
- Produces: `FarmerListing`, `DemoPaymentRequest`, `DemoPaymentResponse` types and `apiService.getFarmerListings`, `demoPaymentService.processDemoPayment`.

- [ ] **Step 1: Write TypeScript definitions in `src/types/index.ts`**

Add domain types:
```typescript
export interface FarmerListing {
  id: string;
  farmer_id: string;
  farmer_name: string;
  farmer_phone: string;
  fpo_name?: string;
  crop_type: string;
  quantity_kg: number;
  price_per_kg: number;
  location?: {
    lat: number;
    lng: number;
    district?: string;
    address?: string;
  };
  district?: string;
  address?: string;
  grade: "A" | "B" | "C" | "D";
  harvest_date: string;
  photo_url?: string;
  defects?: string[];
  status: "active" | "clustered" | "sold" | "ordered";
  created_at: string;
}

export interface DemoPaymentRequest {
  listing_id?: string;
  lot_id?: string;
  buyer_id: string;
  farmer_id?: string;
  crop_type: string;
  quantity_kg: number;
  price_per_kg: number;
  total_amount: number;
  payment_method: "upi" | "card" | "cod";
  upi_id?: string;
  card_last4?: string;
}

export interface DemoPaymentResponse {
  success: boolean;
  transaction_id: string;
  order_id: string;
  amount: number;
  status: "paid" | "escrow_locked" | "placed";
  timestamp: string;
  message: string;
}
```

- [ ] **Step 2: Create `src/services/demoPayment.ts`**

Implement isolated demo payment service helper with zero production gateway leakage:
```typescript
import { DemoPaymentRequest, DemoPaymentResponse } from "@/types";

const API_BASE_URL =
  typeof window !== "undefined"
    ? "/api"
    : (process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "https://kisansetu-1-bmg9.onrender.com")
        .replace(/\/+$/, "")
        .replace(/\/api$/, "") + "/api";

export class DemoPaymentService {
  /**
   * High-fidelity isolated simulated payment execution
   * Performs 2.5s network simulation and creates orders/payments record
   */
  static async executeDemoCheckout(payload: DemoPaymentRequest): Promise<DemoPaymentResponse> {
    try {
      const res = await fetch(`${API_BASE_URL}/payment/demo-checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn("Backend demo checkout endpoint unreachable, fallback to client escrow simulator", e);
    }

    // Client-side offline fallback
    const txnId = `TXN_KS_${Math.random().toString(16).substring(2, 10).toUpperCase()}`;
    const orderId = `ORD_${Math.random().toString(16).substring(2, 10).toUpperCase()}`;

    // Store in localStorage for cross-dashboard reflection
    try {
      const existingOrders = JSON.parse(localStorage.getItem("kisansetu_demo_orders") || "[]");
      const newOrder = {
        id: orderId,
        crop_type: payload.crop_type,
        quantity_kg: payload.quantity_kg,
        price_per_kg: payload.price_per_kg,
        total_amount: payload.total_amount,
        payment_method: payload.payment_method,
        transaction_id: txnId,
        status: payload.payment_method === "cod" ? "placed" : "paid",
        created_at: new Date().toISOString(),
      };
      existingOrders.unshift(newOrder);
      localStorage.setItem("kisansetu_demo_orders", JSON.stringify(existingOrders));
    } catch {}

    return {
      success: true,
      transaction_id: txnId,
      order_id: orderId,
      amount: payload.total_amount,
      status: payload.payment_method === "cod" ? "placed" : "escrow_locked",
      timestamp: new Date().toISOString(),
      message: "KisanSetu Sandbox: Escrow funds locked in demo vault.",
    };
  }
}
```

- [ ] **Step 3: Update `src/services/api.ts` with `getFarmerListings`**

Add `getFarmerListings` method in `ApiService`:
```typescript
async getFarmerListings(params?: {
  crop?: string;
  district?: string;
  minPrice?: number;
  maxPrice?: number;
  minQuantity?: number;
  sort?: string;
  search?: string;
}): Promise<{ success: boolean; listings: FarmerListing[]; total: number }> {
  try {
    const query = new URLSearchParams();
    if (params?.crop) query.append("crop", params.crop);
    if (params?.district) query.append("district", params.district);
    if (params?.minPrice != null) query.append("min_price", String(params.minPrice));
    if (params?.maxPrice != null) query.append("max_price", String(params.maxPrice));
    if (params?.minQuantity != null) query.append("min_quantity", String(params.minQuantity));
    if (params?.sort) query.append("sort", params.sort);
    if (params?.search) query.append("search", params.search);

    const res = await fetch(`${API_BASE_URL}/farmer/listings?${query.toString()}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn("API /farmer/listings unreachable, falling back to mock dataset", e);
  }

  // Fallback initial listings
  return {
    success: true,
    total: initialFarmerListings.length,
    listings: initialFarmerListings,
  };
}
```

- [ ] **Step 4: Verify TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 5: Commit**

```bash
git add src/types/index.ts src/services/demoPayment.ts src/services/api.ts
git commit -m "feat(frontend): add FarmerListing types and isolated DemoPayment client service"
```

---

### Task 4: Frontend UI Components: `FarmerListingCard.tsx`, `BuyerMetricsHeader.tsx`, and `NoListingsFound.tsx`

**Files:**
- Create: `src/components/buyer/FarmerListingCard.tsx`
- Create: `src/components/buyer/BuyerMetricsHeader.tsx`
- Create: `src/components/buyer/NoListingsFound.tsx`

**Interfaces:**
- Produces: Visual components for listing card with Mandi price delta, top metrics strip, and empty states.
- Consumes: `useLanguage()`, `Badge`, `Button`, `FarmerListing`.

- [ ] **Step 1: Create `src/components/buyer/BuyerMetricsHeader.tsx`**

Implement top metrics summary strip with live listings count, connected FPOs, average Mandi savings %, and pulsing network sync indicator.

- [ ] **Step 2: Create `src/components/buyer/FarmerListingCard.tsx`**

Implement produce card with:
- Crop Image / Agricultural Fallback + Quality Grade badge (Grade A/B/C).
- Farmer Name & FPO Verified Badge.
- Village & District Location.
- Harvest Date + Freshness badge.
- Price Tag with APMC Mandi comparative savings badge (e.g., "₹21.50/kg · ₹3.50 below Mandi").
- Available quantity progress indicator.
- Action Buttons: `[⚡ Pay Now (Demo)]` (primary emerald) and `[🔍 Inspect Quality]` (secondary outline).

- [ ] **Step 3: Create `src/components/buyer/NoListingsFound.tsx`**

Implement friendly empty state with SVG illustration, helpful copy, and "Clear Filters" button.

- [ ] **Step 4: Verify TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/buyer/FarmerListingCard.tsx src/components/buyer/BuyerMetricsHeader.tsx src/components/buyer/NoListingsFound.tsx
git commit -m "feat(ui): create FarmerListingCard, BuyerMetricsHeader, and NoListingsFound components"
```

---

### Task 5: Frontend Multi-Step Isolated Demo Payment Modal (`DemoPaymentModal.tsx`)

**Files:**
- Create: `src/components/buyer/DemoPaymentModal.tsx`

**Interfaces:**
- Produces: `DemoPaymentModal` taking `isOpen`, `onClose`, `item` (FarmerListing or Lot), `onSuccess`.
- Consumes: `DemoPaymentService.executeDemoCheckout`, `canvas-confetti` (or CSS confetti fallback), `useLanguage()`.

- [ ] **Step 1: Implement `DemoPaymentModal.tsx`**

Implement 4-step wizard:
- **Step 1: Order Review**: Quantity selector (kg), ₹/kg rate, 2% Escrow fee calculation, logistics estimate, and total payable amount.
- **Step 2: Payment Method Selector**:
  - UPI Apps (GPay, PhonePe, Paytm, BHIM, or custom UPI ID).
  - Virtual Debit/Credit Card with interactive 3D card preview.
  - Farm-gate Escrow COD (pay upon physical harvest delivery).
- **Step 3: Simulated Escrow Authorization**:
  - 2.5-second processing state with circular progress and sequential status messages ("Connecting to KisanSetu Escrow Vault...", "Securing Bank Guarantee...", "Locking Farmer Settlement...").
- **Step 4: Success & Confetti Screen**:
  - Confetti burst animation.
  - Confirmed Transaction ID (`TXN_KS_XXXXXXXX`).
  - Escrow status badge.
  - Direct Action CTAs: `[View in Orders & Logistics →]` and `[Continue Marketplace Shopping]`.
- **Judges/Demo Disclaimer**:
  - Elegant header disclaimer: `🛡️ KisanSetu Sandbox Escrow · Demo Payment Mode`.

- [ ] **Step 2: Verify TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/buyer/DemoPaymentModal.tsx
git commit -m "feat(frontend): implement multi-step isolated DemoPaymentModal with escrow simulation and confetti"
```

---

### Task 6: Buyer Marketplace Hub Integration (`src/app/buyer/page.tsx`) & Real-Time Sync

**Files:**
- Modify: `src/app/buyer/page.tsx`

**Interfaces:**
- Produces: Fully interactive buyer marketplace with dual-tab switcher (`[🌾 Direct Farmer Listings] | [📦 Aggregated Wholesale Pools]`), search/filter controls, real-time WebSocket listening, and demo checkout integration.

- [ ] **Step 1: Integrate Dual Tabs, Metrics Header, and Farmer Listings Feed**

- Add `activeTab: "farmer_listings" | "wholesale_pools"` state.
- Mount `BuyerMetricsHeader` at the top of the buyer marketplace.
- Mount filter carousel (All, Tomato, Onion, Potato, Chilli, Soybean, etc.) and District dropdown (Raipur, Durg, Bilaspur, Nashik).
- Render `FarmerListingCard` grid when `activeTab === "farmer_listings"`.
- Render `LotCard` grid when `activeTab === "wholesale_pools"`.
- Wire `DemoPaymentModal` when clicking `[⚡ Pay Now (Demo)]` on either individual farmer listing or wholesale lot.
- Listen to `ws/orders` for real-time `listing_created` events and auto-prepend new listings.

- [ ] **Step 2: Verify TypeScript compilation and build**

Run: `npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/buyer/page.tsx
git commit -m "feat(frontend): integrate direct farmer listings, tabbed switcher, and demo payment modal into buyer marketplace"
```

---

### Task 7: End-to-End Verification & Mobile Viewport Smoke Test

**Files:**
- Test: Full backend test suite (`backend/tests/`)
- Test: Full frontend typecheck & lint (`npx tsc --noEmit`, `npm run lint`)
- Test: Live smoke test against port 8000 and port 3000

- [ ] **Step 1: Run complete backend test suite**

Run: `pytest backend/tests/ -v`
Expected: All tests pass (≥ 23 passed).

- [ ] **Step 2: Run frontend build check**

Run: `npx tsc --noEmit && npm run lint`
Expected: 0 errors and 0 warnings.

- [ ] **Step 3: Live API and Checkout Smoke Test**

Run:
1. `curl http://localhost:8000/api/farmer/listings` -> HTTP 200 with listings array.
2. `curl -X POST http://localhost:8000/api/payment/demo-checkout -H "Content-Type: application/json" -d "{\"crop_type\":\"Tomato\",\"quantity_kg\":100,\"price_per_kg\":22,\"total_amount\":2200,\"buyer_id\":\"b1\"}"` -> HTTP 200 with `TXN_KS_` transaction ID.
3. `curl http://localhost:3000/buyer` -> HTTP 200 with buyer page HTML.

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "test: complete end-to-end verification of buyer dashboard, direct listings, and demo payment engine"
```
