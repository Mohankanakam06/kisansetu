import uuid, random, datetime
from app.db import get_conn

# three loose village clusters (lat, lng) — tweak to your state
CLUSTERS = [
    (22.6939, 72.8618),  # Nadiad area
    (22.7500, 72.9000),
    (22.6000, 72.7500),
]
CROPS = ["tomato", "wheat", "onion"]

def jitter(lat, lng, km=2):
    d = km / 111  # rough deg-per-km
    return lat + random.uniform(-d, d), lng + random.uniform(-d, d)

def seed():
    conn = get_conn()
    cur = conn.cursor()

    # wipe in FK-safe order
    for t in ["payments", "routes", "orders", "quality_grades",
              "lot_listings", "lots", "listings", "price_history", "users"]:
        cur.execute(f"TRUNCATE {t} CASCADE")

    farmer_ids = []
    for i in range(15):
        lat, lng = jitter(*random.choice(CLUSTERS))
        fid = str(uuid.uuid4())
        farmer_ids.append((fid, lat, lng))
        cur.execute("""
            INSERT INTO users (id, name, phone, role, location)
            VALUES (%s, %s, %s, 'farmer', ST_MakePoint(%s, %s)::geography)
        """, (fid, f"Farmer {i}", f"9000000{i:03d}", lng, lat))

    buyer_ids = []
    for i in range(3):
        bid = str(uuid.uuid4())
        buyer_ids.append(bid)
        cur.execute("""
            INSERT INTO users (id, name, phone, role, location)
            VALUES (%s, %s, %s, 'buyer', ST_MakePoint(%s, %s)::geography)
        """, (bid, f"Buyer {i}", f"8000000{i:03d}", 72.86, 22.69))

    for fid, lat, lng in farmer_ids:
        crop = random.choice(CROPS)
        qty = random.randint(50, 300)
        cur.execute("""
            INSERT INTO listings (farmer_id, crop_type, quantity_kg,
                price_expectation, location)
            VALUES (%s, %s, %s, %s, ST_MakePoint(%s, %s)::geography)
        """, (fid, crop, qty, qty * random.uniform(15, 25), lng, lat))

    today = datetime.date.today()
    for crop in CROPS:
        for d in range(60):
            cur.execute("""
                INSERT INTO price_history (crop_type, region, date, avg_price)
                VALUES (%s, %s, %s, %s)
            """, (crop, "Nadiad", today - datetime.timedelta(days=d),
                  random.uniform(15, 25)))

    conn.commit()
    print(f"Seeded {len(farmer_ids)} farmers, {len(buyer_ids)} buyers.")

if __name__ == "__main__":
    seed()