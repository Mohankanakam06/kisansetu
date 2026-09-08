import os
from contextlib import contextmanager
from dotenv import load_dotenv
import psycopg2
from psycopg2 import pool
from psycopg2.extras import RealDictCursor
import logging

logger = logging.getLogger("db_pool")

# Load environment variables from .env file
load_dotenv()

_pool = None

def get_pool():
    global _pool
    if _pool is None:
        db_url = os.environ.get("DATABASE_URL")
        if not db_url:
            raise ValueError("DATABASE_URL environment variable is not set. Please check your .env file.")
        try:
            _pool = pool.ThreadedConnectionPool(
                minconn=1,
                maxconn=20,
                dsn=db_url,
                cursor_factory=RealDictCursor
            )
            logger.info("PostgreSQL ThreadedConnectionPool initialized (1-20 connections).")
        except Exception as e:
            logger.error("Failed to initialize database connection pool: %s", e)
            raise e
    return _pool

def get_conn():
    """Retrieve a connection from the pool."""
    p = get_pool()
    return p.getconn()

def release_conn(conn):
    """Return a connection back to the pool."""
    if _pool and conn:
        try:
            _pool.putconn(conn)
        except Exception as e:
            logger.warning("Failed to release connection back to pool: %s", e)

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

