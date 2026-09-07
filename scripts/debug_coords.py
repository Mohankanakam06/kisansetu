from backend.db import get_conn
conn = get_conn()
cur = conn.cursor()
order_id = "0027077b-898b-444f-92ea-23c51beaa738"

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
print("Row:", row)

cur.execute("""
    SELECT li.id, li.farmer_id, li.crop_type, li.quantity_kg,
            ST_X(li.location::geometry) AS lng, ST_Y(li.location::geometry) AS lat
    FROM lot_listings ll
    JOIN listings li ON ll.listing_id = li.id
    JOIN orders o ON o.lot_id = ll.lot_id
    WHERE o.id = %s
""", (order_id,))
stops = cur.fetchall()
print("Stops:", stops)
coords = [[s["lng"], s["lat"]] for s in stops] + [[row["buyer_lng"], row["buyer_lat"]]]
print("Coords:", coords)
conn.close()
