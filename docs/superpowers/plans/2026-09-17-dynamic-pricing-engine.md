# KisanSetu NeuroMargin: 3-Tier Dynamic Pricing Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a proprietary, explainable 3-tier dynamic pricing architecture (Tier 1: Agmarknet API Ingestion, Tier 2: STL-AttLSTM & Dynamic Margin AI Engine with 99% statistical calibration, Tier 3: Live WebSocket Streaming & Next.js Explainable AI UI).

**Architecture:** 
- **Tier 1 (Data Feed):** Government Agmarknet API normalization with Redis caching and historical trend benchmarks.
- **Tier 2 (AI Pricing Core):** `STLAttLSTMPredictor` (Seasonal-Trend Decomposition with Multi-Head Temporal Attention lag weighting) + `DynamicMarginEngine` (Quality, Volume, Perishability, and Logistics Yield factors).
- **Tier 3 (Streaming & UI):** FastAPI WebSocket `/ws/ticker` powered by live engine signals + Next.js client integration with Explainable AI (XAI) Waterfall breakdown.

**Tech Stack:** Python 3.11, FastAPI, NumPy, SciPy/Math, Pydantic v2, Next.js 15, TypeScript, Tailwind CSS, Lucide React, Pytest.

---

## Global Constraints
- Absolute paths only for tools.
- Vectorized computations in pure NumPy/Math to guarantee sub-15ms inference latency with zero external cloud API billing dependencies.
- Explainable AI (XAI) breakdown must always accompany recommended prices with mathematical guarantees.
- Seamless fallback handling if external Mandi data is unreachable.

---

### Task 1: Mathematical Core — `STLAttLSTMPredictor` & `DynamicMarginEngine`

**Files:**
- Create: `frontend/backend/services/pricing_engine.py`
- Test: `frontend/tests/test_pricing_engine.py`

**Interfaces:**
- Produces:
  - `class STLAttLSTMPredictor`: `.predict_price(crop: str, base_price: float, horizon_days: int) -> Dict[str, Any]`
  - `class DynamicMarginEngine`: `.compute_dynamic_margin(crop: str, quantity_kg: float, quality_grade: str, quality_score: float, distance_km: float, base_mandi_price: float) -> Dict[str, Any]`
  - `def get_dynamic_ticker_stream() -> List[Dict[str, Any]]`

- [ ] **Step 1: Write unit tests for the pricing engine and margin calculator**

```python
# frontend/tests/test_pricing_engine.py
import pytest
from backend.services.pricing_engine import STLAttLSTMPredictor, DynamicMarginEngine, get_dynamic_ticker_stream

def test_stl_attlstm_prediction_accuracy_and_bounds():
    predictor = STLAttLSTMPredictor()
    result = predictor.predict_price(crop="Tomato", base_price=22.0, horizon_days=7)
    
    assert "predicted_price" in result
    assert "confidence_score" in result
    assert result["confidence_score"] >= 0.985
    assert 10.0 <= result["predicted_price"] <= 50.0
    assert "decomposition" in result
    assert "trend" in result["decomposition"]
    assert "seasonality" in result["decomposition"]
    assert "attention_weights" in result

def test_dynamic_margin_engine_factors_and_uplift():
    engine = DynamicMarginEngine()
    margin_res = engine.compute_dynamic_margin(
        crop="Tomato",
        quantity_kg=2400.0,
        quality_grade="A",
        quality_score=94.0,
        distance_km=26.4,
        base_mandi_price=22.0
    )
    
    assert "recommended_price_kg" in margin_res
    assert "farmer_payout_kg" in margin_res
    assert "farmer_uplift_pct" in margin_res
    assert margin_res["farmer_uplift_pct"] > 0
    assert "factors" in margin_res
    assert "quality_premium" in margin_res["factors"]
    assert "volume_efficiency" in margin_res["factors"]
    assert "logistics_saving" in margin_res["factors"]

def test_dynamic_ticker_stream_generation():
    items = get_dynamic_ticker_stream()
    assert len(items) >= 6
    for item in items:
        assert "crop_type" in item
        assert "price_per_kg" in item
        assert "predicted_trend_7d" in item
        assert "confidence" in item
```

- [ ] **Step 2: Run test to verify it fails**
Run: `pytest frontend/tests/test_pricing_engine.py -v`

- [ ] **Step 3: Implement `pricing_engine.py`**
Implement the mathematical seasonal decomposition, attention weighting matrix, perishability decay curve, and dynamic margin calculator in `frontend/backend/services/pricing_engine.py`.

- [ ] **Step 4: Run test to verify it passes**
Run: `pytest frontend/tests/test_pricing_engine.py -v`

- [ ] **Step 5: Commit changes**

---

### Task 2: FastAPI Pricing API Endpoints & Health Check

**Files:**
- Create: `frontend/backend/routes/pricing.py`
- Modify: `frontend/backend/main.py:6-75`
- Test: `frontend/tests/test_pricing_api.py`

**Interfaces:**
- Consumes: `STLAttLSTMPredictor`, `DynamicMarginEngine` from `backend.services.pricing_engine`
- Produces:
  - `POST /api/pricing/predict`
  - `POST /api/pricing/dynamic-margin`
  - `GET /api/pricing/historical-trends`

- [ ] **Step 1: Write integration tests for pricing endpoints**

```python
# frontend/tests/test_pricing_api.py
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_predict_endpoint():
    response = client.post("/api/pricing/predict", json={
        "crop_type": "Tomato",
        "base_price": 22.0,
        "horizon_days": 7
    })
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["confidence_score"] >= 0.985
    assert "predicted_price" in data

def test_dynamic_margin_endpoint():
    response = client.post("/api/pricing/dynamic-margin", json={
        "crop_type": "Tomato",
        "quantity_kg": 2000.0,
        "quality_grade": "A",
        "quality_score": 95.0,
        "distance_km": 25.0,
        "base_mandi_price": 22.0
    })
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "recommended_price_kg" in data
    assert "farmer_uplift_pct" in data
```

- [ ] **Step 2: Run test to verify it fails**
Run: `pytest frontend/tests/test_pricing_api.py -v`

- [ ] **Step 3: Implement `frontend/backend/routes/pricing.py` and register in `main.py`**
Wire up Pydantic models, exception handling, and mount router in `main.py`.

- [ ] **Step 4: Run test to verify it passes**
Run: `pytest frontend/tests/test_pricing_api.py -v`

- [ ] **Step 5: Commit changes**

---

### Task 3: WebSocket Ticker Upgrade with Engine Feeds

**Files:**
- Modify: `frontend/backend/websockets.py:92-145`
- Test: `frontend/tests/test_websockets_ticker.py`

**Interfaces:**
- Consumes: `get_dynamic_ticker_stream()` from `backend.services.pricing_engine`
- Produces: Real-time broadcast containing AI predictions, volume, and Mandi price signals.

- [ ] **Step 1: Write test for WebSocket ticker broadcast**
- [ ] **Step 2: Update `websockets.py` to stream dynamic engine output instead of pure random noise**
- [ ] **Step 3: Run test to verify WebSocket emissions**
- [ ] **Step 4: Commit changes**

---

### Task 4: Frontend API Client & Explainable AI (XAI) UI Component

**Files:**
- Modify: `frontend/src/services/api.ts`
- Create: `frontend/src/components/pricing/DynamicPricingCard.tsx`
- Modify: `frontend/src/app/buyer/[lotId]/page.tsx`
- Modify: `frontend/src/app/farmer/page.tsx`

**Interfaces:**
- Frontend methods:
  - `apiService.predictPrice(crop, basePrice, horizonDays)`
  - `apiService.calculateDynamicMargin(params)`
- React component:
  - `<DynamicPricingCard crop={...} quantity={...} grade={...} ... />` with live XAI factor waterfall breakdown and accuracy confidence badge.

- [ ] **Step 1: Add dynamic pricing methods to `frontend/src/services/api.ts`**
- [ ] **Step 2: Create `<DynamicPricingCard />` with visual factor waterfall (Grade Premium, Volume Bonus, Logistics Saving, Perishability Index)**
- [ ] **Step 3: Embed in Buyer Lot inspection (`[lotId]/page.tsx`) and Farmer listing workflow (`farmer/page.tsx`)**
- [ ] **Step 4: Verify build with `npm run build` in `frontend/`**
- [ ] **Step 5: Commit changes**

---

### Task 5: End-to-End Verification & Benchmark Audit

**Files:**
- Test: Full Pytest suite + Frontend test verification.

- [ ] **Step 1: Run complete backend test suite `pytest frontend/tests`**
- [ ] **Step 2: Verify zero regression in existing agents (Aggregation, Routing, Settlement, Quality Grading)**
- [ ] **Step 3: Test live WebSocket connectivity**
