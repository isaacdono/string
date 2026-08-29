import logging
import os
import uuid
from contextlib import asynccontextmanager
from typing import Optional

import httpx
from fastapi import BackgroundTasks, Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from database import get_db, init_db
from models import Campaign

logger = logging.getLogger("platform.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables on application startup
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


async def trigger_ai_analysis(
    ai_url: str,
    campaign_id: str,
    handle: str,
    description: Optional[str] = None,
):
    """Background task to trigger AI offer analysis in backend-ai."""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{ai_url.rstrip('/')}/api/ai/analyze",
                json={
                    "campaign_id": campaign_id,
                    "handle": handle,
                    "description": description,
                },
            )
            if response.status_code != 200:
                logger.warning(
                    f"AI service returned non-200 status {response.status_code}: {response.text}"
                )
    except Exception as e:
        logger.warning(f"Could not notify AI service at {ai_url}: {e}")


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
    db: Session = Depends(get_db),
):
    """
    Saves a pending campaign with optional product description to PostgreSQL
    and triggers the AI generation pipeline.
    """
    cleaned_handle = payload.handle.strip()
    if not cleaned_handle:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Creator handle cannot be empty.",
        )

    cleaned_desc = payload.description.strip() if payload.description else None

    campaign = Campaign(
        id=uuid.uuid4(),
        handle=cleaned_handle,
        description=cleaned_desc,
        status="pending",
        theme_config={},
        copy_data={},
    )
    db.add(campaign)
    db.commit()
    db.refresh(campaign)

    backend_ai_url = os.getenv("BACKEND_AI_URL", "http://backend-ai:8001")
    background_tasks.add_task(
        trigger_ai_analysis,
        backend_ai_url,
        str(campaign.id),
        cleaned_handle,
        cleaned_desc,
    )

    return CampaignCreateResponse(campaign_id=str(campaign.id))


@app.get(
    "/api/platform/campaign/{campaign_id}",
    response_model=CampaignDetailResponse,
    status_code=status.HTTP_200_OK,
    tags=["Campaigns"],
    summary="Get campaign details and AI generation status",
)
async def get_campaign(
    campaign_id: str,
    db: Session = Depends(get_db),
):
    """
    Retrieves campaign progress and generated blueprint metadata for creators.
    """
    try:
        camp_uuid = uuid.UUID(campaign_id) if isinstance(campaign_id, str) else campaign_id
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaign not found",
        )

    campaign = db.query(Campaign).filter(Campaign.id == camp_uuid).first()
    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaign not found",
        )

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
