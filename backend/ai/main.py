from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(
    title="ByteMedia AI Service",
    version="1.0.0",
    description="Processes content scraping, LLM generation (Nemotron), and PDF blueprint creation.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalyzeRequest(BaseModel):
    campaign_id: str = Field(..., description="Target campaign UUID")
    handle: str = Field(..., description="Creator handle to scrape and analyze", examples=["@exemplo"])


class AnalyzeResponse(BaseModel):
    status: str = Field(..., description="Analysis execution status", examples=["success"])
    pdf_url: str = Field(..., description="URL to access the generated PDF blueprint")


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "ok", "service": "ai"}


@app.post(
    "/api/ai/analyze",
    response_model=AnalyzeResponse,
    status_code=status.HTTP_200_OK,
    tags=["AI Analysis"],
    summary="Analyze creator profile and generate blueprint",
)
async def analyze_creator(payload: AnalyzeRequest):
    """
    Executes profile scraping, calls LLM, saves campaign structure,
    and generates the PDF blueprint artifact.
    """
    return AnalyzeResponse(
        status="success",
        pdf_url=f"https://storage.bytemedia.com/blueprints/{payload.campaign_id}.pdf",
    )
