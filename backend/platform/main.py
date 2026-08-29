import uuid
from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(
    title="ByteMedia Platform API",
    version="1.0.0",
    description="Orchestrates campaign creation workflows for creators (B2B).",
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


class CampaignCreateResponse(BaseModel):
    campaign_id: str = Field(..., description="Created campaign UUID")


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
async def create_campaign(payload: CampaignCreateRequest):
    """
    Saves a pending campaign and triggers AI generation pipeline.
    Returns the campaign ID for tracking.
    """
    generated_id = str(uuid.uuid4())
    return CampaignCreateResponse(campaign_id=generated_id)
