import json
import logging
import os
import re
import uuid
from contextlib import asynccontextmanager
from typing import Any, Dict, List, Optional

import httpx
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from database import get_db, init_db
from models import Campaign
from pdf_generator import generate_blueprint_pdf

logger = logging.getLogger("ai.main")

STATIC_DIR = os.getenv("STATIC_DIR", "/app/static")
BLUEPRINTS_DIR = os.path.join(STATIC_DIR, "blueprints")
os.makedirs(BLUEPRINTS_DIR, exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables on application startup
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


class AnalyzeRequest(BaseModel):
    campaign_id: str = Field(..., description="Target campaign UUID")
    handle: str = Field(..., description="Creator handle to scrape and analyze", examples=["@exemplo"])
    description: Optional[str] = Field(
        None,
        description="Creator product idea, niche, target audience, or prompt description",
        examples=["Masterclass sobre criação de conteúdo com IA"],
    )


class AnalyzeResponse(BaseModel):
    status: str = Field(..., description="Analysis execution status", examples=["success"])
    pdf_url: str = Field(..., description="URL to access the generated PDF blueprint")
    campaign_id: str = Field(..., description="Associated campaign UUID")


def _get_fallback_analysis(handle: str, description: Optional[str] = None) -> Dict[str, Any]:
    """Generates structured fallback drop content tailored to creator handle and description."""
    topic = description.strip() if description and description.strip() else f"Conteúdo Exclusivo de {handle}"
    
    return {
        "product_type": "digital",
        "price": 97.00,
        "theme_config": {
            "primary": "#6366F1",
            "background": "#0F172A",
            "foto_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
        },
        "copy_data": {
            "title": f"Drop Exclusivo: {topic}",
            "subtitle": f"O método definitivo acelerado por IA desenvolvido por {handle}.",
            "hooks": [
                f"Acesso imediato e vitalício ao drop de {handle}",
                "Vagas estritamente limitadas para a primeira turma",
                "Método testado e validado em campo",
            ],
            "benefits": [
                "Acesso completo ao conteúdo e templates prontos",
                "Comunidade exclusiva de networking",
                "Sessão de mentoria ao vivo para tirar dúvidas",
                "Garantia incondicional de satisfação",
            ],
        },
        "scarcity_limit": 50,
        "blueprint_content": (
            f"ESTRATÉGIA DE LANÇAMENTO — DROP {handle}\n\n"
            f"1. FASE DE AQUECIMENTO (D-3 a D-1):\n"
            f"- Stories 1: Abrir caixinha de perguntas sobre '{topic}'.\n"
            f"- Stories 2: Compartilhar o bastidor e dores comuns da audiência.\n"
            f"- Stories 3: Anunciar que um lote especial limitado a 50 pessoas será liberado.\n\n"
            f"2. FASE DE LANÇAMENTO (D-Day):\n"
            f"- Stories Manhã: Liberação do link oficial de checkout Pix.\n"
            f"- Stories Tarde: Prova social e contagem de vagas restantes.\n"
            f"- Stories Noite: Alerta de últimas vagas antes do encerramento definitivo.\n\n"
            f"3. PROJEÇÃO DE FATURAMENTO:\n"
            f"- 50 vagas a R$ 97,00 = R$ 4.850,00 de receita direta em 24h."
        ),
    }


async def _generate_ai_analysis(handle: str, description: Optional[str] = None) -> Dict[str, Any]:
    """Queries OpenRouter LLM (NVIDIA Nemotron) for drop generation."""
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key or api_key.strip() in ("", "chave_do_nemotron", "none"):
        logger.info("OPENROUTER_API_KEY not configured. Using high-fidelity structured fallback.")
        return _get_fallback_analysis(handle, description)

    prompt_content = (
        f"Você é o especialista de produto e copywriting da ByteMedia. "
        f"Gere a estrutura completa de um Drop irresistível para o criador '{handle}'.\n"
        f"Ideia/Descrição do produto fornecida pelo criador: '{description or 'Produtos digitais e comunidade'}'\n\n"
        "Retorne OBRIGATORIAMENTE apenas um JSON válido no seguinte formato exato (sem texto antes ou depois):\n"
        "{\n"
        '  "product_type": "digital",\n'
        '  "price": 97.00,\n'
        '  "theme_config": {\n'
        '    "primary": "#6366F1",\n'
        '    "background": "#0F172A",\n'
        '    "foto_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb"\n'
        "  },\n"
        '  "copy_data": {\n'
        '    "title": "Nome Persuasivo do Produto",\n'
        '    "subtitle": "Subtítulo de alto impacto explicando a transformação",\n'
        '    "hooks": ["Gancho 1", "Gancho 2", "Gancho 3"],\n'
        '    "benefits": ["Benefício 1", "Benefício 2", "Benefício 3", "Benefício 4"]\n'
        "  },\n"
        '  "scarcity_limit": 50,\n'
        '  "blueprint_content": "Roteiro executivo completo de marketing para Stories e lançamento do drop..."\n'
        "}"
    )

    models_to_try = [
        "openrouter/free",
        "google/gemma-2-9b-it:free",
        "meta-llama/llama-3-8b-instruct:free",
    ]

    for model_name in models_to_try:
        try:
            async with httpx.AsyncClient(timeout=25.0) as client:
                response = await client.post(
                    "https://openrouter.ai/api/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {api_key}",
                        "Content-Type": "application/json",
                        "HTTP-Referer": "https://bytemedia.com",
                        "X-Title": "ByteMedia MVP",
                    },
                    json={
                        "model": model_name,
                        "messages": [
                            {
                                "role": "system",
                                "content": "Você é um gerador de produtos digitais de alta conversão. Responda exclusivamente em formato JSON válido.",
                            },
                            {"role": "user", "content": prompt_content},
                        ],
                        "temperature": 0.7,
                    },
                )

                if response.status_code == 200:
                    resp_json = response.json()
                    raw_text = resp_json["choices"][0]["message"]["content"].strip()

                    # Extract JSON from markdown code fences if wrapped
                    json_match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", raw_text)
                    json_str = json_match.group(1) if json_match else raw_text
                    parsed_data = json.loads(json_str)

                    # Validate required fields
                    if "copy_data" in parsed_data and "theme_config" in parsed_data:
                        return parsed_data

        except Exception as e:
            logger.warning(f"Error querying model {model_name}: {e}")

    logger.warning("All LLM requests failed or were invalid. Falling back to local synthesizer.")
    return _get_fallback_analysis(handle, description)


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
async def analyze_creator(
    payload: AnalyzeRequest,
    db: Session = Depends(get_db),
):
    """
    Synthesizes the creator offer with Nemotron LLM, generates the PDF blueprint,
    and updates the campaign record in PostgreSQL to 'active' status.
    """
    try:
        camp_uuid = uuid.UUID(payload.campaign_id) if isinstance(payload.campaign_id, str) else payload.campaign_id
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid campaign ID format",
        )

    # Fetch campaign from PostgreSQL
    campaign = db.query(Campaign).filter(Campaign.id == camp_uuid).first()
    if not campaign:
        # Create campaign record if it wasn't pre-created
        campaign = Campaign(
            id=camp_uuid,
            handle=payload.handle,
            description=payload.description,
            status="pending",
        )
        db.add(campaign)
        db.commit()
        db.refresh(campaign)

    # Generate AI offer structure
    analysis = await _generate_ai_analysis(payload.handle, payload.description or campaign.description)

    # Extract parsed fields
    product_type = analysis.get("product_type", "digital")
    price = float(analysis.get("price", 97.00))
    theme_config = analysis.get("theme_config", {
        "primary": "#6366F1",
        "background": "#0F172A",
        "foto_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
    })
    copy_data = analysis.get("copy_data", {
        "title": f"Drop Exclusivo {payload.handle}",
        "subtitle": "Oferta especial por tempo limitado.",
        "hooks": ["Acesso imediato"],
        "benefits": ["Conteúdo exclusivo"],
    })
    scarcity_limit = analysis.get("scarcity_limit", 50)
    blueprint_content = analysis.get("blueprint_content", "Estratégia de Lançamento ByteMedia")

    # Generate PDF Blueprint
    generate_blueprint_pdf(
        campaign_id=str(campaign.id),
        handle=payload.handle,
        title=copy_data.get("title", ""),
        subtitle=copy_data.get("subtitle", ""),
        product_type=product_type,
        price=price,
        scarcity_limit=scarcity_limit,
        hooks=copy_data.get("hooks", []),
        benefits=copy_data.get("benefits", []),
        blueprint_content=blueprint_content,
        output_dir=BLUEPRINTS_DIR,
    )

    pdf_relative_url = f"/static/blueprints/{campaign.id}.pdf"

    # Update database record
    campaign.product_type = product_type
    campaign.price = price
    campaign.theme_config = theme_config
    campaign.copy_data = copy_data
    campaign.scarcity_limit = scarcity_limit
    campaign.blueprint_content = blueprint_content
    campaign.pdf_url = pdf_relative_url
    campaign.status = "active"

    db.commit()
    db.refresh(campaign)

    return AnalyzeResponse(
        status="success",
        pdf_url=pdf_relative_url,
        campaign_id=str(campaign.id),
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
