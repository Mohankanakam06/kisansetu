import os
import json
import time
import logging
from typing import Optional, Any, List, Dict
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("redis_client")

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

# In-memory fallback dictionary with TTL: { key: (value, expire_timestamp) }
_MEMORY_STORE: Dict[str, tuple] = {}

_redis_instance = None
_redis_available = False

try:
    import redis
    _client = redis.from_url(
        REDIS_URL,
        decode_responses=True,
        socket_connect_timeout=1.5,
        socket_timeout=1.5
    )
    _client.ping()
    _redis_instance = _client
    _redis_available = True
    logger.info("Connected to Redis successfully at %s", REDIS_URL)
except Exception as e:
    _redis_instance = None
    _redis_available = False
    logger.warning("Redis not available (%s). Using in-memory fallback cache.", str(e))


def is_redis_available() -> bool:
    """Returns True if connected to a live Redis server."""
    global _redis_available, _redis_instance
    if not _redis_instance:
        return False
    try:
        _redis_instance.ping()
        _redis_available = True
        return True
    except Exception:
        _redis_available = False
        return False


# ==================== OTP Helpers ====================

def set_otp(phone: str, otp: str, ttl_seconds: int = 300) -> None:
    """Store an OTP for a given phone number with expiration (default: 5 mins)."""
    key = f"auth:otp:{phone}"
    if is_redis_available():
        try:
            _redis_instance.setex(key, ttl_seconds, otp)
            return
        except Exception as e:
            logger.warning("Redis set_otp failed, falling back to memory: %s", e)

    # In-memory fallback
    _MEMORY_STORE[key] = (otp, time.time() + ttl_seconds)


def get_otp(phone: str) -> Optional[str]:
    """Retrieve an OTP for a given phone number if not expired."""
    key = f"auth:otp:{phone}"
    if is_redis_available():
        try:
            val = _redis_instance.get(key)
            if val is not None:
                return str(val)
        except Exception as e:
            logger.warning("Redis get_otp failed, checking memory fallback: %s", e)

    # In-memory fallback
    if key in _MEMORY_STORE:
        val, expires_at = _MEMORY_STORE[key]
        if time.time() <= expires_at:
            return str(val)
        else:
            del _MEMORY_STORE[key]
    return None


def delete_otp(phone: str) -> None:
    """Delete the OTP after successful verification."""
    key = f"auth:otp:{phone}"
    if is_redis_available():
        try:
            _redis_instance.delete(key)
        except Exception:
            pass
    if key in _MEMORY_STORE:
        _MEMORY_STORE.pop(key, None)


# ==================== Orchestrator Chat Session Helpers ====================

def get_chat_history(user_id: str) -> List[Dict[str, Any]]:
    """Retrieve recent multi-turn chat history for a user."""
    key = f"chat:session:{user_id}"
    if is_redis_available():
        try:
            raw = _redis_instance.get(key)
            if raw:
                return json.loads(raw)
        except Exception as e:
            logger.warning("Redis get_chat_history failed: %s", e)

    # In-memory fallback
    if key in _MEMORY_STORE:
        val, expires_at = _MEMORY_STORE[key]
        if time.time() <= expires_at:
            return val
        else:
            del _MEMORY_STORE[key]
    return []


def save_chat_history(user_id: str, history: List[Dict[str, Any]], ttl_seconds: int = 3600) -> None:
    """Save chat history for a user with default 1-hour expiration."""
    key = f"chat:session:{user_id}"
    # Keep last 10 turns to stay within prompt limits
    truncated_history = history[-10:] if len(history) > 10 else history

    if is_redis_available():
        try:
            _redis_instance.setex(key, ttl_seconds, json.dumps(truncated_history))
            return
        except Exception as e:
            logger.warning("Redis save_chat_history failed: %s", e)

    # In-memory fallback
    _MEMORY_STORE[key] = (truncated_history, time.time() + ttl_seconds)


# ==================== General Query / Route Cache Helpers ====================

def get_cache(key: str) -> Optional[Any]:
    """Retrieve arbitrary cached JSON data."""
    namespaced_key = f"cache:{key}"
    if is_redis_available():
        try:
            raw = _redis_instance.get(namespaced_key)
            if raw:
                return json.loads(raw)
        except Exception:
            pass

    if namespaced_key in _MEMORY_STORE:
        val, expires_at = _MEMORY_STORE[namespaced_key]
        if time.time() <= expires_at:
            return val
        else:
            del _MEMORY_STORE[namespaced_key]
    return None


def set_cache(key: str, value: Any, ttl_seconds: int = 300) -> None:
    """Save arbitrary JSON-serializable data to cache."""
    namespaced_key = f"cache:{key}"
    if is_redis_available():
        try:
            _redis_instance.setex(namespaced_key, ttl_seconds, json.dumps(value))
            return
        except Exception:
            pass

    _MEMORY_STORE[namespaced_key] = (value, time.time() + ttl_seconds)


def delete_cache(key: str) -> None:
    """Delete a cached key."""
    namespaced_key = f"cache:{key}"
    if is_redis_available():
        try:
            _redis_instance.delete(namespaced_key)
        except Exception:
            pass
    _MEMORY_STORE.pop(namespaced_key, None)
