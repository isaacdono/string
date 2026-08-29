import json
import logging
import os
import re
from typing import Any, Dict, List, Optional
import httpx

from domain.interfaces import ILLMService, IPdfGenerator
from pdf_generator import generate_blueprint_pdf

logger = logging.getLogger("ai.adapters.gateways")


class OpenRouterLLMService(ILLMService):
    def __init__(self):
        self.api_key = os.getenv("OPENROUTER_API_KEY")

    def _get_fallback_analysis(
        self, handle: str, description: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generates structured fallback drop content tailored to creator handle and description."""
        topic = (
            description.strip()
            if description and description.strip()
            else f"Conteúdo Exclusivo de {handle}"
        )

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

    async def generate_analysis(
        self, handle: str, description: Optional[str]
    ) -> Dict[str, Any]:
        """Queries OpenRouter LLM for structured campaign details with fallback."""
        if not self.api_key or self.api_key.strip() in ("", "chave_do_nemotron", "none"):
            logger.info("OPENROUTER_API_KEY not configured. Using high-fidelity fallback.")
            return self._get_fallback_analysis(handle, description)

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
                            "Authorization": f"Bearer {self.api_key}",
                            "Content-Type": "application/json",
                            "HTTP-Referer": "https://bytemedia.com",
                            "X-Title": "ByteMedia MVP",
                        },
                        json={
                            "model": model_name,
                            "messages": [
                                {
                                    "role": "system",
                                    "content": "Você é um gerador de produtos digitais de alta conversão. Responda estruturado conforme o JSON Schema.",
                                },
                                {"role": "user", "content": prompt_content},
                            ],
                            "temperature": 0.5,
                            "reasoning": {"enabled": True},
                            "response_format": {
                                "type": "json_schema",
                                "json_schema": {
                                    "name": "CampaignAnalysis",
                                    "strict": True,
                                    "schema": {
                                        "type": "object",
                                        "properties": {
                                            "product_type": {
                                                "type": "string",
                                                "enum": ["physical", "digital"],
                                            },
                                            "price": {"type": "number"},
                                            "theme_config": {
                                                "type": "object",
                                                "properties": {
                                                    "primary": {"type": "string"},
                                                    "background": {"type": "string"},
                                                    "foto_url": {"type": "string"},
                                                },
                                                "required": ["primary", "background", "foto_url"],
                                                "additionalProperties": False,
                                            },
                                            "copy_data": {
                                                "type": "object",
                                                "properties": {
                                                    "title": {"type": "string"},
                                                    "subtitle": {"type": "string"},
                                                    "hooks": {
                                                        "type": "array",
                                                        "items": {"type": "string"},
                                                    },
                                                    "benefits": {
                                                        "type": "array",
                                                        "items": {"type": "string"},
                                                    },
                                                },
                                                "required": [
                                                    "title",
                                                    "subtitle",
                                                    "hooks",
                                                    "benefits",
                                                ],
                                                "additionalProperties": False,
                                            },
                                            "scarcity_limit": {"type": "integer"},
                                            "blueprint_content": {"type": "string"},
                                        },
                                        "required": [
                                            "product_type",
                                            "price",
                                            "theme_config",
                                            "copy_data",
                                            "scarcity_limit",
                                            "blueprint_content",
                                        ],
                                        "additionalProperties": False,
                                    },
                                },
                            },
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

        logger.warning("All LLM requests failed. Falling back to local synthesizer.")
        return self._get_fallback_analysis(handle, description)


class ReportLabPdfGenerator(IPdfGenerator):
    def generate_pdf(
        self,
        campaign_id: str,
        handle: str,
        title: str,
        subtitle: str,
        product_type: str,
        price: float,
        scarcity_limit: int,
        hooks: List[str],
        benefits: List[str],
        blueprint_content: str,
        output_dir: str,
    ) -> str:
        """Invokes ReportLab PDF compiler function."""
        return generate_blueprint_pdf(
            campaign_id=campaign_id,
            handle=handle,
            title=title,
            subtitle=subtitle,
            product_type=product_type,
            price=price,
            scarcity_limit=scarcity_limit,
            hooks=hooks,
            benefits=benefits,
            blueprint_content=blueprint_content,
            output_dir=output_dir,
        )
