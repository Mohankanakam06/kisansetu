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
        "quantity_kg": 500.0,
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
    assert "Escrow" in data["message"]

def test_demo_payment_checkout_card_success():
    payload = {
        "listing_id": "list-102",
        "buyer_id": "buyer-02",
        "crop_type": "Onion",
        "quantity_kg": 1000.0,
        "price_per_kg": 28.0,
        "total_amount": 28000.0,
        "payment_method": "card",
        "card_last4": "4242"
    }
    response = client.post("/api/payments/demo-checkout", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["transaction_id"].startswith("TXN_KS_")
    assert data["status"] == "escrow_locked"

def test_demo_payment_checkout_cod_success():
    payload = {
        "listing_id": "list-103",
        "buyer_id": "buyer-03",
        "crop_type": "Potato",
        "quantity_kg": 2000.0,
        "price_per_kg": 15.0,
        "total_amount": 30000.0,
        "payment_method": "cod"
    }
    response = client.post("/api/payment/demo-checkout", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["status"] == "placed"

def test_demo_payment_invalid_amount():
    payload = {
        "crop_type": "Tomato",
        "quantity_kg": 0,
        "price_per_kg": 20.0,
        "total_amount": 0,
        "payment_method": "upi"
    }
    response = client.post("/api/payment/demo-checkout", json=payload)
    assert response.status_code == 422
