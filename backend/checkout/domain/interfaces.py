from abc import ABC, abstractmethod
from typing import Any, Optional


class ICampaignRepository(ABC):
    @abstractmethod
    def get_by_id(self, campaign_id: str) -> Optional[Any]:
        """Retrieve campaign details by UUID."""
        pass


class IOrderRepository(ABC):
    @abstractmethod
    def get_by_id(self, order_id: str) -> Optional[Any]:
        """Retrieve order details by UUID."""
        pass

    @abstractmethod
    def get_by_asaas_payment_id(self, payment_id: str) -> Optional[Any]:
        """Retrieve order details by Asaas payment identifier."""
        pass

    @abstractmethod
    def save(self, order: Any) -> Any:
        """Persist order domain object."""
        pass
