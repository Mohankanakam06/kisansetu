from backend.db import get_conn
conn = get_conn()
cur = conn.cursor()
cur.execute("""
    SELECT conname, pg_get_constraintdef(oid) as definition
    FROM pg_constraint
    WHERE conname = 'orders_status_check';
""")
rows = cur.fetchall()
for r in rows:
    print(f"{r['conname']}: {r['definition']}")
conn.close()
