from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional


class ICampaignRepository(ABC):
    @abstractmethod
    def get_by_id(self, campaign_id: str) -> Optional[Any]:
        """Retrieve campaign details by UUID."""
        pass

    @abstractmethod
    def save(self, campaign: Any) -> Any:
        """Persist campaign domain object."""
        pass


class ILLMService(ABC):
    @abstractmethod
    async def generate_analysis(
        self, handle: str, description: Optional[str]
    ) -> Dict[str, Any]:
        """Generate campaign copywriting structure and prices using LLM."""
        pass


class IPdfGenerator(ABC):
    @abstractmethod
    def generate_pdf(
        self,
        campaign_id: str,
        handle: str,
        title: str,
        subtitle: str,
        product_type: str,
        price: float,
        scarcity_limit: int,
        hooks: List[str],
        benefits: List[str],
        blueprint_content: str,
        output_dir: str,
    ) -> str:
        """Generate strategic campaign PDF blueprint."""
        pass
