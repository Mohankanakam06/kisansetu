import os
import uuid
import json
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock

from backend.main import app

# In-memory storage for end-to-end testing
class MockDB:
    def __init__(self):
        self.reset()

    def reset(self):
        self.users = {
            "farmer-uuid-1": {
                "id": "farmer-uuid-1",
                "name": "Ramesh Kumar",
                "phone": "9876543210",
                "role": "farmer",
                "lat": 22.6939,
                "lng": 72.8618,
            },
            "farmer-uuid-2": {
                "id": "farmer-uuid-2",
                "name": "Suresh Patel",
                "phone": "9876543211",
                "role": "farmer",
                "lat": 22.6950,
                "lng": 72.8630,
            },
            "buyer-uuid-1": {
                "id": "buyer-uuid-1",
                "name": "Agro Fresh Mart",
                "phone": "8876543210",
                "role": "buyer",
                "lat": 22.7000,
                "lng": 72.8700,
            },
        }
        self.listings = {
            "listing-default-1": {
                "id": "listing-default-1",
                "farmer_id": "farmer-uuid-1",
                "crop_type": "tomato",
                "quantity_kg": 200.0,
                "price_expectation": 25.0,
                "lat": 22.6939,
                "lng": 72.8618,
                "status": "clustered",
                "created_at": "2026-09-07T10:00:00Z",
            },
            "listing-default-2": {
                "id": "listing-default-2",
                "farmer_id": "farmer-uuid-2",
                "crop_type": "tomato",
                "quantity_kg": 300.0,
                "price_expectation": 25.0,
                "lat": 22.6950,
                "lng": 72.8630,
                "status": "clustered",
                "created_at": "2026-09-07T10:00:00Z",
            }
        }
        self.lots = {
            "lot-default-1": {
                "id": "lot-default-1",
                "crop_type": "tomato",
                "total_quantity_kg": 500.0,
                "grade": "A",
                "lat": 22.6945,
                "lng": 72.8624,
                "status": "open",
                "created_at": "2026-09-07T10:00:00Z",
            }
        }
        self.lot_listings = [
            {"lot_id": "lot-default-1", "listing_id": "listing-default-1"},
            {"lot_id": "lot-default-1", "listing_id": "listing-default-2"}
        ]
        self.quality_grades = {}
        self.orders = {}
        self.routes = {}
        self.payments = []
        self.price_history = [
            {"crop_type": "tomato", "avg_price": 25.0, "date": "2026-09-01"}
        ]

mock_db = MockDB()

class MockCursor:
    def __init__(self, db: MockDB):
        self.db = db
        self.last_result = None

    def execute(self, query, params=None):
        q = query.strip()
        params = params or ()

        # INSERT INTO users
        if "INSERT INTO users" in q:
            uid = params[0]
            name = params[1]
            phone = params[2] if len(params) > 2 else "9876543210"
            role = params[3] if len(params) > 3 else "farmer"
            lang = params[4] if len(params) > 4 else "hi"
            self.db.users[uid] = {
                "id": uid,
                "name": name,
                "phone": phone,
                "role": role,
                "language_pref": lang,
                "lat": 22.6939,
                "lng": 72.8618
            }
            self.last_result = [{
                "id": uid,
                "name": name,
                "phone": phone,
                "role": role,
                "language_pref": lang
            }]

        # INSERT INTO listings
        elif "INSERT INTO listings" in q:
            fid, crop, qty, price, lng, lat = params
            lid = str(uuid.uuid4())
            self.db.listings[lid] = {
                "id": lid,
                "farmer_id": fid,
                "crop_type": crop,
                "quantity_kg": float(qty),
                "price_expectation": float(price),
                "lat": float(lat),
                "lng": float(lng),
                "status": "active",
                "created_at": "2026-09-07T10:00:00Z",
            }
            self.last_result = [{"id": lid}]

        # INSERT INTO lots
        elif "INSERT INTO lots" in q:
            crop, qty, avg_lng, avg_lat = params
            lot_id = str(uuid.uuid4())
            self.db.lots[lot_id] = {
                "id": lot_id,
                "crop_type": crop,
                "total_quantity_kg": float(qty),
                "grade": "A",
                "lat": float(avg_lat),
                "lng": float(avg_lng),
                "status": "open",
                "created_at": "2026-09-07T10:00:00Z",
            }
            self.last_result = [{"id": lot_id}]

        # INSERT INTO lot_listings
        elif "INSERT INTO lot_listings" in q:
            lot_id, listing_id = params
            self.db.lot_listings.append({"lot_id": lot_id, "listing_id": listing_id})
            self.last_result = []

        # INSERT INTO quality_grades
        elif "INSERT INTO quality_grades" in q:
            lot_id, grade, defects, photo_url = params
            qid = str(uuid.uuid4())
            self.db.quality_grades[qid] = {
                "id": qid,
                "lot_id": lot_id,
                "grade": grade,
                "defects": defects,
                "photo_url": photo_url
            }
            self.last_result = [{"id": qid}]

        # INSERT INTO orders
        elif "INSERT INTO orders" in q:
            buyer_id, lot_id, qty = params
            oid = str(uuid.uuid4())
            self.db.orders[oid] = {
                "id": oid,
                "buyer_id": buyer_id,
                "lot_id": lot_id,
                "quantity_kg": float(qty),
                "status": "placed",
                "created_at": "2026-09-07T10:15:00Z"
            }
            self.last_result = [{
                "id": oid,
                "buyer_id": buyer_id,
                "lot_id": lot_id,
                "quantity_kg": float(qty),
                "status": "placed",
                "created_at": "2026-09-07T10:15:00Z"
            }]

        # INSERT INTO routes
        elif "INSERT INTO routes" in q:
            oid, geojson, dist, dur = params
            rid = str(uuid.uuid4())
            self.last_result = [{
                "id": rid,
                "distance_km": dist,
                "eta": "2026-09-07T11:00:00Z",
                "created_at": "2026-09-07T10:00:00Z"
            }]

        # INSERT INTO payments
        elif "INSERT INTO payments" in q:
            oid, fid, amt, status = params
            pid = str(uuid.uuid4())
            self.db.payments.append({
                "id": pid,
                "order_id": oid,
                "farmer_id": fid,
                "amount": float(amt),
                "status": status
            })
            self.last_result = [{
                "id": pid,
                "farmer_id": fid,
                "amount": float(amt),
                "status": status,
                "paid_at": "2026-09-07T10:30:00Z"
            }]

        # UPDATE listings
        elif "UPDATE listings" in q:
            lid = params[0]
            if lid in self.db.listings:
                self.db.listings[lid]["status"] = "clustered"
            self.last_result = []

        # UPDATE lots
        elif "UPDATE lots" in q:
            grade, lot_id = params
            if lot_id in self.db.lots:
                self.db.lots[lot_id]["grade"] = grade
            self.last_result = []

        # UPDATE orders
        elif "UPDATE orders" in q:
            new_status, oid = params
            if oid in self.db.orders:
                self.db.orders[oid]["status"] = new_status
            self.last_result = []

        # SELECT FROM lots
        elif "FROM lots" in q:
            if params and len(params) > 0 and ("id = %s" in q or "l.id = %s" in q):
                lot_id = params[0]
                lot = self.db.lots.get(lot_id)
                if lot:
                    self.last_result = [{
                        "id": lot["id"],
                        "crop_type": lot["crop_type"],
                        "total_quantity_kg": lot["total_quantity_kg"],
                        "grade": lot.get("grade", "A"),
                        "status": lot["status"],
                        "created_at": lot["created_at"],
                        "lat": lot["lat"],
                        "lng": lot["lng"],
                        "listings_count": len([ll for ll in self.db.lot_listings if ll["lot_id"] == lot_id]) or 1,
                        "price_per_kg": 25.0,
                        "photo_url": "https://images.unsplash.com/photo-1592924357228-91a4daadcfea",
                        "defects": []
                    }]
                else:
                    self.last_result = []
            else:
                rows = []
                for lot_id, lot in self.db.lots.items():
                    if lot["status"] == "open":
                        rows.append({
                            "id": lot["id"],
                            "crop_type": lot["crop_type"],
                            "total_quantity_kg": lot["total_quantity_kg"],
                            "grade": lot.get("grade", "A"),
                            "status": lot["status"],
                            "created_at": lot["created_at"],
                            "lat": lot["lat"],
                            "lng": lot["lng"],
                            "listings_count": len([ll for ll in self.db.lot_listings if ll["lot_id"] == lot_id]) or 1,
                            "price_per_kg": 25.0,
                            "photo_url": "https://images.unsplash.com/photo-1592924357228-91a4daadcfea",
                            "defects": []
                        })
                self.last_result = rows

        # SELECT FROM orders
        elif "FROM orders" in q:
            if params and len(params) > 0 and ("id = %s" in q or "o.id = %s" in q):
                oid = params[0]
                order = self.db.orders.get(oid)
                if order:
                    lot = self.db.lots.get(order["lot_id"], {})
                    buyer = self.db.users.get(order["buyer_id"], {})
                    self.last_result = [{
                        "order_id": order["id"],
                        "lot_id": order["lot_id"],
                        "centroid": True,
                        "buyer_location": True,
                        "lot_lng": lot.get("lng", 72.8618),
                        "lot_lat": lot.get("lat", 22.6939),
                        "buyer_lng": buyer.get("lng", 72.8700),
                        "buyer_lat": buyer.get("lat", 22.7000),
                        "id": order["id"],
                        "buyer_id": order["buyer_id"],
                        "quantity_kg": order["quantity_kg"],
                        "status": order["status"],
                        "created_at": order["created_at"],
                        "crop_type": lot.get("crop_type", "tomato"),
                        "total_quantity_kg": lot.get("total_quantity_kg", 200.0),
                        "buyer_name": buyer.get("name", "Buyer")
                    }]
                else:
                    self.last_result = []
            else:
                orders_list = []
                for oid, order in self.db.orders.items():
                    lot = self.db.lots.get(order["lot_id"], {})
                    buyer = self.db.users.get(order["buyer_id"], {})
                    orders_list.append({
                        "id": order["id"],
                        "order_id": order["id"],
                        "buyer_id": order["buyer_id"],
                        "buyer_name": buyer.get("name", "Buyer"),
                        "lot_id": order["lot_id"],
                        "crop_type": lot.get("crop_type", "tomato"),
                        "quantity_kg": order["quantity_kg"],
                        "status": order["status"],
                        "created_at": order["created_at"]
                    })
                self.last_result = orders_list

        # SELECT lot_listings / stops / farmer listings for lot/order
        elif "FROM lot_listings" in q or "JOIN lot_listings" in q:
            stops = []
            for item in self.db.lot_listings:
                lid = item["listing_id"]
                listing = self.db.listings.get(lid)
                if listing:
                    stops.append({
                        "id": listing["id"],
                        "listing_id": listing["id"],
                        "farmer_id": listing["farmer_id"],
                        "crop_type": listing["crop_type"],
                        "quantity_kg": listing["quantity_kg"],
                        "price_per_kg": listing["price_expectation"],
                        "farmer_name": "Farmer",
                        "farmer_phone": "+91 90000 00000",
                        "lng": listing["lng"],
                        "lat": listing["lat"]
                    })
            self.last_result = stops

        # SELECT FROM users
        elif "FROM users" in q:
            param_val = params[0] if params else None
            user_match = None
            if param_val:
                # check by id or by phone
                user_match = self.db.users.get(param_val)
                if not user_match:
                    user_match = next((u for u in self.db.users.values() if u.get("phone") == param_val), None)
            elif "role = 'buyer'" in q:
                user_match = next((u for u in self.db.users.values() if u.get("role") == "buyer"), None)
            elif "role = 'farmer'" in q:
                user_match = next((u for u in self.db.users.values() if u.get("role") == "farmer"), None)
            else:
                user_match = next(iter(self.db.users.values()), None)

            if user_match:
                self.last_result = [{
                    "id": user_match["id"],
                    "name": user_match["name"],
                    "phone": user_match["phone"],
                    "role": user_match["role"],
                    "language_pref": user_match.get("language_pref", "hi")
                }]
            else:
                self.last_result = []

        # SELECT FROM price_history
        elif "FROM price_history" in q:
            self.last_result = [{"avg_price": 25.0}]

        # SELECT from listings active for DBSCAN aggregation
        elif "FROM listings" in q:
            rows = []
            for lid, l in self.db.listings.items():
                if l["status"] == "active":
                    rows.append({
                        "id": lid,
                        "crop_type": l["crop_type"],
                        "quantity_kg": l["quantity_kg"],
                        "lng": l["lng"],
                        "lat": l["lat"],
                        "cluster_id": 0  # mock all in cluster 0
                    })
            self.last_result = rows

        else:
            self.last_result = []

    def fetchone(self):
        if self.last_result and len(self.last_result) > 0:
            return self.last_result[0]
        return None

    def fetchall(self):
        return self.last_result or []

class MockConnection:
    def __init__(self, db: MockDB):
        self.db = db

    def cursor(self):
        return MockCursor(self.db)

    def commit(self):
        pass

    def close(self):
        pass

def get_mock_conn():
    return MockConnection(mock_db)

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_mock_db():
    mock_db.reset()

# -------------------------------------------------------------
# End-to-End Verification Test Flow per PRD Sections 1, 4, 5
# -------------------------------------------------------------

def test_full_end_to_end_flow():
    """
    Step-by-step verification of the complete marketplace flow:
    1. Create farmer listing
    2. Confirm it appears as active in DB
    3. Run aggregation to form a lot
    4. Quality grading via vision rubric
    5. Buyer dashboard lot listing
    6. Place an order
    7. Route optimization
    8. Settlement payout (pickup stage)
    """
    mock_gen_resp = MagicMock()
    mock_gen_resp.text = json.dumps({"grade": "A", "defects": []})
    mock_model_instance = MagicMock()
    mock_model_instance.generate_content.return_value = mock_gen_resp

    with patch("backend.db.get_conn", side_effect=get_mock_conn), \
         patch("backend.routes.auth.get_conn", side_effect=get_mock_conn), \
         patch("ai.agents.farmer_interface.get_conn", side_effect=get_mock_conn), \
         patch("ai.agents.farmer_interface.parse_listing", side_effect=lambda transcript, lang="hi": {
             "crop_type": "tomato",
             "quantity_kg": 300.0 if "teen sau" in transcript else 200.0,
             "price_expectation": 25.0
         }), \
         patch("ai.agents.aggregations.get_conn", side_effect=get_mock_conn), \
         patch("ai.agents.quality_grading.get_conn", side_effect=get_mock_conn), \
         patch("ai.agents.quality_grading.requests.get", return_value=MagicMock(content=b"fake_jpeg_bytes")), \
         patch("ai.agents.quality_grading._genai_client", MagicMock()), \
         patch("ai.agents.routing.get_conn", side_effect=get_mock_conn), \
         patch("ai.agents.settlement.get_conn", side_effect=get_mock_conn), \
         patch("backend.main.get_conn", side_effect=get_mock_conn), \
         patch("ai.agents.routing._call_ors_directions", return_value={
             "type": "FeatureCollection",
             "features": [{
                 "properties": {
                     "summary": {"distance": 12500, "duration": 1800}
                 },
                 "geometry": {"type": "LineString", "coordinates": [[72.8618, 22.6939], [72.8700, 22.7000]]}
             }]
         }):

        # ---------------------------------------------------------
        # Step 1: Create a farmer listing via POST /api/farmer/listing
        # ---------------------------------------------------------
        listing_payload = {
            "farmer_id": "farmer-uuid-1",
            "transcript": "mujhe do quintal tamatar bechna hai",
            "language": "hi",
            "lat": 22.6939,
            "lng": 72.8618
        }
        res = client.post("/api/farmer/listing", json=listing_payload)
        assert res.status_code == 200, f"Failed at /api/farmer/listing: {res.text}"
        data = res.json()
        assert "listing_id" in data, "listing_id missing in response"
        assert data["crop_type"] == "tomato"
        assert data["quantity_kg"] == 200.0
        assert data["location"] == {"lat": 22.6939, "lng": 72.8618}
        listing_id_1 = data["listing_id"]

        # Create a second listing nearby so aggregation clusters them
        listing_payload_2 = {
            "farmer_id": "farmer-uuid-2",
            "transcript": "teen sau kilo tamatar",
            "language": "hi",
            "lat": 22.6950,
            "lng": 72.8630
        }
        res2 = client.post("/api/farmer/listing", json=listing_payload_2)
        assert res2.status_code == 200
        listing_id_2 = res2.json()["listing_id"]

        # ---------------------------------------------------------
        # Step 2: Confirm listings appear as active in the DB
        # ---------------------------------------------------------
        assert listing_id_1 in mock_db.listings
        assert mock_db.listings[listing_id_1]["status"] == "active"
        assert mock_db.listings[listing_id_2]["status"] == "active"

        # ---------------------------------------------------------
        # Step 3: Run aggregation job & confirm cluster into a lot
        # ---------------------------------------------------------
        res_agg = client.post("/api/internal/aggregate")
        assert res_agg.status_code == 200
        agg_data = res_agg.json()
        assert len(agg_data["lots_created"]) > 0
        lot_id = agg_data["lots_created"][0]

        # Verify DB state after clustering
        assert lot_id in mock_db.lots
        assert mock_db.lots[lot_id]["status"] == "open"
        assert mock_db.listings[listing_id_1]["status"] == "clustered"
        assert mock_db.listings[listing_id_2]["status"] == "clustered"

        # ---------------------------------------------------------
        # Step 4: Quality grading agent returns a grade
        # ---------------------------------------------------------
        grade_payload = {
            "lot_id": lot_id,
            "photo_url": "https://example.com/fresh_tomatoes.jpg"
        }
        res_grade = client.post("/api/quality/grade", json=grade_payload)
        assert res_grade.status_code == 200
        grade_data = res_grade.json()
        assert grade_data["grade"] in ["A", "B", "C"]
        assert "defects" in grade_data
        assert mock_db.lots[lot_id]["grade"] == grade_data["grade"]

        # ---------------------------------------------------------
        # Step 5: Confirm lot appears on buyer dashboard with correct grade & price
        # ---------------------------------------------------------
        res_lots = client.get("/api/lots")
        assert res_lots.status_code == 200
        lots_data = res_lots.json()
        assert "lots" in lots_data
        matching_lot = next((l for l in lots_data["lots"] if l["id"] == lot_id), None)
        assert matching_lot is not None, f"Lot {lot_id} not found in /api/lots"
        assert matching_lot["crop_type"] == "tomato"
        assert matching_lot["grade"] == grade_data["grade"]
        assert matching_lot["centroid"]["lat"] is not None
        assert matching_lot["centroid"]["lng"] is not None
        assert matching_lot["price_per_kg"] > 0

        # ---------------------------------------------------------
        # Step 6: Place an order
        # ---------------------------------------------------------
        order_payload = {
            "buyer_id": "buyer-uuid-1",
            "lot_id": lot_id,
            "quantity_kg": 150.0
        }
        res_order = client.post("/api/orders", json=order_payload)
        assert res_order.status_code == 200
        order_data = res_order.json()
        assert "order_id" in order_data
        assert order_data["status"] == "placed"
        order_id = order_data["order_id"]

        # ---------------------------------------------------------
        # Step 7: Run route optimization
        # ---------------------------------------------------------
        route_payload = {"order_id": order_id}
        res_route = client.post("/api/routing/optimize", json=route_payload)
        assert res_route.status_code == 200
        route_data = res_route.json()
        assert "route_geojson" in route_data
        assert route_data["distance_km"] > 0
        assert "eta" in route_data
        assert "stops" in route_data
        assert len(route_data["stops"]) > 0
        for stop in route_data["stops"]:
            assert "listing_id" in stop
            assert "lat" in stop
            assert "lng" in stop

        # ---------------------------------------------------------
        # Step 8: Trigger settlement for pickup stage
        # ---------------------------------------------------------
        settle_payload = {
            "order_id": order_id,
            "stage": "pickup"
        }
        res_settle = client.post("/api/settlement/payout", json=settle_payload)
        assert res_settle.status_code == 200
        settle_data = res_settle.json()
        assert settle_data["payment_status"] == "partial_paid"
        assert settle_data["disbursed_total_inr"] > 0
        assert mock_db.orders[order_id]["status"] == "picked_up"

        print("\nAll 8 E2E verification steps passed successfully!")


def test_auth_flow():
    """
    Test the authentication workflow matching the frontend design:
    1. Send OTP for mobile number
    2. Verify OTP and receive JWT token
    3. Access /api/auth/me with Bearer token
    4. Register a new buyer account and auto-login
    """
    with patch("backend.db.get_conn", side_effect=get_mock_conn), \
         patch("backend.routes.auth.get_conn", side_effect=get_mock_conn):

        # Step 1: Send OTP
        send_res = client.post("/api/auth/send-otp", json={"phone": "9876543210", "role": "farmer"})
        assert send_res.status_code == 200
        send_data = send_res.json()
        assert send_data["success"] is True
        otp_code = send_data.get("otp_debug", "123456")

        # Step 2: Verify OTP
        verify_res = client.post("/api/auth/verify-otp", json={
            "phone": "9876543210",
            "otp": otp_code,
            "role": "farmer"
        })
        assert verify_res.status_code == 200
        verify_data = verify_res.json()
        assert "token" in verify_data
        assert verify_data["user"]["phone"] == "9876543210"
        assert verify_data["redirect"] == "/farmer"
        jwt_token = verify_data["token"]

        # Step 3: Fetch profile with JWT
        me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {jwt_token}"})
        assert me_res.status_code == 200
        me_data = me_res.json()
        assert me_data["user"]["phone"] == "9876543210"

        # Step 4: Register new user
        reg_res = client.post("/api/auth/register", json={
            "name": "Anil Sharma",
            "phone": "9123456780",
            "role": "buyer",
            "language": "hi",
            "location": "Raipur Central Mandi"
        })
        assert reg_res.status_code == 200
        reg_data = reg_res.json()
        assert reg_data["success"] is True
        assert reg_data["user"]["name"] == "Anil Sharma"
        assert reg_data["redirect"] == "/buyer"

