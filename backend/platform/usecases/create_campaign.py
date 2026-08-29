from typing import Any, Optional
from domain.interfaces import IAIServiceGateway, ICampaignRepository
from infrastructure.models import Campaign


class CreateCampaignUseCase:
    def __init__(self, campaign_repo: ICampaignRepository, ai_gateway: IAIServiceGateway):
        self.campaign_repo = campaign_repo
        self.ai_gateway = ai_gateway

    async def execute(
        self,
        handle: str,
        description: Optional[str],
        background_tasks: Any,
    ) -> str:
        """
        Executes campaign creation business logic: validates handle,
        saves pending campaign in database, and triggers AI analysis pipeline.
        """
        cleaned_handle = handle.strip()
        if not cleaned_handle:
            raise ValueError("Creator handle cannot be empty.")

        cleaned_desc = description.strip() if description else None

        # Create campaign database model instance
        campaign = Campaign(
            handle=cleaned_handle,
            description=cleaned_desc,
            status="pending",
            theme_config={},
            copy_data={},
        )

        # Save to database
        saved_campaign = self.campaign_repo.save(campaign)

        # Add background task using the gateway interface
        background_tasks.add_task(
            self.ai_gateway.trigger_analysis,
            str(saved_campaign.id),
            cleaned_handle,
            cleaned_desc,
        )

        return str(saved_campaign.id)
