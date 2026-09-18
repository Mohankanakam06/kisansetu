import pytest
import json
from fastapi.testclient import TestClient
from backend.main import app
from backend.services.pricing_engine import get_dynamic_ticker_stream

def test_get_dynamic_ticker_stream_structure():
    stream_data = get_dynamic_ticker_stream()
    assert isinstance(stream_data, list)
    assert len(stream_data) >= 6
    for item in stream_data:
        assert "crop_type" in item
        assert "price_per_kg" in item
        assert "predicted_price_7d" in item
        assert "predicted_trend_7d" in item
        assert "confidence" in item
        assert item["confidence"] >= 0.98

def test_websocket_ticker_endpoint():
    client = TestClient(app)
    with client.websocket_connect("/ws/ticker") as websocket:
        # Upon connection, the ticker task emits the live APMC dynamic stream
        msg_str = websocket.receive_text()
        msg = json.loads(msg_str)
        assert msg["type"] == "apmc_ticker"
        assert len(msg["data"]) >= 6
        assert msg["data"][0]["confidence"] >= 0.98
        assert "predicted_trend_7d" in msg["data"][0]

        # Then test ping/pong
        websocket.send_text("ping")
        data = websocket.receive_text()
        assert data == "pong"
