# ByteMedia MVP 🚀

Plataforma "Zero-Click" para criadores de conteúdo lançarem *Drops* (produtos físicos/digitais limitados). A IA analisa a audiência, gera o produto (Blueprint) e cria a página de vendas com checkout transparente (PIX via Asaas).

## 🛠 Stack Tecnológico
- **Frontend:** Next.js 14, React, Tailwind CSS, TypeScript
- **Backend:** Python 3.11+, FastAPI, Pydantic V2
- **Banco de Dados:** PostgreSQL
- **Infra:** Docker & Docker Compose (com Hot Reload)
- **Integrações:** Asaas API (PIX) e OpenRouter (NVIDIA Nemotron)

## 📂 Estrutura do Repositório
```text
/
 ├── /frontend            # Next.js (Plataforma B2B e Drop Engine)
 ├── /backend-core        # FastAPI (Rotas API, IA, Asaas, DB)
 ├── docker-compose.yml   # Orquestração dos containers
 ├── DESIGN.md            # Diretrizes de UX/UI
 ├── REQUIREMENTS.md      # Requisitos funcionais e não funcionais
 └── SPECS.md             # Especificações técnicas detalhadas
```

## ⚙️ Pré-requisitos
- [Docker](https://docs.docker.com/get-docker/) e [Docker Compose](https://docs.docker.com/compose/install/) instalados.

## 🚀 Como rodar o projeto localmente (Dev Mode)

**1. Clone o repositório e configure as variáveis de ambiente:**
Crie os arquivos `.env` para frontend e backend (consulte `SPECS.md` para ver os exemplos de variáveis).

**2. Suba os containers com Hot Reload ativado:**
```bash
docker-compose up --build
```

### 📍 Acessos Locais
- **Frontend (App B2B & Links B2C):** http://localhost:3000
- **Backend (API):** http://localhost:8000
- **Swagger (Documentação da API):** http://localhost:8000/docs
- **Banco de Dados:** `localhost:5432` (PostgreSQL)

## 🛑 Parando os serviços

Para parar os serviços:
```bash
docker-compose down
```

Para limpar volumes (apagar o banco de dados local):
```bash
docker-compose down -v
```

---

## 🔮 Roadmap de Infraestrutura Futura

Em etapas futuras de escala, a infraestrutura será migrada para a stack serverless de ultra-baixa latência:
- **Supabase**: PostgreSQL gerenciado, Supabase Storage (CDN global) para upload de arquivos dos criadores e Webhooks para conciliação instantânea de Pix.
- **Cloudflare Pages & Workers**: Deploicamento Edge de alta performance para os frontends Next.js (`platform` e `checkout`).