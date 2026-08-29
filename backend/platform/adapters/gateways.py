import logging
import os
from typing import Optional
import httpx
from domain.interfaces import IAIServiceGateway

logger = logging.getLogger("platform.adapters.gateways")


class HttpAIServiceGateway(IAIServiceGateway):
    def __init__(self, ai_url: Optional[str] = None):
        self.ai_url = ai_url or os.getenv("BACKEND_AI_URL", "http://backend-ai:8001")

    async def trigger_analysis(
        self, campaign_id: str, handle: str, description: Optional[str]
    ) -> None:
        """Sends POST request to backend-ai analysis route."""
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{self.ai_url.rstrip('/')}/api/ai/analyze",
                    json={
                        "campaign_id": campaign_id,
                        "handle": handle,
                        "description": description,
                    },
                )
                if response.status_code != 200:
                    logger.warning(
                        f"AI service returned non-200 status {response.status_code}: {response.text}"
                    )
        except Exception as e:
            logger.warning(f"Could not notify AI service at {self.ai_url}: {e}")
            raise e
