import os
from contextlib import contextmanager
from dotenv import load_dotenv
import logging

logger = logging.getLogger("db_pool")

# Load environment variables from .env file
load_dotenv()

# Global connection pool instance
_pool = None

def get_pool():
    global _pool
    if _pool is not None:
        return _pool
    from psycopg2 import pool
    from psycopg2.extras import RealDictCursor
    db_url = os.environ.get("DATABASE_URL")
    if not db_url:
        raise ValueError("DATABASE_URL environment variable is not set")
    _pool = pool.ThreadedConnectionPool(
        minconn=1,
        maxconn=20,
        dsn=db_url,
        cursor_factory=RealDictCursor
    )
    return _pool

# Mock DB implementation for development fallback
class MockCursor:
    def __init__(self):
        self.description = []
        self._last_query = ""
    def execute(self, query, params=None):
        self._last_query = str(query)
    def fetchall(self):
        return []
    def fetchone(self):
        # DEMO MODE: Return a coherent dummy row matching the queried table so
        # downstream code never hits a KeyError on a missing column.
        upper = self._last_query.upper()
        if "RETURNING" in upper or " FROM USERS" in upper or "FROM USERS " in upper:
            return {
                "id": "mock-id-001",
                "name": "Mock Farmer User",
                "phone": "9876543210",
                "role": "farmer",
                "language_pref": "hi",
                "location": "India",
                "created_at": "2026-03-08T00:00:00"
            }
        if "RETURNING" in upper:
            return {
                "id": "mock-id-001",
                "buyer_id": "buyer-1",
                "lot_id": "lot-1",
                "quantity_kg": 100,
                "status": "placed",
                "created_at": "2026-03-08T00:00:00"
            }
        return None
    def close(self):
        pass

class MockConnection:
    def cursor(self, *args, **kwargs):
        return MockCursor()
    def commit(self):
        pass
    def rollback(self):
        pass
    def close(self):
        pass

def get_conn():
    """Retrieve a connection from the pool, with MockDB fallback."""
    try:
        pool_inst = get_pool()
        return pool_inst.getconn()
    except Exception as e:
        logger.warning(f"CRITICAL WARNING: Database connection failed, using MOCK connection (Demo Mode Active). Real persistence is OFF. Error: {e}")
        return MockConnection()

def release_conn(conn):
    """Return a connection to the pool or close mock."""
    global _pool
    if isinstance(conn, MockConnection) or conn is None:
        return
    if _pool is not None:
        try:
            _pool.putconn(conn)
        except Exception as e:
            logger.warning(f"Failed to return connection to pool: {e}")

@contextmanager
def get_db():
    """Context manager for safe database connections and transactions."""
    conn = get_conn()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        release_conn(conn)
