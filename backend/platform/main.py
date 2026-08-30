import logging
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import BackgroundTasks, Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

# Infrastructure
from infrastructure.database import get_db, init_db

# Adapters & UseCases
from adapters.repositories import SQLAlchemyCampaignRepository
from adapters.gateways import HttpAIServiceGateway
from usecases.create_campaign import CreateCampaignUseCase
from usecases.get_campaign import GetCampaignUseCase

logger = logging.getLogger("platform.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables on application startup via infrastructure
    init_db()
    yield


app = FastAPI(
    title="ByteMedia Platform API",
    version="1.0.0",
    description="Orchestrates campaign creation workflows for creators (B2B).",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# DTO Schemas
class CampaignCreateRequest(BaseModel):
    handle: str = Field(..., description="Creator handle, e.g., @criador", examples=["@exemplo"])
    description: Optional[str] = Field(
        None,
        description="Creator product idea, niche, target audience, or prompt description",
        examples=["Masterclass sobre criação de conteúdo com IA"],
    )


class CampaignCreateResponse(BaseModel):
    campaign_id: str = Field(..., description="Created campaign UUID")


class CampaignDetailResponse(BaseModel):
    id: str
    handle: str
    description: Optional[str] = None
    status: str
    product_type: Optional[str] = None
    price: Optional[float] = None
    theme_config: Optional[dict] = None
    copy_data: Optional[dict] = None
    scarcity_limit: Optional[int] = None
    blueprint_content: Optional[str] = None
    pdf_url: Optional[str] = None
    expires_at: Optional[str] = None
    created_at: Optional[str] = None


class CampaignRegenerateRequest(BaseModel):
    description: str = Field(..., description="Nova ideia de produto...")


# Dependency Injection Helpers
def get_campaign_repository(db: Session = Depends(get_db)) -> SQLAlchemyCampaignRepository:
    return SQLAlchemyCampaignRepository(db)


def get_ai_gateway() -> HttpAIServiceGateway:
    return HttpAIServiceGateway()


def get_create_campaign_use_case(
    repo: SQLAlchemyCampaignRepository = Depends(get_campaign_repository),
    gateway: HttpAIServiceGateway = Depends(get_ai_gateway),
) -> CreateCampaignUseCase:
    return CreateCampaignUseCase(repo, gateway)


def get_get_campaign_use_case(
    repo: SQLAlchemyCampaignRepository = Depends(get_campaign_repository),
) -> GetCampaignUseCase:
    return GetCampaignUseCase(repo)


# Routes
@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "ok", "service": "platform"}


@app.post(
    "/api/platform/campaign",
    response_model=CampaignCreateResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Campaigns"],
    summary="Create a new drop campaign",
)
async def create_campaign(
    payload: CampaignCreateRequest,
    background_tasks: BackgroundTasks,
    use_case: CreateCampaignUseCase = Depends(get_create_campaign_use_case),
):
    """
    Saves a pending campaign with optional product description to PostgreSQL
    and triggers the AI generation pipeline via clean architecture use case.
    """
    try:
        campaign_id = await use_case.execute(
            payload.handle,
            payload.description,
            background_tasks,
        )
        return CampaignCreateResponse(campaign_id=campaign_id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@app.get(
    "/api/platform/campaign/{campaign_id}",
    response_model=CampaignDetailResponse,
    status_code=status.HTTP_200_OK,
    tags=["Campaigns"],
    summary="Get campaign details and AI generation status",
)
async def get_campaign(
    campaign_id: str,
    use_case: GetCampaignUseCase = Depends(get_get_campaign_use_case),
):
    """
    Retrieves campaign progress and generated blueprint metadata for creators.
    """
    try:
        campaign = use_case.execute(campaign_id)
        return CampaignDetailResponse(
            id=str(campaign.id),
            handle=campaign.handle,
            description=campaign.description,
            status=campaign.status or "pending",
            product_type=campaign.product_type,
            price=float(campaign.price) if campaign.price is not None else None,
            theme_config=campaign.theme_config or {},
            copy_data=campaign.copy_data or {},
            scarcity_limit=campaign.scarcity_limit,
            blueprint_content=campaign.blueprint_content,
            pdf_url=campaign.pdf_url,
            expires_at=campaign.expires_at.isoformat() if campaign.expires_at else None,
            created_at=campaign.created_at.isoformat() if campaign.created_at else None,
        )
    except KeyError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaign not found",
        )


@app.post(
    "/api/platform/campaign/{campaign_id}/regenerate",
    status_code=status.HTTP_200_OK,
    tags=["Campaigns"],
    summary="Regenerate a campaign with a new description/product idea",
)
async def regenerate_campaign(
    campaign_id: str,
    payload: CampaignRegenerateRequest,
    background_tasks: BackgroundTasks,
    repo: SQLAlchemyCampaignRepository = Depends(get_campaign_repository),
    gateway: HttpAIServiceGateway = Depends(get_ai_gateway),
):
    """
    Updates the campaign's description/product idea, sets its status to 'generating',
    and triggers the AI generation background task.
    """
    campaign = repo.get_by_id(campaign_id)
    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaign not found",
        )
    
    cleaned_desc = payload.description.strip()
    if not cleaned_desc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Description cannot be empty",
        )
    
    campaign.description = cleaned_desc
    campaign.status = "generating"
    repo.save(campaign)
    
    # Trigger background task
    background_tasks.add_task(
        gateway.trigger_analysis,
        str(campaign.id),
        campaign.handle,
        cleaned_desc,
    )
    
    return {"status": "success", "campaign_id": str(campaign.id)}
