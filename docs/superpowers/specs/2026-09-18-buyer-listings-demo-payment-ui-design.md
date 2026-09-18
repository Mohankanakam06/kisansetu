# KisanSetu Buyer Dashboard, Direct Farmer Listings & Demo Payment Engine — Specification

**Date:** 2026-09-18  
**Status:** Approved  
**Target Systems:** Frontend (Next.js 16 App Router, React 19, Tailwind CSS v4, Lucide Icons) & Backend (FastAPI, PostgreSQL/Mock DB, WebSockets)

---

## 1. Executive Summary & Goals

KisanSetu connects agricultural producers (farmers, FPOs, self-help groups) directly with institutional and wholesale buyers (supermarkets, food processors, regional traders). 

This specification establishes:
1. **Direct Farmer Listings on Buyer Dashboard**: A rich, filterable, and real-time synchronized feed of individual farm harvests alongside aggregated village cluster pools.
2. **Isolated Demo Payment Gateway Engine**: A high-fidelity simulated checkout and escrow flow (UPI, Card, Escrow COD) that generates authentic transaction IDs, stores orders in the PostgreSQL database, updates both buyer and farmer dashboards, and can be cleanly swapped for production Razorpay/Stripe gateways.
3. **World-Class Agri-Tech UI & UX**: Modern earthy-green visual design tokens, top metric summary strip, responsive mobile-first navigation, shimmer skeleton states, micro-interactions, accessible contrast, and multi-lingual support (English, Hindi, Chhattisgarhi).

---

## 2. Architecture & Data Flow

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 BUYER BROWSER (Next.js 16)                             │
│                                                                                        │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │ 📊 Top Metric Summary Strip: Active Listings | Orders in Pipeline | Avg Savings │  │
│  └──────────────────────────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │ 📑 Tab Switcher: [🌾 Direct Farmer Listings]  |  [📦 Aggregated Wholesale Pools] │  │
│  └──────────────────────────────────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────┐  ┌─────────────────────────────────────────────────────┐  │
│  │ 🔍 Search & Filters     │  │ 🛒 Listing Cards (Grid / List / Map)                │  │
│  │ • Crop (Multi-pills)    │  │ • Farmer / FPO Name, Village, District              │  │
│  │ • District Selector     │  │ • Quantity, ₹/kg, Harvest Date, Freshness           │  │
│  │ • Price & Qty Sliders   │  │ • Quality Grade Badge (A/B/C) + AI Photo            │  │
│  │ • Sort (Price/Date/Dist)│  │ • Actions: [⚡ Pay Now (Demo)] [🔍 Inspect Quality] │  │
│  └─────────────────────────┘  └─────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                                            │ 1. Fetch Listings & Filter
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               FASTAPI BACKEND & WEBSOCKETS                             │
│                                                                                        │
│  • GET  /api/farmer/listings  -> Query listings with filters (crop, district, sort)    │
│  • POST /api/payment/demo-checkout -> Creates order, records payment, updates status   │
│  • WS   ws/orders & ws/ticker -> Broadcasts 'listing_created', 'order_placed'          │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                                            │ 2. Order Placed / Payment Simulation
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                            ISOLATED DEMO PAYMENT SERVICE                               │
│                                                                                        │
│  • Step 1: Order Summary (Escrow breakdown, ₹/kg, logistics contribution)              │
│  • Step 2: Payment Method (UPI Apps / Virtual Card / Farm-gate Escrow COD)             │
│  • Step 3: Simulated Escrow Lock Animation (2.5s simulated network latency)            │
│  • Step 4: Success Confetti & Mock Transaction ID (TXN_KS_XXXXXXXX)                    │
│  • Database Insertion: orders + payments tables (reflected on Buyer & Farmer sides)    │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Data Models & Database Schema

### 3.1 PostgreSQL Tables (Database Layer)
The database persists both individual farmer listings and wholesale orders:

```sql
-- Extended Direct Farmer Listings
CREATE TABLE IF NOT EXISTS listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID REFERENCES users(id),
  farmer_name TEXT,
  farmer_phone TEXT,
  crop_type TEXT NOT NULL,
  quantity_kg NUMERIC NOT NULL,
  price_expectation NUMERIC NOT NULL,
  location GEOGRAPHY(POINT) NOT NULL,
  district TEXT DEFAULT 'Raipur',
  address TEXT DEFAULT 'Village Agri Hub',
  grade TEXT DEFAULT 'A',
  harvest_date DATE DEFAULT CURRENT_DATE,
  photo_url TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'clustered', 'sold', 'ordered')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lot_id UUID,
  listing_id UUID REFERENCES listings(id),
  buyer_id UUID REFERENCES users(id),
  farmer_id UUID REFERENCES users(id),
  crop_type TEXT NOT NULL,
  quantity_kg NUMERIC NOT NULL,
  price_per_kg NUMERIC NOT NULL,
  total_amount NUMERIC NOT NULL,
  payment_method TEXT DEFAULT 'upi',
  transaction_id TEXT,
  status TEXT DEFAULT 'placed' CHECK (status IN ('placed', 'paid', 'routed', 'picked_up', 'delivered', 'settled')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Payments Table (Escrow State Machine)
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id),
  farmer_id UUID,
  amount NUMERIC NOT NULL,
  gateway TEXT DEFAULT 'demo_escrow',
  transaction_id TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'partial_paid', 'settled')),
  paid_at TIMESTAMPTZ DEFAULT now()
);
```

### 3.2 TypeScript Domain Types (`src/types/index.ts`)

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
  location: {
    lat: number;
    lng: number;
    district?: string;
    address?: string;
  };
  grade: "A" | "B" | "C";
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
  status: "paid" | "escrow_locked";
  timestamp: string;
  message: string;
}
```

---

## 4. Backend REST Endpoints & WebSocket Events

### 4.1 `GET /api/farmer/listings`
* **Query Parameters**:
  * `crop` (string, optional): e.g. "Tomato", "Onion", "All"
  * `district` (string, optional): e.g. "Raipur", "Durg", "Nashik"
  * `min_price` (float, optional)
  * `max_price` (float, optional)
  * `min_quantity` (float, optional)
  * `sort` (string, optional): `price_asc`, `price_desc`, `date_desc`, `nearest`
  * `search` (string, optional): full text search on crop, farmer name, address
  * `lat`, `lng`, `radius_km` (float, optional): geographical distance filter
* **Response**:
  ```json
  {
    "success": true,
    "total": 12,
    "listings": [
      {
        "id": "list-101",
        "farmer_name": "Devkaran Sahu",
        "farmer_phone": "+91 98261 22334",
        "fpo_name": "Mahanadi Krishi FPO",
        "crop_type": "Tomato",
        "quantity_kg": 850,
        "price_per_kg": 21.5,
        "district": "Raipur",
        "address": "Village Abhanpur, Raipur District",
        "grade": "A",
        "harvest_date": "2026-09-17",
        "photo_url": "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800",
        "defects": ["None", "Optimal Firmness", "92% Color Uniformity"],
        "status": "active",
        "created_at": "2026-09-17T14:30:00Z"
      }
    ]
  }
  ```

### 4.2 `POST /api/payment/demo-checkout`
* **Request Body**: `DemoPaymentRequest`
* **Behavior**:
  1. Validates available quantity and listing state.
  2. Generates unique mock Transaction ID (`TXN_KS_` + 8 hex chars).
  3. Inserts order record into `orders` table and payment record into `payments` table.
  4. Updates listing/lot status to `sold` or `ordered`.
  5. Emits real-time WebSocket event `order_placed` to `ws/orders`.
* **Response**: `DemoPaymentResponse`

### 4.3 WebSocket Channels
* `ws/orders`: Broadcasts `listing_created` when a farmer lists produce, and `order_placed` when a buyer checks out.

---

## 5. UI/UX Specification & Component Hierarchy

### 5.1 Buyer Dashboard Layout (`src/app/buyer/page.tsx`)
1. **Top Metric Summary Strip (`BuyerMetricsHeader.tsx`)**:
   * **Active Farmer Lots**: Dynamic count (e.g. 14 Active Batches).
   * **Direct Farmer Network**: E.g. 8 FPOs & 42 Farmers Connected.
   * **Avg Buyer Savings**: E.g. 18.5% below APMC Mandi middleman rates.
   * **Real-Time Feed Status**: Pulsing green connection badge.
2. **Tab Navigation Switcher**:
   * `[🌾 Direct Farmer Listings (14)]`
   * `[📦 Aggregated Wholesale Pools (4)]`
3. **Filter & Sort Control Panel**:
   * Search input with debounce.
   * Crop filter pill carousel (with icons/emojis).
   * District dropdown select.
   * Dual range sliders for Price (₹/kg) and Volume (kg).
   * Sort Dropdown (Price Low→High, Newest First, Highest Quantity).
   * Reset filters button.
4. **Produce Listing Cards Grid (`FarmerListingCard.tsx`)**:
   * Produce image with category fallback + Grade ribbon (Grade A / B / C).
   * Farmer Name & FPO tag with verified badge.
   * Location (Village & District).
   * Harvest Date badge (e.g. "Harvested Yesterday").
   * Price Tag with Mandi comparative delta (e.g. "₹21.50/kg · ₹3.50 below Mandi").
   * Quantity available progress bar.
   * Dual Action Buttons:
     * Primary: `[⚡ Pay Now (Demo)]` (triggers demo payment drawer).
     * Secondary: `[🔍 Inspect Quality]` (opens AI defect & grading modal).
5. **Empty State Component (`NoListingsFound.tsx`)**:
   * Friendly SVG illustration, helpful explanation, and "Clear Filters" CTA.

### 5.2 Isolated Demo Payment Engine (`DemoPaymentModal.tsx`)
* Step 1: **Order Review** (Quantity adjustment, price subtotal, 2% Escrow fee, logistics estimate).
* Step 2: **Payment Method Selector**:
  * **UPI App**: GPay, PhonePe, Paytm, BHIM, or manual UPI ID.
  * **Card**: Virtual Visa/Mastercard with interactive card graphic.
  * **Escrow COD**: Pay upon delivery after physical inspection.
* Step 3: **Simulated Escrow Authorization**:
  * Circular progress bar with sequential status messages.
* Step 4: **Success & Confetti Screen**:
  * Dynamic confetti burst.
  * Confirmed Transaction ID (`TXN_KS_XXXXXXXX`).
  * Direct CTA: `[View in Orders & Logistics →]` and `[Continue Marketplace Shopping]`.
* **Judges/Demo Disclaimer**:
  * Elegant badge: `🛡️ KisanSetu Sandbox Escrow · Demo Payment Mode`.

---

## 6. Testing & Quality Assurance Plan

1. **Backend Unit & Integration Tests (`tests/test_demo_payment.py` & `tests/test_farmer_listings.py`)**:
   * Test `GET /api/farmer/listings` with various query filter combinations.
   * Test `POST /api/payment/demo-checkout` successfully creates DB orders and payments.
   * Verify mock fallback works when database is unreachable.
2. **Frontend Typecheck & Build**:
   * Ensure `npx tsc --noEmit` passes with 0 errors.
   * Verify Next.js 16 build compiles with Turbopack cleanly.
3. **Accessibility & Mobile UX**:
   * Touch targets ≥ 44px on mobile devices.
   * Color contrast compliant with WCAG AA.
   * Keyboard accessible modals and filter controls.
