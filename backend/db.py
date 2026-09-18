import os
import logging
from contextlib import contextmanager
from dotenv import load_dotenv
import psycopg2
from psycopg2 import pool
from psycopg2.extras import RealDictCursor

from backend import config

logger = logging.getLogger("kisansetu.db")

load_dotenv()

_pool = None

def get_pool():
    """Initialize or return the threaded PostgreSQL connection pool."""
    global _pool
    if _pool is not None and not _pool.closed:
        return _pool

    db_url = os.environ.get("DATABASE_URL")
    if not db_url:
        raise ValueError("DATABASE_URL environment variable is not set. Please configure a PostgreSQL instance.")

    # Normalize postgres:// to postgresql://
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)

    try:
        _pool = pool.ThreadedConnectionPool(
            minconn=1,
            maxconn=20,
            dsn=db_url,
            cursor_factory=RealDictCursor
        )
        logger.info("Successfully established PostgreSQL connection pool.")
    except Exception as e:
        logger.error("Failed to establish PostgreSQL connection pool: %s", e)
        raise
    return _pool

def get_conn():
    """Retrieve a real connection from the pool. Raises if unavailable."""
    pool_inst = get_pool()
    return pool_inst.getconn()

def release_conn(conn):
    """Return a connection to the pool."""
    global _pool
    if conn is None:
        return
    if _pool is not None and not _pool.closed:
        try:
            _pool.putconn(conn)
        except Exception as e:
            logger.warning("Failed to return connection to pool: %s", e)

@contextmanager
def get_db():
    """Context manager for safe PostgreSQL database connections and transactions."""
    conn = get_conn()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        release_conn(conn)

def exec_geo_fallback(conn, cur, geo_sql, geo_params, plain_sql, plain_params):
    """
    Run PostGIS geometry statement; if PostGIS extension is not installed,
    rollback the aborted transaction and execute plain geometry-free statement.
    """
    try:
        cur.execute(geo_sql, geo_params)
    except Exception as e:
        logger.info("PostGIS execution fallback triggered: %s", e)
        try:
            conn.rollback()
        except Exception:
            pass
        cur.execute(plain_sql, plain_params)
    return cur
