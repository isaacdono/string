# Product Backlog — ByteMedia MVP 🚀

> **Version:** 1.0.0  
> **Status:** Approved / Ready for Development  
> **Target Release:** MVP v1  
> **Architecture:** Decoupled Polyglot Microservices (Next.js 14 + FastAPI + PostgreSQL)

---

## 1. Visão Geral e Princípios do Produto

A **ByteMedia** é uma plataforma *"Zero-Click"* para criadores de conteúdo monetizarem suas audiências através de **Drops** exclusivos (físicos ou digitais). O sistema analisa a demanda via Inteligência Artificial (OpenRouter / NVIDIA Nemotron), sintetiza a oferta com um relatório executivo (**Blueprint PDF**) e cria instantaneamente uma página de vendas de alta conversão (**Drop Engine**) integrada ao **Pix Transparente via Asaas**.

### Princípios Norteadores
1. **Fricção Zero:** Sem sistema de login/senha para criadores ou compradores no MVP.
2. **Mobile-First Absoluto:** Experiência de compra vertical (estilo Instagram Stories) otimizada para tráfego social.
3. **Desacoplamento Completo:** Serviços independentes no Frontend e Backend para máxima escalabilidade e isolamento de responsabilidades.
4. **Feedback em Tempo Real:** Confirmação de pagamentos e estados de loading informativos e reativos.

---

## 2. Mapa de Alocação Técnica & Microsserviços

| Microsserviço | Stack | Porta | Responsabilidade Principal |
| :--- | :--- | :--- | :--- |
| **`frontend-platform`** | Next.js 14 (App Router, Tailwind, TS) | `3000` | Interface B2B do Criador: Entrada de `@handle`, tela de progresso e entrega de links/Blueprint. |
| **`frontend-checkout`** | Next.js 14 (App Router, Tailwind, TS) | `3001` | Drop Engine B2C: Landing page do drop, injeção de tema, gatilhos de escassez e modal bottom-sheet de checkout. |
| **`backend-platform`** | Python 3.11+, FastAPI, Pydantic V2 | `8000` | Orquestração B2B: Recepção de solicitações de campanha e coordenação interna de jobs. |
| **`backend-ai`** | Python 3.11+, FastAPI, OpenRouter | `8001` | Inteligência e Mídia: Scraping de perfis, síntese de oferta via Nemotron LLM e geração assíncrona do PDF Blueprint. |
| **`backend-checkout`** | Python 3.11+, FastAPI, Asaas SDK | `8002` | Motor Transacional B2C: Consulta de dados públicos do Drop, emissão de Pix no Asaas e processamento de Webhooks. |
| **`db`** | PostgreSQL 15 | `5432` | Persistência relacional unificada (`campaigns`, `orders`). |

---

## 3. Matriz de Priorização do Backlog (MoSCoW)

| ID | Requisito | User Story | Prioridade | Serviços Envolvidos |
| :--- | :--- | :--- | :--- | :--- |
| **US01** | RF01 | Entrada de Perfil do Criador (`@handle`) | **Must Have** | `frontend-platform`, `backend-platform`, `db` |
| **US02** | RF02 | Análise e Estruturação de Oferta com IA | **Must Have** | `backend-ai`, `backend-platform`, `db` |
| **US03** | RF03 | Geração Assíncrona e Download do Blueprint PDF | **Must Have** | `backend-ai`, `frontend-platform`, `backend-platform` |
| **US04** | RF04 | Página de Vendas Mobile-First (Drop Engine) | **Must Have** | `frontend-checkout`, `backend-checkout`, `db` |
| **US05** | RF05 | Injeção Dinâmica de Identidade Visual e Cores | **Must Have** | `frontend-checkout`, `backend-checkout` |
| **US06** | RF06 | Gatilhos Visuais de Escassez e Urgência | **Must Have** | `frontend-checkout`, `backend-checkout`, `db` |
| **US07** | RF07 | Checkout Transparente e Emissão de Cobrança Pix | **Must Have** | `frontend-checkout`, `backend-checkout`, `db` |
| **US08** | RF08 | Exibição de QR Code e Pix Copia-e-Cola no Modal | **Must Have** | `frontend-checkout`, `backend-checkout` |
| **US09** | RF09 | Processamento de Webhooks Asaas e Confirmação Seamless | **Must Have** | `backend-checkout`, `frontend-checkout`, `db` |
| **US10** | RNF04/05 | Polling de Status do Pedido em Tempo Real | **Should Have** | `frontend-checkout`, `backend-checkout` |
| **US11** | Melhoria | Compartilhamento Social e Copy Pronta para Stories | **Should Have** | `frontend-platform` |
| **US12** | Extensão | Split de Pagamento Automático para Carteira do Criador | **Could Have** | `backend-checkout` |
| **US13** | Extensão | Métricas Básicas de Visualização e Conversão | **Could Have** | `backend-checkout`, `frontend-checkout` |

---

## 4. Detalhamento das User Stories & Critérios de Aceitação BDD

---

### [US01] Entrada de Perfil do Criador e Início do Drop
- **Requisito Associado:** `[RF01]`
- **Prioridade:** `Must Have (MVP)`
- **Alocação Técnica:**
  - Frontend: `frontend-platform` (`app/page.tsx`, `app/processing/page.tsx`)
  - Backend: `backend-platform` (`POST /api/platform/campaign`)
  - Database: `db` (Tabela `campaigns`)

#### Narrativa do Usuário
> **Como** criador de conteúdo,  
> **Eu quero** inserir meu `@handle` em uma interface minimalista e iniciar a geração com um clique,  
> **Para que** eu possa criar meu Drop instantaneamente sem passar por burocracias de cadastro ou login.

#### Critérios de Aceitação (BDD)

```gherkin
Cenário: Criador envia handle válido com sucesso
  Dado que o criador acessa a página inicial do "frontend-platform" (http://localhost:3000)
  Quando ele digita "@brunogagliasso" no campo de handle
  E clica no botão "Gerar Drop"
  Então o frontend deve enviar uma requisição "POST /api/platform/campaign" com o payload:
    """
    { "handle": "@brunogagliasso" }
    """
  E o "backend-platform" deve registrar a campanha com status "pending" no banco de dados
  E a API deve responder com status 202/200 contendo o "campaign_id" gerado
  E o criador deve ser redirecionado para a rota "/processing?id={campaign_id}" exibindo o feedback em steps.

Cenário: Validação de formato inválido no cliente
  Dado que o criador está no formulário inicial
  Quando ele digita um handle vazio ou sem caracteres válidos (ex: "   " ou "@")
  E tenta submeter
  Então o botão de envio deve permanecer desabilitado ou exibir uma mensagem de erro: "Informe um @handle válido do Instagram ou TikTok".
  E nenhuma requisição de criação deve ser disparada ao backend.

Cenário: Falha de comunicação com o backend
  Dado que o criador submete um handle válido
  Quando o serviço "backend-platform" estiver indisponível ou retornar erro 500
  Então o frontend deve exibir uma mensagem amigável: "Não foi possível iniciar a geração. Tente novamente em instantes."
  E permitir uma nova tentativa sem recarregar a página.
```

---

### [US02] Análise de Demanda e Síntese de Oferta via IA
- **Requisito Associado:** `[RF02]`
- **Prioridade:** `Must Have (MVP)`
- **Alocação Técnica:**
  - Backend Orquestrador: `backend-platform`
  - Backend Especialista: `backend-ai` (`POST /api/ai/analyze`, OpenRouter Nemotron)
  - Database: `db` (Tabela `campaigns`)

#### Narrativa do Usuário
> **Como** criador de conteúdo,  
> **Eu quero** que a inteligência artificial analise meu nicho e estrutura de audiência,  
> **Para que** seja definida automaticamente uma oferta irresistível (tipo de produto, precificação, copy persuasiva e escassez).

#### Critérios de Aceitação (BDD)

```gherkin
Cenário: Processamento bem-sucedido de IA via OpenRouter Nemotron
  Dado que uma nova campanha foi registrada pelo "backend-platform" com id "camp-123"
  Quando o "backend-platform" invoca "POST http://backend-ai:8001/api/ai/analyze" com:
    """
    { "campaign_id": "camp-123", "handle": "@brunogagliasso" }
    """
  Então o "backend-ai" deve realizar a chamada à API do OpenRouter utilizando o modelo NVIDIA Nemotron
  E estruturar o JSON de resposta contendo obrigatoriamente:
    - product_type: ("physical" ou "digital")
    - price: valor numérico decimal em BRL
    - theme_config: objeto com "primary_color", "background_color", "avatar_url"
    - copy_data: objeto com "title", "subtitle", "hooks", "benefits", "social_proof_quotes"
    - scarcity_limit: quantidade de unidades ou prazo limite em "expires_at"
  E atualizar o registro da tabela "campaigns" correspondente no PostgreSQL
  E atualizar o status da campanha para "active".

Cenário: Timeout ou falha na chamada do OpenRouter LLM
  Dado que o "backend-ai" acionou o OpenRouter
  Quando ocorrer um erro 429 (Rate Limit) ou timeout na resposta da IA
  Então o "backend-ai" deve aplicar retry exponencial (até 2 tentativas)
  E caso persista a falha, carregar um template fallback estruturado compatível com o nicho do criador
  E garantir que a campanha nunca fique em estado inconsistente/travada.
```

---

### [US03] Geração Assíncrona e Download do Relatório Blueprint (PDF)
- **Requisito Associado:** `[RF03]`, `[RNF05]`
- **Prioridade:** `Must Have (MVP)`
- **Alocação Técnica:**
  - Backend: `backend-ai` (Engine ReportLab/WeasyPrint)
  - Frontend: `frontend-platform` (`app/success/[campaign_id]/page.tsx`)
  - Backend Orquestrador: `backend-platform` (`GET /api/platform/campaign/{id}/blueprint`)

#### Narrativa do Usuário
> **Como** criador de conteúdo,  
> **Eu quero** baixar um relatório Blueprint executivo em formato PDF,  
> **Para que** eu tenha em mãos a estratégia completa do produto, análise de público, cronograma do drop e projeção de faturamento.

#### Critérios de Aceitação (BDD)

```gherkin
Cenário: Geração do PDF Blueprint sem bloquear o pipeline principal
  Dado que a análise da IA foi concluída com sucesso para a campanha "camp-123"
  Quando o "backend-ai" recebe os dados estruturados da oferta
  Então ele deve acionar a rotina assíncrona de compilação do documento PDF (ReportLab/WeasyPrint)
  E incluir no PDF:
    - Cabeçalho personalizado com o @handle e paleta de cores
    - Resumo Executivo da Oferta (Nome do Produto, Ticket Médio, Modelo de Negócio)
    - Persona & Dores do Público-Alvo
    - Roteiro de Stories (Copy de Aquecimento, Lançamento e Fechamento)
    - Projeção de Receita baseada no limite de escassez
  E salvar o arquivo estático e disponibilizar a URL segura de download.

Cenário: Criador faz download do Blueprint na tela de Sucesso
  Dado que o processamento da campanha "camp-123" foi finalizado
  Quando o criador é direcionado para a página "/success/camp-123" no "frontend-platform"
  E clica no botão "Baixar Blueprint (PDF)"
  Então o navegador deve iniciar o download do arquivo "blueprint-brunogagliasso.pdf"
  E o arquivo deve estar íntegro e legível.
```

---

### [US04] Página de Vendas Mobile-First (Drop Engine)
- **Requisito Associado:** `[RF04]`, `[RNF01]`
- **Prioridade:** `Must Have (MVP)`
- **Alocação Técnica:**
  - Frontend: `frontend-checkout` (`app/d/[campaign_id]/page.tsx`, `components/Hero.tsx`, `components/Benefits.tsx`, `components/SocialProof.tsx`, `components/StickyCTA.tsx`)
  - Backend: `backend-checkout` (`GET /api/sales/campaign/{campaign_id}`)
  - Database: `db` (`campaigns`)

#### Narrativa do Usuário
> **Como** seguidor/comprador,  
> **Eu quero** acessar uma página de vendas ultra rápida e desenhada especificamente para celular (Stories ratio),  
> **Para que** eu conheça a oferta, entenda os benefícios e tome a decisão de compra sem distrações.

#### Critérios de Aceitação (BDD)

```gherkin
Cenário: Carregamento do Drop com estrutura sequencial top-down
  Dado que o comprador abre o link "http://localhost:3001/d/camp-123" no navegador do smartphone
  Quando a página carrega
  Então o "frontend-checkout" deve consumir "GET http://backend-checkout:8002/api/sales/campaign/camp-123"
  E renderizar os seguintes blocos na ordem estrita:
    1. Header: Foto de perfil circular e @handle oficial
    2. Hero Section: Imagem do produto em destaque, título persuasivo e preço
    3. Bloco de Escassez: Contagem regressiva ou indicador de estoque
    4. Descrição & Benefícios: Bullet points claros e diretos
    5. Prova Social: Balões visuais no formato de comentários de redes sociais
    6. Sticky CTA: Botão fixo no rodapé "Comprar Agora" visível durante toda a rolagem.

Cenário: Acesso a link de campanha inexistente ou expirada
  Dado que o comprador tenta acessar uma URL inválida "/d/id-inexistente"
  Quando o "backend-checkout" retornar erro HTTP 404 (Not Found)
  Então a aplicação deve exibir uma tela estilizada de "Drop Encerrado ou Não Encontrado"
  E orientar o usuário a acompanhar o criador em suas redes oficiais.
```

---

### [US05] Injeção Dinâmica de Identidade Visual e Paleta do Criador
- **Requisito Associado:** `[RF05]`
- **Prioridade:** `Must Have (MVP)`
- **Alocação Técnica:**
  - Frontend: `frontend-checkout` (`app/d/[campaign_id]/layout.tsx`, Tailwind CSS Variables)
  - Backend: `backend-checkout` (`GET /api/sales/campaign/{campaign_id}` -> `theme_config`)

#### Narrativa do Usuário
> **Como** comprador,  
> **Eu quero** que a página de vendas adote as cores e o avatar oficial do criador,  
> **Para que** eu reconheça a marca imediatamente e tenha total confiança na transação.

#### Critérios de Aceitação (BDD)

```gherkin
Cenário: Aplicação das variáveis de tema da campanha no DOM
  Dado que os dados da campanha retornam "theme_config":
    """
    {
      "primary_color": "#E1306C",
      "background_color": "#0F0F10",
      "text_color": "#FFFFFF",
      "avatar_url": "https://cdn.bytemedia.com/avatars/creator.jpg"
    }
    """
  Quando o "frontend-checkout" monta a página de vendas
  Então o elemento raiz deve injetar as variáveis CSS:
    - `--color-primary: #E1306C;`
    - `--color-bg: #0F0F10;`
    - `--color-text: #FFFFFF;`
  E os botões principais, realces e badges de escassez devem refletir `--color-primary`
  E o avatar do criador deve ser renderizado no topo com borda iluminada na cor primária.

Cenário: Fallback para paleta padrão caso tema esteja incompleto
  Dado que a resposta do backend possui valores nulos em "theme_config"
  Quando o frontend inicializa
  Então devem ser adotados os estilos padrão corporativos (Preto `#000000`, Branco `#FFFFFF` e Destaque Índigo `#6366F1`)
  E o layout não deve quebrar visualmente.
```

---

### [US06] Gatilhos Visuais de Escassez e Urgência (Timer / Barra de Vagas)
- **Requisito Associado:** `[RF06]`
- **Prioridade:** `Must Have (MVP)`
- **Alocação Técnica:**
  - Frontend: `frontend-checkout` (`components/ScarcityWidget.tsx`)
  - Backend: `backend-checkout` (`GET /api/sales/campaign/{campaign_id}`)
  - Database: `db` (`campaigns.scarcity_limit`, `campaigns.expires_at`, contagem de `orders` com status `PAID`)

#### Narrativa do Usuário
> **Como** comprador,  
> **Eu quero** visualizar o tempo restante do Drop ou a quantidade de unidades disponíveis,  
> **Para que** eu seja informado sobre a exclusividade e tome a decisão antes do esgotamento.

#### Critérios de Aceitação (BDD)

```gherkin
Cenário: Drop com limite de tempo exibe cronômetro regressivo
  Dado que a campanha possui "product_type" = "digital" e "expires_at" definido para 4 horas no futuro
  Quando a página de vendas é carregada
  Então o componente de escassez deve renderizar um contador decrescente ativo (Horas : Minutos : Segundos)
  E atualizar a cada 1 segundo em tempo real.

Cenário: Drop com limite de unidades físicas exibe barra de progresso
  Dado que a campanha possui "scarcity_limit" = 100 e já existem 75 pedidos com status "PAID"
  Quando a página de vendas é renderizada
  Então o componente deve exibir: "Restam apenas 25 de 100 unidades"
  E uma barra de progresso preenchida em 75% na cor primária do tema.

Cenário: Esgotamento do Drop (Tempo expirado ou unidades zeradas)
  Dado que a contagem de unidades disponíveis atingiu 0 ou o timer zerou
  Quando o usuário visualiza a página
  Então o botão Sticky CTA deve ficar desabilitado com o texto "Drop Esgotado"
  E a abertura do modal de checkout deve ser bloqueada.
```

---

### [US07] Checkout Transparente via Pix Integrado ao Asaas
- **Requisito Associado:** `[RF07]`
- **Prioridade:** `Must Have (MVP)`
- **Alocação Técnica:**
  - Frontend: `frontend-checkout` (`components/CheckoutModal.tsx`, `components/BottomSheet.tsx`)
  - Backend: `backend-checkout` (`POST /api/sales/checkout`, Asaas API Client)
  - Database: `db` (Tabela `orders`)

#### Narrativa do Usuário
> **Como** comprador,  
> **Eu quero** clicar no botão de compra e preencher apenas meus dados essenciais em um modal inferior (Bottom Sheet),  
> **Para que** o pagamento Pix seja gerado sem redirecionamento para gateways externos.

#### Critérios de Aceitação (BDD)

```gherkin
Cenário: Abertura fluida do Bottom Sheet e preenchimento de dados
  Dado que o comprador está na página do Drop
  Quando ele clica no botão "Comprar Agora"
  Então um modal estilo Bottom Sheet deve deslizar da borda inferior da tela
  E exibir os campos:
    - Nome Completo (input text)
    - E-mail (input email)
    - CPF (input com máscara automática 000.000.000-00)
  E manter a visualização do resumo do pedido e valor total.

Cenário: Envio de checkout e criação de cobrança no Asaas
  Dado que o comprador preencheu os campos com Nome válido, E-mail e CPF válido
  Quando ele clica no botão "Gerar Pix"
  Então o "frontend-checkout" deve enviar "POST http://backend-checkout:8002/api/sales/checkout" com:
    """
    {
      "campaign_id": "camp-123",
      "buyer_name": "Lucas Silva",
      "email": "lucas@example.com",
      "cpf": "12345678909"
    }
    """
  E o "backend-checkout" deve criar o cliente e a cobrança Pix na API do Asaas
  E persistir o registro na tabela "orders" com status "PENDING"
  E retornar resposta HTTP 200 contendo "order_id", "pix_qr_code" e "pix_copy_paste".

Cenário: Falha de validação de CPF ou dados incompletos
  Dado que o comprador insere um CPF matematicamente inválido ou e-mail malformatado
  Quando ele tenta submeter o formulário
  Então o formulário deve exibir mensagens de erro inline abaixo dos respectivos campos
  E o botão de envio deve permanecer inativo até a correção.
```

---

### [US08] Exibição de QR Code e Pix Copia-e-Cola no Modal
- **Requisito Associado:** `[RF08]`
- **Prioridade:** `Must Have (MVP)`
- **Alocação Técnica:**
  - Frontend: `frontend-checkout` (`components/PixPaymentView.tsx`)
  - Backend: `backend-checkout` (`POST /api/sales/checkout`)

#### Narrativa do Usuário
> **Como** comprador,  
> **Eu quero** visualizar o QR Code do Pix e ter um botão de copiar a chave em um clique,  
> **Para que** eu possa pagar rapidamente pelo app do meu banco sem erros de digitação.

#### Critérios de Aceitação (BDD)

```gherkin
Cenário: Transição instantânea do formulário para visualização do Pix
  Dado que a chamada de checkout retornou sucesso com os dados do Pix
  Quando a resposta chega ao "frontend-checkout"
  Então o Bottom Sheet deve transicionar com animação suave para a tela de pagamento
  E exibir de forma destacada:
    - Imagem do QR Code Pix centralizada e nítida
    - Botão largo "Copiar Código Pix"
    - Instruções passo a passo ("1. Abra o app do banco > 2. Escolha Pagar via Pix > 3. Cole o código").

Cenário: Cópia da chave Pix com feedback visual (Toast/Copiado)
  Dado que o comprador está na tela de pagamento Pix
  Quando ele clica no botão "Copiar Código Pix"
  Então a string correspondente ao payload "pix_copy_paste" deve ser gravada na área de transferência do dispositivo
  E o texto do botão deve mudar para "Código Copiado! ✔️" por 3 segundos
  E um feedback tátil/visual deve confirmar a ação.
```

---

### [US09] Processamento de Webhooks do Asaas e Confirmação Seamless
- **Requisito Associado:** `[RF09]`
- **Prioridade:** `Must Have (MVP)`
- **Alocação Técnica:**
  - Backend: `backend-checkout` (`POST /webhooks/asaas`, `GET /api/sales/order/{order_id}/status`)
  - Frontend: `frontend-checkout` (`components/PaymentSuccessView.tsx`, Polling/SSE hook)
  - Database: `db` (Tabela `orders`, coluna `status`)

#### Narrativa do Usuário
> **Como** comprador,  
> **Eu quero** que a tela de pagamento reconheça automaticamente a aprovação do Pix sem que eu precise recarregar o navegador,  
> **Para que** eu tenha certeza imediata de que minha compra foi concluída com sucesso.

#### Critérios de Aceitação (BDD)

```gherkin
Cenário: Recepção de Webhook do Asaas com evento de pagamento aprovado
  Dado que o Asaas dispara um evento HTTP para o "backend-checkout":
    """
    POST http://backend-checkout:8002/webhooks/asaas
    Headers: { "asaas-access-token": "secret_token" }
    Payload: {
      "event": "PAYMENT_RECEIVED",
      "payment": { "id": "pay_asaas_999", "status": "RECEIVED" }
    }
    """
  Quando o "backend-checkout" processa a requisição
  Então ele deve localizar o pedido correspondente ao "asaas_payment_id" no banco de dados
  E atualizar a coluna "status" do pedido de "PENDING" para "PAID"
  E responder ao Asaas com HTTP 200 OK em menos de 1000ms.

Cenário: Atualização da tela do comprador em tempo real (Seamless Green Check)
  Dado que o comprador permanece com o modal de Pix aberto aguardando a compensação
  Quando o backend atualiza o status do pedido para "PAID"
  E o mecanismo de verificação em tempo real (polling a cada 2s ou SSE) detecta o status atualizado
  Então a tela do modal deve substituir instantaneamente o QR Code por um ícone animado de "Check Verde" (Pagamento Confirmado!)
  E exibir: "Obrigado pela compra! O comprovante e os detalhes foram enviados para o seu e-mail."
  E disparar efeito visual festivo/confetti para celebração da conversão.

Cenário: Idempotência do Webhook
  Dado que o Asaas envia o mesmo evento "PAYMENT_RECEIVED" em duplicidade
  Quando o "backend-checkout" recebe a segunda notificação
  Então ele deve constatar que o pedido já está com status "PAID"
  E retornar HTTP 200 imediatamente sem duplicar registros ou disparar efeitos colaterais repetidos.
```

---

## 5. Histórias de Evolução & Backlog Futuro (Should & Could Have)

### [US10] Polling Inteligente / WebSocket de Status do Pedido
- **Prioridade:** `Should Have`
- **Serviços:** `frontend-checkout`, `backend-checkout`
- **Descrição:** Mecanismo de polling incremental ou Server-Sent Events (SSE) que monitora o status do pedido `order_id` na rota `GET /api/sales/order/{order_id}/status` com backoff automático e timeout de segurança de 15 minutos.

### [US11] Compartilhamento e Snippets para Redes Sociais
- **Prioridade:** `Should Have`
- **Serviços:** `frontend-platform`
- **Descrição:** Na tela `/success/[campaign_id]`, oferecer botão "Copiar Link do Drop" e sugestões de copy para Stories com chamada direta e adesivo de link.

### [US12] Split de Pagamento Asaas Automático para o Criador
- **Prioridade:** `Could Have`
- **Serviços:** `backend-checkout`
- **Descrição:** Divisão automática de receita (split de pagamento) na criação da cobrança Asaas utilizando `ASAAS_WALLET_ID` para repasse automático da comissão do criador.

### [US13] Painel de Métricas e Conversão do Drop
- **Prioridade:** `Could Have`
- **Serviços:** `backend-checkout`, `frontend-checkout`
- **Descrição:** Rastreamento anônimo de visualizações de página, cliques no CTA de compra e taxa de conversão do Pix.

---

## 6. Critérios de Qualidade e Prontidão

### Definition of Ready (DoR)
Uma User Story está pronta para ser iniciada pelos desenvolvedores (`backend_engineer` e `frontend_dev`) quando:
- [x] O contrato de payload/resposta HTTP e portas de comunicação entre microsserviços estão definidos.
- [x] Os critérios de aceitação BDD (Given/When/Then) cobrem o fluxo principal e caminhos de exceção.
- [x] As variáveis de ambiente e dependências de infraestrutura estão mapeadas no `docker-compose.yml`.
- [x] As diretrizes visuais (layout, mobile-first, paleta) estão consolidadas no `DESIGN.md`.

### Definition of Done (DoD)
Uma User Story é considerada concluída quando:
- [x] O código está implementado dentro do respectivo microsserviço no monorepo (`frontend/platform`, `frontend/checkout`, `backend/platform`, `backend/ai`, `backend/checkout`).
- [x] A comunicação entre microsserviços via Docker Network funciona localmente via `docker-compose up`.
- [x] As regras de validação (Pydantic / Zod / React Hook Form) cobrem inputs inválidos.
- [x] O comportamento visual foi validado em viewport mobile (375px a 430px de largura).
- [x] Não há logs de erro não tratados no console do navegador ou no stdout dos containers FastAPI.
