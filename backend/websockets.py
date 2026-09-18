import asyncio
import json
import logging
from typing import Dict, List, Set, Any
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

logger = logging.getLogger("kisansetu.websockets")
router = APIRouter()

class ConnectionManager:
    def __init__(self):
        # Maps user_id -> set of active WebSockets
        self.active_users: Dict[str, Set[WebSocket]] = {}
        # List of anonymous or ticker-only WebSockets
        self.ticker_connections: Set[WebSocket] = set()

    async def connect(self, websocket: WebSocket, user_id: str = None):
        await websocket.accept()
        if user_id:
            if user_id not in self.active_users:
                self.active_users[user_id] = set()
            self.active_users[user_id].add(websocket)
            logger.info(f"User {user_id} connected. Active sockets: {len(self.active_users[user_id])}")
        else:
            self.ticker_connections.add(websocket)

    def disconnect(self, websocket: WebSocket, user_id: str = None):
        if user_id and user_id in self.active_users:
            if websocket in self.active_users[user_id]:
                self.active_users[user_id].remove(websocket)
            if not self.active_users[user_id]:
                del self.active_users[user_id]
            logger.info(f"User {user_id} disconnected.")
        else:
            if websocket in self.ticker_connections:
                self.ticker_connections.remove(websocket)

    async def send_personal_message(self, message: dict, user_id: str):
        if user_id in self.active_users:
            dead_sockets = set()
            for connection in self.active_users[user_id]:
                try:
                    await connection.send_text(json.dumps(message))
                except Exception:
                    dead_sockets.add(connection)
            for dead in dead_sockets:
                self.disconnect(dead, user_id)

    def emit_sync(self, message: dict, user_id: str = None):
        """Thread-safe and sync-friendly helper to emit websocket events."""
        try:
            loop = asyncio.get_event_loop()
            if loop.is_running():
                if user_id:
                    loop.create_task(self.send_personal_message(message, user_id))
                else:
                    loop.create_task(self.broadcast(message))
            else:
                if user_id:
                    loop.run_until_complete(self.send_personal_message(message, user_id))
                else:
                    loop.run_until_complete(self.broadcast(message))
        except Exception as e:
            logger.debug(f"Could not emit websocket event sync: {e}")

    async def broadcast(self, message: dict):
        text_msg = json.dumps(message)
        dead_sockets = set()

        # Broadcast to all logged-in users
        for user_id, connections in self.active_users.items():
            for connection in connections:
                try:
                    await connection.send_text(text_msg)
                except Exception:
                    dead_sockets.add((connection, user_id))

        # Broadcast to anonymous ticker subscribers
        for connection in self.ticker_connections:
            try:
                await connection.send_text(text_msg)
            except Exception:
                dead_sockets.add((connection, None))

        for dead_conn, uid in dead_sockets:
            self.disconnect(dead_conn, uid)

manager = ConnectionManager()


# APMC Ticker Background Task Scheduler
_ticker_task = None

async def broadcast_apmc_ticker():
    from backend.services.pricing_engine import get_dynamic_ticker_stream

    while True:
        try:
            updates = get_dynamic_ticker_stream()
            payload = {
                "type": "apmc_ticker",
                "data": [
                    {
                        "crop_type": item["crop_type"],
                        "mandi_name": item["mandi"],
                        "state": item["state"],
                        "variety": item["variety"],
                        "price_per_kg": item["price_per_kg"],
                        "min_price_kg": item["min_price_kg"],
                        "max_price_kg": item["max_price_kg"],
                        "price_change_pct": item["change_24h_pct"],
                        "predicted_price_7d": item["predicted_price_7d"],
                        "predicted_trend_7d": item["predicted_trend_7d"],
                        "confidence": item["confidence"],
                        "timestamp": asyncio.get_event_loop().time()
                    }
                    for item in updates
                ]
            }
            await manager.broadcast(payload)
        except asyncio.CancelledError:
            break
        except Exception as e:
            logger.error(f"Ticker loop error: {e}")

        await asyncio.sleep(5)  # Broadcast every 5 seconds


def start_ticker_task():
    global _ticker_task
    if _ticker_task is None:
        loop = asyncio.get_event_loop()
        _ticker_task = loop.create_task(broadcast_apmc_ticker())


@router.websocket("/ws/ticker")
async def websocket_ticker_endpoint(websocket: WebSocket):
    """Anonymous endpoint just for APMC Market Ticker."""
    await manager.connect(websocket)
    start_ticker_task()
    try:
        while True:
            # heartbeat ping/pong
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"Ticker WebSocket error: {e}")
        manager.disconnect(websocket)


@router.websocket("/ws/orders/{user_id}")
async def websocket_user_endpoint(websocket: WebSocket, user_id: str):
    """Personalized endpoint for farmers/buyers to get order and pool updates."""
    await manager.connect(websocket, user_id)
    start_ticker_task()
    try:
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
            else:
                # Acknowledge user commands if any
                pass
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)
    except Exception as e:
        logger.error(f"User {user_id} WebSocket error: {e}")
        manager.disconnect(websocket, user_id)


# Expose manager so other routes can import it and emit events.
# from backend.websockets import manager
# await manager.send_personal_message({"type": "order_update", ...}, user_id)
