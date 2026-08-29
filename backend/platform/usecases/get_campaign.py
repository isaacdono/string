from typing import Any
from domain.interfaces import ICampaignRepository


class GetCampaignUseCase:
    def __init__(self, campaign_repo: ICampaignRepository):
        self.campaign_repo = campaign_repo

    def execute(self, campaign_id: str) -> Any:
        """
        Executes campaign retrieval business logic: queries repository
        and raises KeyError if campaign not found.
        """
        campaign = self.campaign_repo.get_by_id(campaign_id)
        if not campaign:
            raise KeyError("Campaign not found")
        return campaign
