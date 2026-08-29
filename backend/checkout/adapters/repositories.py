import uuid
from typing import Any, Optional
from sqlalchemy.orm import Session
from domain.interfaces import ICampaignRepository, IOrderRepository
from infrastructure.models import Campaign, Order


class SQLAlchemyCampaignRepository(ICampaignRepository):
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, campaign_id: str) -> Optional[Campaign]:
        """Retrieves Campaign by UUID from Session."""
        try:
            camp_uuid = uuid.UUID(campaign_id) if isinstance(campaign_id, str) else campaign_id
        except (ValueError, TypeError):
            return None
        return self.db.query(Campaign).filter(Campaign.id == camp_uuid).first()


class SQLAlchemyOrderRepository(IOrderRepository):
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, order_id: str) -> Optional[Order]:
        """Retrieves Order by UUID from Session."""
        try:
            ord_uuid = uuid.UUID(order_id) if isinstance(order_id, str) else order_id
        except (ValueError, TypeError):
            return None
        return self.db.query(Order).filter(Order.id == ord_uuid).first()

    def get_by_asaas_payment_id(self, payment_id: str) -> Optional[Order]:
        """Retrieves Order by Asaas payment ID from Session."""
        return self.db.query(Order).filter(Order.asaas_payment_id == payment_id).first()

    def save(self, order: Order) -> Order:
        """Persists and commits Order model via Session."""
        self.db.add(order)
        self.db.commit()
        self.db.refresh(order)
        return order
