import logging
import os
from contextlib import asynccontextmanager
from typing import Any, Optional

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

# Infrastructure
from infrastructure.database import get_db, init_db

# Adapters
from adapters.repositories import SQLAlchemyCampaignRepository
from adapters.gateways import OpenRouterLLMService, ReportLabPdfGenerator

# UseCases
from usecases.analyze_campaign import AnalyzeCampaignUseCase

logger = logging.getLogger("ai.main")

STATIC_DIR = os.getenv("STATIC_DIR", "/app/static")
BLUEPRINTS_DIR = os.path.join(STATIC_DIR, "blueprints")
os.makedirs(BLUEPRINTS_DIR, exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables on application startup via infrastructure
    init_db()
    os.makedirs(BLUEPRINTS_DIR, exist_ok=True)
    yield


app = FastAPI(
    title="ByteMedia AI Service",
    version="1.0.0",
    description="Processes content scraping, LLM generation (Nemotron), and PDF blueprint creation.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve generated blueprint PDFs as static files
if os.path.exists(STATIC_DIR):
    app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


# DTO Schemas
class AnalyzeRequest(BaseModel):
    campaign_id: str = Field(..., description="Campaign UUID in database")
    handle: str = Field(..., description="Instagram handle, e.g. @criador")
    description: Optional[str] = Field(
        None, description="Optional drop product description/prompt"
    )


class AnalyzeResponse(BaseModel):
    status: str = Field(..., description="Job execution status (success, failed)")
    pdf_url: str = Field(..., description="Relative PDF download URL")
    campaign_id: str = Field(..., description="Associated campaign UUID")


# Dependency Injection Helpers
def get_campaign_repository(db: Session = Depends(get_db)) -> SQLAlchemyCampaignRepository:
    return SQLAlchemyCampaignRepository(db)


def get_llm_service() -> OpenRouterLLMService:
    return OpenRouterLLMService()


def get_pdf_generator() -> ReportLabPdfGenerator:
    return ReportLabPdfGenerator()


def get_analyze_campaign_use_case(
    repo: SQLAlchemyCampaignRepository = Depends(get_campaign_repository),
    llm: OpenRouterLLMService = Depends(get_llm_service),
    pdf: ReportLabPdfGenerator = Depends(get_pdf_generator),
) -> AnalyzeCampaignUseCase:
    return AnalyzeCampaignUseCase(repo, llm, pdf)


# Routes
@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "ok", "service": "ai"}


@app.post(
    "/api/ai/analyze",
    response_model=AnalyzeResponse,
    status_code=status.HTTP_200_OK,
    tags=["AI Analysis"],
    summary="Scrape handle, run LLM, and generate strategic PDF blueprint",
)
async def analyze_creator(
    payload: AnalyzeRequest,
    use_case: AnalyzeCampaignUseCase = Depends(get_analyze_campaign_use_case),
):
    """
    Kicks off the scraper and OpenRouter campaign generation pipeline via usecase,
    updating the campaign record in PostgreSQL and generating the PDF.
    """
    try:
        campaign = await use_case.execute(
            campaign_id=payload.campaign_id,
            handle=payload.handle,
            description=payload.description,
            blueprints_dir=BLUEPRINTS_DIR,
        )
        return AnalyzeResponse(
            status="success",
            pdf_url=campaign.pdf_url,
            campaign_id=str(campaign.id),
        )
    except KeyError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaign not found.",
        )
    except Exception as e:
        logger.error(f"Failed analysis workflow: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed analysis workflow: {str(e)}",
        )


@app.get(
    "/api/ai/blueprint/{campaign_id}",
    tags=["AI Analysis"],
    summary="Download or view generated PDF blueprint",
)
async def get_blueprint_file(campaign_id: str):
    """Serves the generated PDF blueprint for download."""
    pdf_path = os.path.join(BLUEPRINTS_DIR, f"{campaign_id}.pdf")
    if not os.path.exists(pdf_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blueprint PDF not found for this campaign.",
        )
    return FileResponse(
        pdf_path,
        media_type="application/pdf",
        filename=f"blueprint-{campaign_id}.pdf",
    )
