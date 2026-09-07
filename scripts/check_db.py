from backend.db import get_conn
conn = get_conn()
cur = conn.cursor()
for t in ['users', 'listings', 'lots', 'lot_listings', 'price_history']:
    cur.execute(f'SELECT count(*) FROM {t};')
    row = cur.fetchone()
    print(f'{t}: {row["count"]}')

cur.execute("SELECT role, count(*) FROM users GROUP BY role;")
for r in cur.fetchall():
    print(f'  role={r["role"]}: {r["count"]}')

cur.execute("SELECT crop_type, count(*) FROM listings GROUP BY crop_type;")
for r in cur.fetchall():
    print(f'  crop={r["crop_type"]}: {r["count"]}')

cur.execute("SELECT status, count(*) FROM listings GROUP BY status;")
for r in cur.fetchall():
    print(f'  status={r["status"]}: {r["count"]}')

conn.close()
