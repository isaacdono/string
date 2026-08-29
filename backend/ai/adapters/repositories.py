import uuid
from typing import Any, Optional
from sqlalchemy.orm import Session
from domain.interfaces import ICampaignRepository
from infrastructure.models import Campaign


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

    def save(self, campaign: Campaign) -> Campaign:
        """Persists and commits Campaign model via Session."""
        self.db.add(campaign)
        self.db.commit()
        self.db.refresh(campaign)
        return campaign
