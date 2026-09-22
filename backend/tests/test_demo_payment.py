import uuid
import pytest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


class MockDemoCursor:
    """Mock cursor for demo payment tests that handles INSERT/RETURNING patterns."""
    def __init__(self):
        self.last_result = None

    def execute(self, query, params=None):
        q = query.strip()
        if "INSERT INTO users" in q:
            self.last_result = None
        elif "INSERT INTO orders" in q:
            oid = str(uuid.uuid4())
            self.last_result = [{"id": oid}]
        elif "INSERT INTO payments" in q:
            pid = str(uuid.uuid4())
            self.last_result = [{"id": pid}]
        elif "SELECT" in q.upper():
            self.last_result = []
        else:
            self.last_result = None

    def fetchone(self):
        if self.last_result and len(self.last_result) > 0:
            return self.last_result[0]
        return None

    def fetchall(self):
        return self.last_result or []


class MockDemoConnection:
    """Mock connection that provides MockDemoCursor and no-op transaction methods."""
    def __init__(self):
        self.closed = False

    def cursor(self):
        return MockDemoCursor()

    def commit(self):
        pass

    def rollback(self):
        pass

    def close(self):
        self.closed = True


def get_mock_demo_conn():
    return MockDemoConnection()


@patch("backend.services.demo_payment.get_conn", side_effect=get_mock_demo_conn)
@patch("backend.services.demo_payment.release_conn", return_value=None)
def test_demo_payment_checkout_upi_success(mock_release, mock_conn):
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


@patch("backend.services.demo_payment.get_conn", side_effect=get_mock_demo_conn)
@patch("backend.services.demo_payment.release_conn", return_value=None)
def test_demo_payment_checkout_card_success(mock_release, mock_conn):
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
    response = client.post("/api/payment/demo-checkout", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["transaction_id"].startswith("TXN_KS_")
    assert data["status"] == "escrow_locked"


@patch("backend.services.demo_payment.get_conn", side_effect=get_mock_demo_conn)
@patch("backend.services.demo_payment.release_conn", return_value=None)
def test_demo_payment_checkout_cod_success(mock_release, mock_conn):
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
