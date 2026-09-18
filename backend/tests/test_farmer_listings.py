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

def test_get_farmer_listings_search():
    response = client.get("/api/farmer/listings?search=Devkaran")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert len(data["listings"]) >= 1
    assert "Devkaran" in data["listings"][0]["farmer_name"]
