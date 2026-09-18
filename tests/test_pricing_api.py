import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_predict_endpoint_success():
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
    assert data["predicted_price"] > 0
    assert "decomposition" in data
    assert "attention_weights" in data

def test_predict_endpoint_default_base_price():
    # If base_price is not provided, should fallback to APMC benchmark
    response = client.post("/api/pricing/predict", json={
        "crop_type": "Onion",
        "horizon_days": 7
    })
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["predicted_price"] > 0

def test_dynamic_margin_endpoint_success():
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
    assert "farmer_payout_kg" in data
    assert "farmer_uplift_pct" in data
    assert data["farmer_uplift_pct"] > 0
    assert "factors" in data
    assert "explainability" in data

def test_dynamic_margin_endpoint_defaults():
    # Test with optional parameters defaulting
    response = client.post("/api/pricing/dynamic-margin", json={
        "crop_type": "Potato",
        "quantity_kg": 1500.0
    })
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["recommended_price_kg"] > 0

def test_historical_trends_endpoint():
    response = client.get("/api/pricing/historical-trends?crop=Tomato")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "crop" in data
    assert "points" in data
    assert len(data["points"]) >= 7
