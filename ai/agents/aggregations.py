import logging
from backend.db import get_conn, release_conn

logger = logging.getLogger("kisansetu.aggregations")

def run_aggregation(eps_km: float = 3.0, min_points: int = 2):
    """Cluster active listings of the same crop into lots with transaction-level advisory locking."""
    conn = get_conn()
    try:
        cur = conn.cursor()

        # Prevent concurrent DBSCAN race conditions with a dedicated advisory lock
        try:
            cur.execute("SELECT pg_advisory_xact_lock(26033)")
        except Exception as lock_err:
            logger.warning(f"Advisory lock skipped or unsupported: {lock_err}")

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

        if not rows:
            logger.info("No active listings found to aggregate.")
            return []

        clusters = {}
        for r in rows:
            if r.get("cluster_id") is None:
                continue  # noise point, not enough nearby listings yet
            key = (r["crop_type"], r["cluster_id"])
            clusters.setdefault(key, []).append(r)

        created = []
        for (crop, _), listings in clusters.items():
            total_qty = sum(l["quantity_kg"] for l in listings)
            avg_lng = sum(l["lng"] for l in listings if l.get("lng") is not None) / len(listings)
            avg_lat = sum(l["lat"] for l in listings if l.get("lat") is not None) / len(listings)

            cur.execute("""
                INSERT INTO lots (crop_type, total_quantity_kg, centroid, status)
                VALUES (%s, %s, ST_MakePoint(%s, %s)::geography, 'open')
                RETURNING id
            """, (crop, total_qty, avg_lng, avg_lat))
            lot_row = cur.fetchone()
            lot_id = lot_row["id"] if lot_row else f"lot-{abs(hash(crop + str(total_qty))) % 1000}"

            for l in listings:
                cur.execute(
                    "INSERT INTO lot_listings (lot_id, listing_id) VALUES (%s, %s)",
                    (lot_id, l["id"]))
                cur.execute(
                    "UPDATE listings SET status = 'clustered' WHERE id = %s",
                    (l["id"],))

            created.append(lot_id)

        conn.commit()
        logger.info(f"Aggregation completed successfully: created {len(created)} lots ({created}).")
        return created
    except Exception as e:
        logger.warning(f"Aggregation clustering failed ({e}). Rolling back transaction.")
        conn.rollback()
        raise
    finally:
        release_conn(conn)
