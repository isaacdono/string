import logging
from typing import Any, Optional
from domain.interfaces import ICampaignRepository, ILLMService, IPdfGenerator

logger = logging.getLogger("ai.usecases.analyze_campaign")


class AnalyzeCampaignUseCase:
    def __init__(
        self,
        campaign_repo: ICampaignRepository,
        llm_service: ILLMService,
        pdf_generator: IPdfGenerator,
    ):
        self.campaign_repo = campaign_repo
        self.llm_service = llm_service
        self.pdf_generator = pdf_generator

    async def execute(
        self,
        campaign_id: str,
        handle: str,
        description: Optional[str],
        blueprints_dir: str,
    ) -> Any:
        """Runs content generation workflow: changes status, queries LLM, generates PDF, and saves output."""
        campaign = self.campaign_repo.get_by_id(campaign_id)
        if not campaign:
            raise KeyError("Campaign not found")

        campaign.status = "generating"
        self.campaign_repo.save(campaign)

        try:
            analysis = await self.llm_service.generate_analysis(handle, description)
        except Exception as e:
            logger.error(f"Error executing LLM generation: {e}")
            raise e

        product_type = analysis.get("product_type", "digital")
        price = analysis.get("price", 97.00)
        theme_config = analysis.get("theme_config", {})
        copy_data = analysis.get("copy_data", {})
        scarcity_limit = analysis.get("scarcity_limit", 50)
        blueprint_content = analysis.get("blueprint_content", "")
        primary_color = theme_config.get("primary") or "#6366F1"

        try:
            self.pdf_generator.generate_pdf(
                campaign_id=str(campaign.id),
                handle=handle,
                title=copy_data.get("title", ""),
                subtitle=copy_data.get("subtitle", ""),
                product_type=product_type,
                price=price,
                scarcity_limit=scarcity_limit,
                hooks=copy_data.get("hooks", []),
                benefits=copy_data.get("benefits", []),
                blueprint_content=blueprint_content,
                output_dir=blueprints_dir,
                primary_color=primary_color,
            )
        except Exception as e:
            logger.error(f"Error synthesizing PDF: {e}")
            raise e

        pdf_relative_url = f"/static/blueprints/{campaign.id}.pdf"

        # Update properties and persist
        campaign.product_type = product_type
        campaign.price = price
        campaign.theme_config = theme_config
        campaign.copy_data = copy_data
        campaign.scarcity_limit = scarcity_limit
        campaign.blueprint_content = blueprint_content
        campaign.pdf_url = pdf_relative_url
        campaign.status = "active"

        self.campaign_repo.save(campaign)
        return campaign
