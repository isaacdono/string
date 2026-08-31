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
    """Busca informações públicas sobre o criador usando DuckDuckGo Lite (POST)."""
    clean_handle = handle.replace("@", "").strip()
    search_query = f"{clean_handle} instagram niche content"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Content-Type": "application/x-www-form-urlencoded",
    }
    
    try:
        with httpx.Client(timeout=10.0, follow_redirects=True) as client:
            logger.info(f"Iniciando requisição ao DuckDuckGo Lite para o handle {handle} com query: {search_query}")
            # Use DuckDuckGo Lite POST to prevent bot detection / anomaly challenge
            response = client.post(
                "https://lite.duckduckgo.com/lite/",
                data={"q": search_query},
                headers=headers,
            )
            
            html_content = response.text
            snippets = re.findall(r"<td class=['\"]result-snippet['\"][^>]*>(.*?)</td>", html_content, re.DOTALL | re.IGNORECASE)
            
            # Fallback regex if HTML structure varies
            if not snippets:
                snippets = re.findall(r'<a class="result__snippet"[^>]*>(.*?)</a>', html_content, re.DOTALL)
            
            if not snippets:
                logger.warning(f"Nenhum snippet encontrado nos resultados do DuckDuckGo para {handle}.")
                return f"Criador de conteúdo do nicho de Instagram com handle {handle}."
            
            cleaned_snippets = []
            for snippet in snippets[:4]:
                clean_text = re.sub(r'<[^>]+>', '', snippet)
                clean_text = html.unescape(clean_text).strip()
                if clean_text:
                    cleaned_snippets.append(clean_text)
            
            logger.info(f"DuckDuckGo retornou {len(cleaned_snippets)} snippets reais para {handle}.")
            if not cleaned_snippets:
                return f"Criador de conteúdo do nicho de Instagram com handle {handle}."
            
            return " | ".join(cleaned_snippets)
    except Exception as e:
        logger.warning(f"Erro na busca DuckDuckGo: {e}")
        return f"Criador de conteúdo do nicho de Instagram com handle {handle}."


class OpenRouterLLMService(ILLMService):
    def __init__(self):
        self.api_key = os.getenv("OPENROUTER_API_KEY")

    async def generate_analysis(
        self, handle: str, description: Optional[str]
    ) -> Dict[str, Any]:
        """Queries OpenRouter LLM for structured campaign details."""
        logger.info(f"Análise de campanha solicitada para o handle: {handle}")
        if not self.api_key or self.api_key.strip() in ("", "chave_do_nemotron", "none"):
            raise ValueError("OPENROUTER_API_KEY não configurada no ambiente.")

        # Call search_creator_info helper to fetch public context
        search_info = search_creator_info(handle)
        logger.info(f"Resultado final do contexto da busca DuckDuckGo: {search_info}")

        prompt_content = (
            f"Você é o especialista de produto e copywriting da ByteMedia, uma plataforma brasileira B2B para criadores de conteúdo.\n"
            f"Sua tarefa é criar a estrutura de um infoproduto ou produto digital que o PRÓPRIO CRIADOR '{handle}' irá VENDER para a SUA audiência.\n\n"
            f"CONTEXTO PÚBLICO DO CRIADOR (obtido via busca na web): '{search_info}'\n"
            f"IDEIA DO PRODUTO fornecida pelo criador: '{description or 'Produto digital baseado no nicho e expertise do criador'}'\n\n"
            f"REGRAS CRÍTICAS — LEIA COM ATENÇÃO:\n"
            f"1. O produto é algo que o CRIADOR CRIA E VENDE com base na sua própria expertise e nicho. NÃO é acesso a outra pessoa famosa.\n"
            f"2. Se o handle for de uma pessoa famosa (ex: @arianagrande, @neymar), assuma que é UM FÃ ou CRIADOR DE CONTEÚDO inspirado nesse nicho, não a celebridade em si.\n"
            f"3. O produto deve ser um infoproduto concreto: e-book, curso, mentoria, planilha, template, comunidade, newsletter paga, etc.\n"
            f"4. O título do produto deve ser ORIGINAL e ESPECÍFICO ao nicho, não genérico.\n"
            f"5. O preço deve ser estratégico entre R$ 27 e R$ 997 — nunca use R$ 97,00 como padrão.\n"
            f"6. Os hooks e benefícios devem falar diretamente com a dor/desejo da audiência do criador.\n"
            f"7. O blueprint_content deve conter um plano de lançamento REAL e DETALHADO de 7 dias, com ações concretas de stories, reels e DM.\n\n"
            "Retorne OBRIGATORIAMENTE apenas um JSON válido no seguinte formato exato (sem texto antes ou depois):\n"
            "{\n"
            '  "product_type": "digital",\n'
            '  "price": 147.00,\n'
            '  "theme_config": {\n'
            '    "primary": "#6366F1",\n'
            '    "background": "#0F172A"\n'
            "  },\n"
            '  "copy_data": {\n'
            '    "title": "Nome Específico e Persuasivo do Produto",\n'
            '    "format": "E-book em PDF",\n'
            '    "subtitle": "Subtítulo explicando a transformação concreta que o comprador terá",\n'
            '    "hooks": ["Gancho específico 1", "Gancho específico 2", "Gancho específico 3"],\n'
            '    "benefits": ["Benefício concreto 1", "Benefício concreto 2", "Benefício concreto 3", "Benefício concreto 4"],\n'
            '    "social_proof_quotes": [\n'
            '      {"user": "nome_usuario1", "comment": "Depoimento realista de 1 a 2 frases sobre o produto"},\n'
            '      {"user": "nome_usuario2", "comment": "Depoimento realista de 1 a 2 frases sobre o produto"},\n'
            '      {"user": "nome_usuario3", "comment": "Depoimento realista de 1 a 2 frases sobre o produto"}\n'
            "    ],\n"
            '    "alternative_products": [\n'
            '      {"title": "Produto alternativo 1 concreto", "description": "Descrição objetiva do que é e para quem serve", "product_type": "digital", "price": 47.00},\n'
            '      {"title": "Produto alternativo 2 concreto", "description": "Descrição objetiva do que é e para quem serve", "product_type": "digital", "price": 197.00},\n'
            '      {"title": "Produto alternativo 3 concreto", "description": "Descrição objetiva do que é e para quem serve", "product_type": "digital", "price": 297.00}\n'
            "    ]\n"
            "  },\n"
            '  "scarcity_limit": 50,\n'
            '  "blueprint_content": "Plano de lançamento de 7 dias com ações concretas de stories, reels, DM e engajamento. Dia 1: ... Dia 2: ... Dia 3: ... Dia 4: ... Dia 5: ... Dia 6: ... Dia 7: Abertura do carrinho. Projeções realistas de receita."\n'
            "}"
        )


        models_to_try = [
            "openrouter/free",
            "google/gemma-2-9b-it:free",
            "meta-llama/llama-3-8b-instruct:free",
        ]

        for model_name in models_to_try:
            try:
                logger.info(f"Iniciando chamada ao modelo {model_name} no OpenRouter...")
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
                            "response_format": {
                                "type": "json_object"
                            },
                        },
                    )

                    if response.status_code == 200:
                        try:
                            resp_json = response.json()
                        except (json.JSONDecodeError, ValueError) as e:
                            logger.error(
                                f"Falha ao decodificar JSON do OpenRouter. Status: {response.status_code}. Resposta crua: {response.text}"
                            )
                            raise e

                        choice_message = resp_json["choices"][0]["message"]
                        content = choice_message.get("content")
                        if content is None:
                            logger.error(f"OpenRouter retornou conteúdo nulo (None) na resposta. JSON Completo: {resp_json}")
                            raise ValueError("OpenRouter retornou conteúdo de mensagem nulo.")
                        raw_text = content.strip()

                        # Extract JSON from markdown code fences if wrapped
                        json_match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", raw_text)
                        json_str = json_match.group(1) if json_match else raw_text

                        try:
                            parsed_data = json.loads(json_str)
                        except json.JSONDecodeError as e:
                            logger.error(
                                f"Falha ao decodificar JSON extraído do modelo {model_name}. Texto bruto do modelo: {raw_text}"
                            )
                            raise e

                        # Validate required fields
                        if "copy_data" in parsed_data and "theme_config" in parsed_data:
                            return parsed_data

            except Exception as e:
                logger.warning(f"Error querying model {model_name}: {e}")

        logger.error("All LLM requests failed. Fallback simulation disabled.")
        raise RuntimeError("Todos os provedores de LLM falharam e nenhum fallback de simulação está disponível.")


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
