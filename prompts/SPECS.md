# Especificações Técnicas (SPECS.md) - ByteMedia MVP

## 1. Visão Geral
Plataforma "Zero-Click" para criadores de conteúdo lançarem *Drops* (produtos físicos/digitais limitados). A IA analisa a demanda, cria o produto (Blueprint) e gera a página de vendas (com escassez e checkout PIX transparente).
- **Regra de Ouro do MVP:** Sem sistema de login (nem criador, nem admin). 
- **Arquitetura:** Totalmente desacoplada em microsserviços tanto no Frontend (Next.js) quanto no Backend (FastAPI).

## 2. Stack Tecnológico
- **Frontend Platform:** Next.js 14 (App Router), React, Tailwind CSS, TypeScript.
- **Frontend Checkout (Drop Engine):** Next.js 14 (App Router), React, Tailwind CSS, TypeScript.
- **Backend Platform:** Python 3.11+, FastAPI, Pydantic V2, SQLAlchemy/SQLModel (API para os Criadores).
- **Backend AI (Microsserviço):** Python 3.11+, FastAPI (Scraping, IA Nemotron, Geração de PDF).
- **Backend Checkout:** Python 3.11+, FastAPI (Vendas, pedidos, integração Asaas e Webhooks).
- **Banco de Dados:** PostgreSQL.
- **Integrações:** API Asaas (Checkout Pix Transparente), API OpenRouter (NVIDIA Nemotron para LLM).
- **Geração de PDF:** ReportLab ou WeasyPrint (Python).

## 3. Estrutura do Repositório (Monorepo)
```text
/
 ├── /frontend
 │    ├── /platform       # Next.js (App do Criador B2B)
 │    └── /checkout       # Next.js (Drop Engine B2C - Vendas)
 ├── /backend
 │    ├── /platform       # FastAPI (Rotas B2B, Orquestração de campanhas)
 │    ├── /ai             # FastAPI (Scraping, IA, Geração de PDF)
 │    └── /checkout       # FastAPI (Rotas B2C, Pedidos, Asaas PIX)
 └── docker-compose.yml   # Orquestração
```

## 4. Modelagem de Banco de Dados (PostgreSQL)

### Tabela: `campaigns` (Guarda o Drop e a Página)
- `id`: UUID (Primary Key)
- `handle`: String (Ex: @criador)
- `status`: String (active, ended)
- `product_type`: String (physical, digital)
- `price`: Decimal
- `theme_config`: JSONB (Cores: primary, background, foto_url)
- `copy_data`: JSONB (Título, subtítulo, hooks, benefícios)
- `scarcity_limit`: Integer (Limite de unidades, null se for tempo)
- `expires_at`: Timestamp (Data de fim do drop)
- `created_at`: Timestamp

### Tabela: `orders` (Guarda as Vendas)
- `id`: UUID (Primary Key)
- `campaign_id`: UUID (Foreign Key -> campaigns)
- `asaas_payment_id`: String
- `buyer_name`: String
- `buyer_email`: String
- `buyer_cpf`: String
- `buyer_address`: JSONB
- `status`: String (PENDING, PAID, FAILED)
- `created_at`: Timestamp

## 5. Endpoints do Backend

### 1. Backend Platform (`backend-platform` - Porta 8000)
Orquestra o fluxo de criação de campanhas para o Criador (B2B).
- **`POST /api/platform/campaign`**
  - **Payload:** `{ "handle": "@exemplo" }`
  - **Ação:** Salva campanha pendente -> Dispara requisição HTTP interna para o `backend-ai` rodar a análise -> Retorna ID da campanha.
  - **Response:** `{ "campaign_id": "uuid" }`

### 2. Backend AI (`backend-ai` - Porta 8001)
Processa a geração de conteúdo e blueprints de forma isolada.
- **`POST /api/ai/analyze`**
  - **Payload:** `{ "campaign_id": "uuid", "handle": "@exemplo" }`
  - **Ação:** Faz scraping -> Roda Nemotron -> Salva resultado no DB -> Gera PDF.
  - **Response:** `{ "status": "success", "pdf_url": "link_do_blueprint" }`

### 3. Backend Checkout (`backend-checkout` - Porta 8002)
Responsável pelas transações de vendas do consumidor final (B2C) e processamento financeiro.
- **`GET /api/sales/campaign/{campaign_id}`**
  - **Ação:** Retorna dados públicos da campanha (cores, copy, preço, escassez) para a página de vendas.
- **`POST /api/sales/checkout`**
  - **Payload:** `{ "campaign_id": "uuid", "buyer_name": "...", "cpf": "...", "email": "..." }`
  - **Ação:** Cria cliente e cobrança no Asaas. Salva pedido como PENDING.
  - **Response:** `{ "order_id": "uuid", "pix_qr_code": "...", "pix_copy_paste": "..." }`
- **`POST /webhooks/asaas`**
  - **Ação:** Escuta o evento `PAYMENT_RECEIVED` do webhook do Asaas e atualiza o status do pedido para `PAID` no banco.

## 6. Frontend (Next.js - Rotas)

### 1. Frontend Platform (`frontend-platform` - Porta 3000)
- **`/` (Home):** Input simples centralizado para digitar o `@handle` e botão "Gerar Drop".
- **`/processing`:** Tela de loading animada acompanhando o processamento do backend.
- **`/success/[campaign_id]`:** Mostra 2 botões: "Baixar Blueprint (PDF)" e "Copiar Link de Vendas" (aponta para o `frontend-checkout`).

### 2. Frontend Checkout (`frontend-checkout` - Porta 3001)
- **`/d/[campaign_id]`:**
  - Layout Mobile-First (Tailwind).
  - Consome `GET http://backend-checkout:8002/api/sales/campaign/{campaign_id}`.
  - Injeta as cores dinâmicas.
  - Botão de Compra abre o Modal.
- **Modal de Checkout:**
  - Formulário (Nome, E-mail, CPF).
  - Faz requisição `POST /api/sales/checkout`.
  - Exibe QR Code e chave PIX na tela.

## 7. Variáveis de Ambiente Necessárias

**Backend Platform (`/backend/platform/.env`)**
```env
DATABASE_URL=postgresql://user:pass@db:5432/bytemedia
BACKEND_AI_URL=http://backend-ai:8001
```

**Backend AI (`/backend/ai/.env`)**
```env
DATABASE_URL=postgresql://user:pass@db:5432/bytemedia
OPENROUTER_API_KEY=chave_do_nemotron
```

**Backend Checkout (`/backend/checkout/.env`)**
```env
DATABASE_URL=postgresql://user:pass@db:5432/bytemedia
ASAAS_API_KEY=sua_chave_asaas
ASAAS_WALLET_ID=id_da_sua_carteira_para_split
```

**Frontend Platform (`/frontend/platform/.env.local`)**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Frontend Checkout (`/frontend/checkout/.env.local`)**
```env
NEXT_PUBLIC_API_URL=http://localhost:8002
```

## 8. Infraestrutura e Docker (Modo Dev com Hot Reload)
O repositório é conteinerizado com volumes mapeados:
- **Serviço `db` (Postgres):** Porta 5432.
- **Serviço `backend-platform`:** Porta 8000.
- **Serviço `backend-ai`:** Porta 8001.
- **Serviço `backend-checkout`:** Porta 8002.
- **Serviço `frontend-platform`:** Porta 3000.
- **Serviço `frontend-checkout`:** Porta 3001.