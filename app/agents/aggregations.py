from app.db import get_conn

def run_aggregation(eps_km: float = 3.0, min_points: int = 2):
    """Cluster active listings of the same crop into lots."""
    conn = get_conn()
    cur = conn.cursor()

    cur.execute("""
        SELECT id, crop_type, quantity_kg,
               ST_X(location::geometry) AS lng,
               ST_Y(location::geometry) AS lat,
               ST_ClusterDBSCAN(location::geometry, eps := %s, minpoints := %s)
                 OVER (PARTITION BY crop_type) AS cluster_id
        FROM listings
        WHERE status = 'active'
    """, (eps_km / 111.0, min_points))  # deg-per-km approximation
    rows = cur.fetchall()

    clusters = {}
    for r in rows:
        if r["cluster_id"] is None:
            continue  # noise point, not enough nearby listings yet
        key = (r["crop_type"], r["cluster_id"])
        clusters.setdefault(key, []).append(r)

    created = []
    for (crop, _), listings in clusters.items():
        total_qty = sum(l["quantity_kg"] for l in listings)
        avg_lng = sum(l["lng"] for l in listings) / len(listings)
        avg_lat = sum(l["lat"] for l in listings) / len(listings)

        cur.execute("""
            INSERT INTO lots (crop_type, total_quantity_kg, centroid)
            VALUES (%s, %s, ST_MakePoint(%s, %s)::geography)
            RETURNING id
        """, (crop, total_qty, avg_lng, avg_lat))
        lot_id = cur.fetchone()["id"]

        for l in listings:
            cur.execute(
                "INSERT INTO lot_listings (lot_id, listing_id) VALUES (%s, %s)",
                (lot_id, l["id"]))
            cur.execute(
                "UPDATE listings SET status = 'clustered' WHERE id = %s",
                (l["id"],))

        created.append(lot_id)

    conn.commit()
    return created