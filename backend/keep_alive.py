"""Keep-Alive Background Task for Free Tier Deployments (Render, Fly.io, Railway).

Render free tier web services spin down after 15 minutes of inactivity.
This background service periodically pings the public health endpoint every
10 minutes to maintain active container state when running on cloud providers.
"""
from typing import Optional
import os
import asyncio
import logging
import urllib.request
import urllib.error

logger = logging.getLogger("kisansetu.keep_alive")

PING_INTERVAL_SECONDS = int(os.getenv("KEEP_ALIVE_INTERVAL_SECONDS", "600"))  # Default: 10 mins


def get_target_url() -> Optional[str]:
    """Determine the public health endpoint to ping."""
    explicit_url = os.getenv("KEEP_ALIVE_URL") or os.getenv("APP_URL") or os.getenv("BACKEND_URL")
    if explicit_url:
        return explicit_url.rstrip("/")

    # Render automatically sets RENDER_EXTERNAL_URL (e.g. https://kisansetu-api.onrender.com)
    render_url = os.getenv("RENDER_EXTERNAL_URL")
    if render_url:
        return render_url.rstrip("/")

    render_host = os.getenv("RENDER_EXTERNAL_HOSTNAME")
    if render_host:
        return f"https://{render_host.rstrip('/')}"

    return None


async def ping_health_endpoint(target_url: str):
    """Perform a lightweight HTTP GET to /api/health."""
    endpoint = f"{target_url}/api/health"
    try:
        def _fetch():
            req = urllib.request.Request(
                endpoint,
                headers={"User-Agent": "KisanSetu-KeepAlive/1.0"}
            )
            with urllib.request.urlopen(req, timeout=15) as response:
                return response.status

        status = await asyncio.to_thread(_fetch)
        logger.info(f"[Keep-Alive] Pinged {endpoint} -> Status {status}")
    except urllib.error.HTTPError as e:
        logger.warning(f"[Keep-Alive] HTTP error pinging {endpoint}: {e.code}")
    except Exception as e:
        logger.warning(f"[Keep-Alive] Could not ping {endpoint}: {e}")


async def keep_alive_worker():
    """Continuous async loop pinging the server every PING_INTERVAL_SECONDS."""
    target_url = get_target_url()
    if not target_url:
        logger.debug("[Keep-Alive] No public URL detected (RENDER_EXTERNAL_URL / APP_URL not set). Skipping self-ping.")
        return

    logger.info(f"[Keep-Alive] Starting keep-alive background worker for {target_url} (interval: {PING_INTERVAL_SECONDS}s)")

    # Initial delay so app finishes startup
    await asyncio.sleep(15)

    while True:
        await ping_health_endpoint(target_url)
        await asyncio.sleep(PING_INTERVAL_SECONDS)
