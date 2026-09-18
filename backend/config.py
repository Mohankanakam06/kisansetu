"""Runtime configuration flags for the Kisan Setu backend.

Two independent switches control behaviour that differs between the
hackathon demo deployment and a real production deployment:

* ``DEMO_MODE`` (default ``true``)
    When on, the API tolerates missing credentials/providers and returns
    deterministic demo data (mock DB fallback, fixed OTP, placeholder
    payment keys). When off, failures surface as real errors instead of
    being silently faked.

* ``REQUIRE_AUTH`` (default ``false``)
    When on, every endpoint wired with ``require_auth`` rejects requests
    without a valid JWT. When off, those endpoints fall back to a demo
    identity so the prototype keeps working without a token.

Set both to ``true``/``false`` explicitly in the production environment.
"""

import os


def _env_bool(name: str, default: bool) -> bool:
    raw = os.getenv(name)
    if raw is None:
        return default
    return raw.strip().lower() in ("1", "true", "yes", "on")


def is_demo_mode() -> bool:
    """True when missing infra/credentials should fall back to demo data."""
    return _env_bool("DEMO_MODE", True)


def require_auth_enforced() -> bool:
    """True when JWT authentication must be enforced on protected routes."""
    return _env_bool("REQUIRE_AUTH", False)
