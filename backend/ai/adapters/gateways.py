import html
import json
import logging
import os
import re
from typing import Any, Dict, List, Optional
import httpx

from domain.interfaces import ILLMService, IPdfGenerator
from pdf_generator import generate_blueprint_pdf

logger = logging.getLogger("ai.adapters.gateways")


def search_creator_info(handle: str) -> str:
    """Busca informações públicas sobre o criador usando DuckDuckGo HTML."""
    query = f"{handle} instagram niche content"
    url = "https://html.duckduckgo.com/html/"
    try:
        clean_handle = handle.replace("@", "").strip()
        search_query = f"{clean_handle} instagram niche content"
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        with httpx.Client(timeout=10.0, follow_redirects=True) as client:
            response = client.get(url, params={"q": search_query}, headers=headers)
            if response.status_code != 200:
                logger.warning(f"DuckDuckGo search failed with status {response.status_code}")
                return f"Criador de conteúdo do nicho de Instagram com handle {handle}."
            
            html_content = response.text
            snippets = re.findall(r'<a class="result__snippet"[^>]*>(.*?)</a>', html_content, re.DOTALL)
            if not snippets:
                logger.warning("No snippets found in DuckDuckGo search results.")
                return f"Criador de conteúdo do nicho de Instagram com handle {handle}."
            
            cleaned_snippets = []
            for snippet in snippets[:4]:  # 3 a 4 primeiros resultados
                # Limpa tags HTML
                clean_text = re.sub(r'<[^>]+>', '', snippet)
                clean_text = html.unescape(clean_text).strip()
                if clean_text:
                    cleaned_snippets.append(clean_text)
            
            if not cleaned_snippets:
                return f"Criador de conteúdo do nicho de Instagram com handle {handle}."
            
            return " | ".join(cleaned_snippets)
    except Exception as e:
        logger.warning(f"Error during DuckDuckGo search: {e}")
        return f"Criador de conteúdo do nicho de Instagram com handle {handle}."


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
                "alternative_products": [
                    {
                        "title": f"Ebook VIP: Dominando {topic}",
                        "description": f"Guia prático em formato digital com estratégias de {topic} por {handle}.",
                        "product_type": "digital",
                        "price": 47.00,
                    },
                    {
                        "title": f"Comunidade {handle} Hub",
                        "description": f"Acesso à nossa comunidade fechada com discussões diárias sobre {topic}.",
                        "product_type": "digital",
                        "price": 197.00,
                    },
                    {
                        "title": f"Mentoria Express: {topic}",
                        "description": f"Sessão individual gravada de 45 minutos para acelerar seus resultados em {topic}.",
                        "product_type": "digital",
                        "price": 497.00,
                    }
                ],
            },
            "scarcity_limit": 50,
            "blueprint_content": (
                f"ESTRATÉGIA DE MARKETING E PLANO DE LANÇAMENTO — DROP {handle}\n\n"
                f"1. AQUECIMENTO E ANTECIPAÇÃO:\n"
                f"- Compartilhar os bastidores do desenvolvimento do produto e identificar as dores da audiência.\n"
                f"- Criar caixas de perguntas sobre '{topic}' para gerar conexão e interesse.\n"
                f"- Anunciar que um lote especial limitado de lançamento será liberado em breve.\n\n"
                f"2. CRONOGRAMA DE LANÇAMENTO:\n"
                f"- D-Day: Liberação oficial do link de checkout com condições especiais de abertura.\n"
                f"- Compartilhar provas sociais em tempo real e destacar a escassez das vagas.\n"
                f"- Realizar alertas de encerramento do lote para acelerar a tomada de decisão.\n\n"
                f"3. PROJEÇÃO DE RESULTADOS:\n"
                f"- Meta ideal de 50 vagas preenchidas a R$ 97,00, gerando um faturamento estimado de R$ 4.850,00."
            ),
        }

    async def generate_analysis(
        self, handle: str, description: Optional[str]
    ) -> Dict[str, Any]:
        """Queries OpenRouter LLM for structured campaign details with fallback."""
        if not self.api_key or self.api_key.strip() in ("", "chave_do_nemotron", "none"):
            logger.info("OPENROUTER_API_KEY not configured. Using high-fidelity fallback.")
            return self._get_fallback_analysis(handle, description)

        # Call search_creator_info helper to fetch public context
        search_info = search_creator_info(handle)

        prompt_content = (
            f"Você é o especialista de produto e copywriting da ByteMedia. "
            f"Gere a estrutura completa de um Drop irresistível para o criador '{handle}'.\n"
            f"Informações contextuais encontradas sobre o criador na web: '{search_info}'\n"
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
            '    "benefits": ["Benefício 1", "Benefício 2", "Benefício 3", "Benefício 4"],\n'
            '    "alternative_products": [\n'
            '      {\n'
            '        "title": "Título do Produto Alternativo 1",\n'
            '        "description": "Descrição detalhada do produto alternativo 1",\n'
            '        "product_type": "digital",\n'
            '        "price": 47.00\n'
            '      },\n'
            '      {\n'
            '        "title": "Título do Produto Alternativo 2",\n'
            '        "description": "Descrição detalhada do produto alternativo 2",\n'
            '        "product_type": "digital",\n'
            '        "price": 197.00\n'
            '      },\n'
            '      {\n'
            '        "title": "Título do Produto Alternativo 3",\n'
            '        "description": "Descrição detalhada do produto alternativo 3",\n'
            '        "product_type": "digital",\n'
            '        "price": 297.00\n'
            '      }\n'
            '    ]\n'
            "  },\n"
            '  "scarcity_limit": 50,\n'
            '  "blueprint_content": "Estratégia de marketing e plano de lançamento detalhados para o drop (focado em aquecimento, cronograma geral e projeções)..."\n'
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
                                                    "alternative_products": {
                                                        "type": "array",
                                                        "items": {
                                                            "type": "object",
                                                            "properties": {
                                                                "title": {"type": "string"},
                                                                "description": {"type": "string"},
                                                                "product_type": {
                                                                    "type": "string",
                                                                    "enum": ["physical", "digital"],
                                                                },
                                                                "price": {"type": "number"},
                                                            },
                                                            "required": [
                                                                "title",
                                                                "description",
                                                                "product_type",
                                                                "price",
                                                            ],
                                                            "additionalProperties": False,
                                                        },
                                                    },
                                                },
                                                "required": [
                                                    "title",
                                                    "subtitle",
                                                    "hooks",
                                                    "benefits",
                                                    "alternative_products",
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
        primary_color: str = "#6366F1",
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
            primary_color=primary_color,
            output_dir=output_dir,
        )
