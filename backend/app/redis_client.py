import redis.asyncio as redis
from app.config import settings

redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)

CACHE_TTL = 3600  # 1 hour for summaries


async def get_cached_summary(doc_hash: str) -> str | None:
    return await redis_client.get(f"summary:{doc_hash}")


async def set_cached_summary(doc_hash: str, summary: str) -> None:
    await redis_client.setex(f"summary:{doc_hash}", CACHE_TTL, summary)
