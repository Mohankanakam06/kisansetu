import os
import json
import requests
from dotenv import load_dotenv
from psycopg2.extras import Json
from backend.db import get_conn

load_dotenv()

ORS_KEY = os.environ.get("ORS_API_KEY")
ORS_URL = "https://api.openrouteservice.org/v2/directions/driving-car/geojson"


def _call_ors_directions(coordinates: list, radius_m: int = 5000):
    """
    Helper to call OpenRouteService directions endpoint with snap radius for rural coordinates.
    """
    api_key = os.environ.get("ORS_API_KEY", ORS_KEY)
    headers = {
        "Authorization": api_key,
        "Content-Type": "application/json",
    }
    payload = {
        "coordinates": coordinates,
        "radiuses": [radius_m] * len(coordinates),
    }
    resp = requests.post(
        ORS_URL,
        headers=headers,
        json=payload,
        timeout=15,
    )
    resp.raise_for_status()
    return resp.json()


def optimize_route(order_id: str):
    """
    Computes a consolidated multi-pickup delivery route for an order.
    Picks up from each farmer listing associated with the lot and delivers to the buyer.
    """
    conn = get_conn()
    cur = conn.cursor()

    cur.execute("""
        SELECT o.id AS order_id, l.id AS lot_id, l.centroid, u.location AS buyer_location,
               ST_X(l.centroid::geometry) AS lot_lng, ST_Y(l.centroid::geometry) AS lot_lat,
               ST_X(u.location::geometry) AS buyer_lng, ST_Y(u.location::geometry) AS buyer_lat
        FROM orders o
        JOIN lots l ON o.lot_id = l.id
        JOIN users u ON o.buyer_id = u.id
        WHERE o.id = %s
    """, (order_id,))
    row = cur.fetchone()
    if not row:
        raise ValueError(f"Order {order_id} not found or missing lot/buyer information.")

    if row["lot_lng"] is None or row["lot_lat"] is None:
        row["lot_lng"] = 81.6296
        row["lot_lat"] = 21.2514
    if row["buyer_lng"] is None or row["buyer_lat"] is None:
        row["buyer_lng"] = 81.6296
        row["buyer_lat"] = 21.2514

    # Get the individual listings that feed this lot (multi-pickup stops)
    cur.execute("""
        SELECT li.id, li.farmer_id, li.crop_type, li.quantity_kg,
               ST_X(li.location::geometry) AS lng, ST_Y(li.location::geometry) AS lat
        FROM lot_listings ll
        JOIN listings li ON ll.listing_id = li.id
        JOIN orders o ON o.lot_id = ll.lot_id
        WHERE o.id = %s
    """, (order_id,))
    stops = cur.fetchall()

    valid_stops = []
    for s in stops:
        if s["lng"] is None or s["lat"] is None:
            s["lng"] = 81.6296
            s["lat"] = 21.2514
        valid_stops.append(s)

    if not valid_stops:
        coords = [[row["lot_lng"], row["lot_lat"]], [row["buyer_lng"], row["buyer_lat"]]]
    else:
        coords = [[s["lng"], s["lat"]] for s in valid_stops] + [[row["buyer_lng"], row["buyer_lat"]]]

    geojson = _call_ors_directions(coords)
    distance_m = geojson["features"][0]["properties"]["summary"]["distance"]
    duration_s = geojson["features"][0]["properties"]["summary"]["duration"]

    cur.execute("""
        INSERT INTO routes (order_id, route_geojson, distance_km, eta)
        VALUES (%s, %s, %s, now() + (%s || ' seconds')::interval)
        RETURNING id, distance_km, eta, created_at
    """, (order_id, Json(geojson), distance_m / 1000.0, int(duration_s)))
    route_row = cur.fetchone()
    conn.commit()

    # build the response stops matching PRD
    formatted_stops = [
        {"listing_id": s["id"], "lat": float(s["lat"]), "lng": float(s["lng"])}
        for s in valid_stops
    ]

    return {
        "route_geojson": geojson,
        "distance_km": round(distance_m / 1000.0, 2),
        "eta": str(route_row["eta"]),
        "stops": formatted_stops,
    }


def compare_individual_vs_consolidated(order_id: str):
    """
    For the demo: Compare individual point-to-point trips vs one consolidated route.
    Calculates distance, time, estimated fuel cost, and CO2 emissions saved.
    """
    conn = get_conn()
    cur = conn.cursor()

    cur.execute("""
        SELECT o.id AS order_id, u.location AS buyer_location,
               ST_X(u.location::geometry) AS buyer_lng, ST_Y(u.location::geometry) AS buyer_lat
        FROM orders o
        JOIN users u ON o.buyer_id = u.id
        WHERE o.id = %s
    """, (order_id,))
    order_info = cur.fetchone()
    if not order_info:
        raise ValueError(f"Order {order_id} not found.")

    if order_info["buyer_lng"] is None or order_info["buyer_lat"] is None:
        order_info["buyer_lng"] = 81.6296
        order_info["buyer_lat"] = 21.2514

    cur.execute("""
        SELECT li.id, li.farmer_id, li.quantity_kg,
               ST_X(li.location::geometry) AS lng, ST_Y(li.location::geometry) AS lat
        FROM lot_listings ll
        JOIN listings li ON ll.listing_id = li.id
        JOIN orders o ON o.lot_id = ll.lot_id
        WHERE o.id = %s
    """, (order_id,))
    stops = cur.fetchall()

    valid_stops = []
    for s in stops:
        if s["lng"] is None or s["lat"] is None:
            s["lng"] = 81.6296
            s["lat"] = 21.2514
        valid_stops.append(s)

    buyer_coord = [order_info["buyer_lng"], order_info["buyer_lat"]]

    individual_trips = []
    total_individual_dist_m = 0.0
    total_individual_dur_s = 0.0

    for idx, s in enumerate(valid_stops):
        stop_coord = [s["lng"], s["lat"]]
        try:
            trip_geojson = _call_ors_directions([stop_coord, buyer_coord])
            dist_m = trip_geojson["features"][0]["properties"]["summary"]["distance"]
            dur_s = trip_geojson["features"][0]["properties"]["summary"]["duration"]
            total_individual_dist_m += dist_m
            total_individual_dur_s += dur_s
            individual_trips.append({
                "listing_id": s["id"],
                "stop_index": idx + 1,
                "distance_km": round(dist_m / 1000.0, 2),
                "duration_minutes": round(dur_s / 60.0, 1),
            })
        except Exception as e:
            pass

    # Consolidated route
    consolidated_coords = [[s["lng"], s["lat"]] for s in valid_stops] + [buyer_coord]
    consolidated_geojson = _call_ors_directions(consolidated_coords)
    consolidated_dist_m = consolidated_geojson["features"][0]["properties"]["summary"]["distance"]
    consolidated_dur_s = consolidated_geojson["features"][0]["properties"]["summary"]["duration"]

    indiv_km = round(total_individual_dist_m / 1000.0, 2)
    consol_km = round(consolidated_dist_m / 1000.0, 2)
    saved_km = max(0.0, round(indiv_km - consol_km, 2))
    saved_pct = round((saved_km / indiv_km * 100), 1) if indiv_km > 0 else 0.0

    # Emission & cost estimations (approx 0.15 kg CO2 per km for small commercial vehicle, ₹12/km logistics)
    co2_saved_kg = round(saved_km * 0.15, 2)
    cost_saved_inr = round(saved_km * 12.0, 2)

    return {
        "order_id": order_id,
        "stops_count": len(stops),
        "individual_trips": {
            "total_distance_km": indiv_km,
            "total_duration_minutes": round(total_individual_dur_s / 60.0, 1),
            "trips": individual_trips,
        },
        "consolidated_route": {
            "total_distance_km": consol_km,
            "total_duration_minutes": round(consolidated_dur_s / 60.0, 1),
        },
        "savings": {
            "distance_saved_km": saved_km,
            "percentage_saved": saved_pct,
            "estimated_cost_saved_inr": cost_saved_inr,
            "estimated_co2_saved_kg": co2_saved_kg,
        },
    }
