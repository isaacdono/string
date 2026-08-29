from abc import ABC, abstractmethod
from typing import Any, Optional


class ICampaignRepository(ABC):
    @abstractmethod
    def get_by_id(self, campaign_id: str) -> Optional[Any]:
        """Retrieve campaign details by UUID."""
        pass

    @abstractmethod
    def save(self, campaign: Any) -> Any:
        """Persist campaign domain object."""
        pass


class IAIServiceGateway(ABC):
    @abstractmethod
    async def trigger_analysis(
        self, campaign_id: str, handle: str, description: Optional[str]
    ) -> None:
        """Trigger background analysis of drop campaign in backend-ai."""
        pass
