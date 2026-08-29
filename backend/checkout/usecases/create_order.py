import uuid
from typing import Any
from domain.interfaces import ICampaignRepository, IOrderRepository
from infrastructure.models import Order


class CreateOrderUseCase:
    def __init__(self, campaign_repo: ICampaignRepository, order_repo: IOrderRepository):
        self.campaign_repo = campaign_repo
        self.order_repo = order_repo

    def execute(
        self,
        campaign_id: str,
        buyer_name: str,
        buyer_email: str,
        buyer_cpf: str,
    ) -> Any:
        """Validates campaign existence, builds order instance, and saves it in pending state."""
        campaign = self.campaign_repo.get_by_id(campaign_id)
        if not campaign:
            raise KeyError("Campaign not found")

        order = Order(
            id=uuid.uuid4(),
            campaign_id=campaign.id,
            buyer_name=buyer_name.strip(),
            buyer_email=buyer_email.strip().lower(),
            buyer_cpf=buyer_cpf.strip(),
            status="PENDING",
        )

        return self.order_repo.save(order)
