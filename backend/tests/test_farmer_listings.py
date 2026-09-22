import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

@pytest.fixture(autouse=True)
def ensure_sample_listing():
    """Ensure at least one sample listing exists for testing retrieval endpoints."""
    res = client.get("/api/farmer/listings")
    if res.status_code == 200 and len(res.json().get("listings", [])) == 0:
        sample_payload = {
            "farmer_name": "Ramesh Patel",
            "farmer_phone": "+91 98765 43210",
            "crop_type": "Tomato",
            "quantity_kg": 500.0,
            "price_expectation": 22.0,
            "district": "Raipur",
            "address": "Arang Village Mandi"
        }
        client.post("/api/farmer/listing", json=sample_payload)

def test_get_farmer_listings_default():
    response = client.get("/api/farmer/listings")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "listings" in data
    assert len(data["listings"]) >= 1
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
    response_all = client.get("/api/farmer/listings")
    assert response_all.status_code == 200
    all_data = response_all.json()
    assert all_data["success"] is True

    if all_data["listings"]:
        target_name = all_data["listings"][0]["farmer_name"]
        search_term = target_name.split()[0]
        response = client.get(f"/api/farmer/listings?search={search_term}")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert len(data["listings"]) >= 1
        assert any(
            search_term.lower() in item["farmer_name"].lower()
            or search_term.lower() in item["crop_type"].lower()
            or search_term.lower() in item["district"].lower()
            for item in data["listings"]
        )
    else:
        response = client.get("/api/farmer/listings?search=Tomato")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
