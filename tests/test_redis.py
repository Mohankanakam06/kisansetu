import time
from backend.redis_client import (
    set_otp, get_otp, delete_otp,
    get_chat_history, save_chat_history,
    set_cache, get_cache, delete_cache,
    is_redis_available
)

def test_redis_client_fallback_operations():
    # 1. Test OTP functionality
    phone = "9988776655"
    otp = "654321"
    set_otp(phone, otp, ttl_seconds=2)
    assert get_otp(phone) == otp
    delete_otp(phone)
    assert get_otp(phone) is None

    # 2. Test Multi-Turn Chat History
    user_id = "test-user-uuid-1"
    history = [
        {"role": "user", "parts": ["Namaste, tamatar bechna hai"]},
        {"role": "model", "parts": ["Namaste! Kitna quantity hai?"]}
    ]
    save_chat_history(user_id, history, ttl_seconds=10)
    retrieved = get_chat_history(user_id)
    assert len(retrieved) == 2
    assert retrieved[0]["parts"][0] == "Namaste, tamatar bechna hai"

    # 3. Test Generic Cache with TTL
    cache_key = "test:pricing:tomato"
    cache_val = {"avg_price": 26.5, "unit": "kg"}
    set_cache(cache_key, cache_val, ttl_seconds=30)
    cached_data = get_cache(cache_key)
    assert cached_data == cache_val
    delete_cache(cache_key)
    assert get_cache(cache_key) is None
