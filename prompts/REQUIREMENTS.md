# Requisitos do Sistema - ByteMedia MVP

## 1. Visão Geral
Plataforma "Zero-Click" para criadores de conteúdo lançarem Drops de produtos. A IA analisa a demanda e o sistema gera o produto (Blueprint) e a página de checkout automaticamente. Não há sistema de login no MVP.

## 2. Requisitos Funcionais
- **[RF01]** O sistema deve ter um campo para receber o `@handle` do criador.
- **[RF02]** O backend deve processar os dados do perfil via IA (Nemotron/OpenRouter) para estruturar a oferta.
- **[RF03]** O sistema deve gerar um relatório Blueprint em PDF disponível para download.
- **[RF04]** O sistema deve gerar uma página de vendas (Drop Engine) mobile-first.
- **[RF05]** A página de vendas deve injetar automaticamente as cores e a foto de perfil do criador.
- **[RF06]** A página deve exibir elementos visuais de escassez (cronômetro ou barra de limite de unidades).
- **[RF07]** O sistema deve processar pagamentos via Pix Transparente integrado ao Asaas.
- **[RF08]** O QR Code e a chave Pix Copia e Cola devem ser exibidos na própria tela de checkout.
- **[RF09]** O sistema deve processar Webhooks do Asaas para atualizar o status do pedido para "PAID".

## 3. Requisitos Não Funcionais
- **[RNF01]** Arquitetura dividida em Frontend (Next.js 14) e Backend (FastAPI - Python).
- **[RNF02]** Banco de dados relacional em PostgreSQL.
- **[RNF03]** Todo o ambiente deve rodar via Docker e Docker Compose.
- **[RNF04]** O ambiente de desenvolvimento deve suportar fast/hot reload (mapeamento de volumes).
- **[RNF05]** A geração do PDF deve ser assíncrona para não travar a API.