"""
Simple per-user Server-Sent Events (SSE) registry.

This keeps an in-memory mapping of user_id -> set of asyncio queues.
When server code emits a user progress update, we publish it to all
connected clients for that user.

For multi-process deployments, replace the in-memory fanout with
Redis Pub/Sub or another broker.
"""

from __future__ import annotations

import asyncio
import json
from typing import Any, Dict, Set


_subs: Dict[int, Set[asyncio.Queue[str]]] = {}
_lock = asyncio.Lock()


async def subscribe(user_id: int) -> asyncio.Queue[str]:
    """Create a queue subscription for a user_id and register it."""
    q: asyncio.Queue[str] = asyncio.Queue(maxsize=100)
    async with _lock:
        _subs.setdefault(user_id, set()).add(q)
    return q


async def unsubscribe(user_id: int, q: asyncio.Queue[str]) -> None:
    async with _lock:
        if user_id in _subs:
            _subs[user_id].discard(q)
            if not _subs[user_id]:
                _subs.pop(user_id, None)


async def emit_user_progress(user_id: int, payload: Dict[str, Any]) -> None:
    """Publish a user progress payload to all subscribers for that user."""
    data = json.dumps({"type": "progressUpdated", "payload": payload})
    async with _lock:
        queues = list(_subs.get(user_id, set()))
    for q in queues:
        try:
            await q.put(data)
        except asyncio.QueueFull:
            # Drop if the client is too slow
            pass

async def next_or_heartbeat(q: asyncio.Queue[str], timeout: float = 20.0) -> bytes:
    """Return next queue item or a heartbeat comment if timeout expires."""
    try:
        data = await asyncio.wait_for(q.get(), timeout=timeout)
        return ("event: progressUpdated\n" + f"data: {data}\n\n").encode("utf-8")
    except asyncio.TimeoutError:
        return b":hb\n\n"
