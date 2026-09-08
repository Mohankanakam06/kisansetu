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
        # If querying a specific ID or returning row, return a minimal dummy object
        if "RETURNING" in self._last_query.upper():
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
        logger.warning(f"Database connection failed, using Mock connection: {e}")
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
