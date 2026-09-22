"""Comprehensive E2E Endpoint Audit Script for KisanSetu."""
import requests
import json
import time
import sys

BASE_URL = "http://127.0.0.1:8000"

def log(msg, status="INFO"):
    colors = {
        "INFO": "\033[94m",
        "PASS": "\033[92m",
        "FAIL": "\033[91m",
        "WARN": "\033[93m",
        "RESET": "\033[0m"
    }
    print(f"{colors.get(status, '')}[{status}] {msg}{colors['RESET']}")

def check_endpoint(name, method, path, expected_status=200, json_data=None, headers=None, params=None):
    url = f"{BASE_URL}{path}"
    try:
        if method.upper() == "GET":
            res = requests.get(url, headers=headers, params=params, timeout=10)
        elif method.upper() == "POST":
            res = requests.post(url, headers=headers, json=json_data, params=params, timeout=10)
        elif method.upper() == "PUT":
            res = requests.put(url, headers=headers, json=json_data, timeout=10)
        elif method.upper() == "DELETE":
            res = requests.delete(url, headers=headers, timeout=10)
        else:
            raise ValueError(f"Unsupported method {method}")

        passed = (res.status_code == expected_status) or (isinstance(expected_status, list) and res.status_code in expected_status)
        if passed:
            log(f"{name} -> {res.status_code} OK", "PASS")
            try:
                return True, res.json()
            except Exception:
                return True, res.text
        else:
            log(f"{name} -> Expected {expected_status}, got {res.status_code}: {res.text[:300]}", "FAIL")
            return False, res.text
    except Exception as e:
        log(f"{name} -> Exception: {e}", "FAIL")
        return False, str(e)

def run_all_tests():
    log("=== Starting Comprehensive KisanSetu API Test Suite ===", "INFO")
    results = {}

    # 1. Health
    passed, data = check_endpoint("Health Check", "GET", "/api/health")
    results["health"] = passed

    # 2. Auth - OTP Send & Verify
    passed, send_otp_data = check_endpoint("Auth - Send OTP", "POST", "/api/auth/send-otp", json_data={"phone": "9876543210", "role": "farmer"})
    results["auth_send_otp"] = passed

    otp = send_otp_data.get("otp_debug", "123456") if isinstance(send_otp_data, dict) else "123456"
    passed, verify_data = check_endpoint("Auth - Verify OTP", "POST", "/api/auth/verify-otp", json_data={"phone": "9876543210", "otp": otp, "role": "farmer"})
    results["auth_verify_otp"] = passed

    farmer_token = verify_data.get("token") if isinstance(verify_data, dict) else None
    farmer_id = verify_data.get("user", {}).get("id") if isinstance(verify_data, dict) else None
    farmer_headers = {"Authorization": f"Bearer {farmer_token}"} if farmer_token else {}

    # Auth - Login Demo Farmer
    passed, login_data = check_endpoint("Auth - Login Demo Farmer", "POST", "/api/auth/login", json_data={"email": "farmer@demo.com", "password": "password123", "role": "farmer"})
    results["auth_login_demo_farmer"] = passed

    # Auth - Login Demo Buyer
    passed, buyer_login_data = check_endpoint("Auth - Login Demo Buyer", "POST", "/api/auth/login", json_data={"email": "buyer@demo.com", "password": "password123", "role": "buyer"})
    results["auth_login_demo_buyer"] = passed
    buyer_token = buyer_login_data.get("token") if isinstance(buyer_login_data, dict) else None
    buyer_id = buyer_login_data.get("user", {}).get("id") if isinstance(buyer_login_data, dict) else None
    buyer_headers = {"Authorization": f"Bearer {buyer_token}"} if buyer_token else {}

    # Auth - /me
    passed, me_data = check_endpoint("Auth - Get Current User (/me)", "GET", "/api/auth/me", headers=farmer_headers)
    results["auth_me"] = passed

    # 3. Anti-Fraud - Token Generation & Validation
    passed, af_session = check_endpoint("Anti-Fraud - Start Session", "POST", "/api/anti-fraud/capture-session", headers=farmer_headers)
    results["anti_fraud_session"] = passed
    capture_token = af_session.get("capture_token") if isinstance(af_session, dict) else "dev-test-token"

    passed, af_verify = check_endpoint("Anti-Fraud - Validate Upload", "POST", "/api/anti-fraud/validate-upload", headers=farmer_headers, json_data={
        "image_base64": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP...",
        "capture_token": capture_token,
        "farmer_id": farmer_id or "farmer-01",
        "crop_type": "Tomato"
    })
    results["anti_fraud_verify"] = passed

    # 4. Farmer Listing Creation
    listing_payload = {
        "farmer_id": farmer_id or "farmer-01",
        "crop_type": "Tomato",
        "quantity_kg": 250,
        "price_expectation": 22.5,
        "lat": 21.2514,
        "lng": 81.6296,
        "capture_token": capture_token,
        "grade": "Grade A",
        "district": "Raipur",
        "address": "Village Mandir Hasaud, Raipur, Chhattisgarh"
    }
    passed, listing_res = check_endpoint("Farmer - Create Listing", "POST", "/api/farmer/listing", headers=farmer_headers, json_data=listing_payload)
    results["farmer_create_listing"] = passed
    listing_id = listing_res.get("listing_id") if isinstance(listing_res, dict) else None

    # Farmer - List direct listings
    passed, listings_list = check_endpoint("Farmer - List Active Listings", "GET", "/api/farmer/listings", params={"crop_type": "Tomato", "limit": 10})
    results["farmer_get_listings"] = passed

    # 5. Pricing Engine Endpoints
    passed, _ = check_endpoint("Pricing - Prediction", "POST", "/api/pricing/predict", json_data={"crop_type": "Tomato", "base_price": 22.0, "horizon_days": 7})
    results["pricing_predict"] = passed

    passed, _ = check_endpoint("Pricing - Dynamic Margin", "POST", "/api/pricing/dynamic-margin", json_data={"crop_type": "Tomato", "quantity_kg": 250, "quality_grade": "A", "quality_score": 90.0, "distance_km": 15.0, "base_mandi_price": 22.0})
    results["pricing_margin"] = passed

    passed, _ = check_endpoint("Pricing - Historical Trends", "GET", "/api/pricing/historical-trends", params={"crop": "Tomato", "days": 30})
    results["pricing_trends"] = passed

    passed, _ = check_endpoint("Pricing - Ticker", "GET", "/api/pricing/ticker")
    results["pricing_ticker"] = passed

    # 6. Mandi Prices
    passed, _ = check_endpoint("Mandi - Live Prices", "GET", "/api/mandi/prices", params={"crop": "Tomato", "limit": 5})
    results["mandi_prices"] = passed

    # 7. Aggregation & Lots
    passed, agg_res = check_endpoint("Lots - Trigger DBSCAN Aggregation", "POST", "/api/internal/aggregate", headers=farmer_headers)
    results["lots_aggregate"] = passed

    passed, lots_data = check_endpoint("Lots - List Open Lots", "GET", "/api/lots", params={"crop": "Tomato"})
    results["lots_list"] = passed

    lots = lots_data.get("lots", []) if isinstance(lots_data, dict) else []
    lot_id = lots[0]["id"] if lots else None

    if lot_id:
        passed, _ = check_endpoint("Lots - Get Lot Details", "GET", f"/api/lots/{lot_id}")
        results["lots_get_detail"] = passed
    else:
        log("No lot available to test GET /api/lots/{id}, creating one or continuing...", "WARN")

    # 8. Phygital Trust & Pregrade
    passed, pregrade_res = check_endpoint("Phygital - Pregrade Crop", "POST", "/api/phygital/pregrade", headers=farmer_headers, json_data={
        "listing_id": listing_id or "00000000-0000-0000-0000-000000000000",
        "farmer_id": farmer_id or "farmer-01",
        "crop_type": "Tomato",
        "quantity_kg": 150.0,
        "image_base64": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP...",
    })
    results["phygital_pregrade"] = passed

    passed, trust_data = check_endpoint("Phygital - Trust Profile", "GET", f"/api/phygital/trust-profile/{farmer_id or 'farmer-01'}", headers=farmer_headers)
    results["phygital_trust_profile"] = passed

    # 9. Demo Checkout & Orders
    demo_order_payload = {
        "listing_id": listing_id,
        "buyer_id": buyer_id or "buyer-01",
        "farmer_id": farmer_id or "farmer-01",
        "crop_type": "Tomato",
        "quantity_kg": 50.0,
        "price_per_kg": 24.0,
        "total_amount": 1200.0,
        "payment_method": "upi",
        "upi_id": "buyer@okhdfcbank",
        "delivery_address": "Shop 4, APMC Market, Raipur"
    }
    passed, checkout_res = check_endpoint("Payments - Demo Escrow Checkout", "POST", "/api/payments/demo-checkout", headers=buyer_headers, json_data=demo_order_payload)
    results["payments_demo_checkout"] = passed

    created_order_id = checkout_res.get("order_id") if isinstance(checkout_res, dict) else None

    # Orders List
    passed, orders_list = check_endpoint("Orders - List Orders", "GET", "/api/orders", headers=buyer_headers)
    results["orders_list"] = passed

    # 10. Routing Optimization & Compare
    routing_payload = {
        "order_id": created_order_id or "order-test-01",
        "pickups": [
            {"lat": 21.2514, "lng": 81.6296, "quantity_kg": 50, "farmer_id": "f1"}
        ],
        "dropoff": {"lat": 21.2400, "lng": 81.6400, "buyer_id": "b1"}
    }
    passed, _ = check_endpoint("Routing - Optimize Route", "POST", "/api/routing/optimize", json_data=routing_payload)
    results["routing_optimize"] = passed

    passed, _ = check_endpoint("Routing - Compare Logistics", "POST", "/api/routing/compare", json_data=routing_payload)
    results["routing_compare"] = passed

    # 11. Settlement Payout
    settlement_payload = {
        "order_id": created_order_id or "00000000-0000-0000-0000-000000000000",
        "stage": "delivered"
    }
    passed, _ = check_endpoint("Settlement - Payout Flow", "POST", "/api/settlement/payout", json_data=settlement_payload, expected_status=[200, 400, 404])
    results["settlement_payout"] = passed

    # Summary
    print("\n" + "="*50)
    total = len(results)
    passed_cnt = sum(1 for v in results.values() if v)
    log(f"Test Run Complete: {passed_cnt}/{total} tests passed ({passed_cnt/total*100:.1f}%)", "PASS" if passed_cnt == total else "WARN")
    print("="*50)

    return passed_cnt == total

if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
