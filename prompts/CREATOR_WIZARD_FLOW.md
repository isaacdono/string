# ByteMedia — Especificação do Fluxo Wizard do Creator (B2B)

> **Princípio de Posicionamento & Paz de Espírito:** O creator NUNCA deve sentir desespero ou pressão para criar um arquivo correndo.
> A ByteMedia permite **testar a plataforma sem compromisso** e lançar no próprio ritmo.
> Se ele não tiver o produto pronto hoje, ele pode:
> 1. Gerar o link no **Modo Rascunho/Teste** e só divulgar na rede dele quando subir o arquivo.
> 2. Lançar em **Pré-Venda com Prazo Customizável** (ex: entrega em 7 dias, 14 dias ou data escolhida), avisando o comprador com transparência no checkout.

---

## 📐 Diretrizes Globais de Design & UX

### 1. Elementos Visuais & Doodles (Y2K / Stories Native)
- **Fundo:** Limpo (`#F5F4EF` / `#0E0E0E`) para manter o foco na oferta.
- **Setas Feitas à Mão:** Apontam diretamente para o botão/CTA principal.
- **Círculos Irregulares & Destaques Marcador de Texto:** Circulam a projeção de faturamento e ofertas escolhidas.
- **Sublinhados Rabiscados:** Destacam mensagens de alívio ("Sem pressa, você no controle!").
- **Emojis Estratégicos:** 🚀, ⚡, 💎, 🎯, 📊, 📄, 👥, 💰, 😌, 🧪.

### 2. Barra de Progresso Interativa (Passos 1 a 5)
Visível no topo de todas as etapas pós-entrada (`#0E0E0E` / `#FF4D00`):

```
Passo X de 5  ●━━━━━━━━○━━━━━━━━○━━━━━━━━○━━━━━━━━○
              Analisando   Oferta   Entrega   Receber   Lançar
```

---

## 🗂️ Mapeamento de Sugestões de Oferta (Origem & Armazenamento)

A IA analisa o perfil e sugere **3 formatos/estratégias de oferta** com maior potencial de faturamento para o nicho do criador:

| Camada | Local | Descrição |
|--------|-------|-----------|
| **Backend / IA** | `backend/ai/adapters/gateways.py` | A IA gera a oferta principal (`title`, `price`, `format`) + lista `copy_data.alternative_products` (3 opções adicionais de formatos de oferta). |
| **Banco de Dados** | `campaigns.copy_data` (JSON) | Armazena a lista de sugestões com `title`, `description`, `format`, `price`. |
| **API Endpoint** | `GET /api/platform/campaign/{campaign_id}` | Retorna `copy_data.alternative_products` para o frontend exibir na Etapa 3. |

---

## 🗺️ Mapeamento Completo das Etapas (Rotas, Arquivos & Copy Alinhado)

### Etapa 1 — Entrada ("A Isca")
- **Rota:** `/`
- **Arquivo:** `frontend/platform/app/page.tsx`
- **Status:** ✅ Implementado
- **Visual:** Campo de input proeminente, estilo minimalista com doodles apontando para o botão.
- **Headline:** `"Qual @ vai faturar hoje?"`
- **Copy:** `"Digite seu perfil. Nossa IA analisa sua audiência e estrutura a oferta e a página de vendas perfeitas para você lançar em 2 minutos."`
- **Campos:** Input `@handle` + Ideia opcional do que quer vender.
- **CTA Principal:** `Criar minha oferta ➔`

---

### Etapa 2 — Análise ("O Raio-X")
- **Rota:** `/processing`
- **Arquivo:** `frontend/platform/app/processing/page.tsx`
- **Status:** ✅ Implementado
- **Visual:** Micro-animações e loaders dinâmicos que geram antecipação e dopamina.
- **Headline:** `"Estruturando sua oferta de vendas."`
- **Copy Dinâmico (alterando em tempo real):**
  1. `"Analisando o nicho e desejos da sua audiência..."`
  2. `"Calculando precificação e projeção de lucro..."`
  3. `"Gerando copy de alta conversão e checkout PIX..."`
- **Ação:** Processamento automático em segundo plano; redireciona para a Etapa 3 (`/product/[campaign_id]`).

---

### Etapa 3 — Escolha da Oferta ("Estratégia de Venda")
- **Rota:** `/product/[campaign_id]`
- **Arquivo:** `frontend/platform/app/product/[campaign_id]/page.tsx`
- **Status:** ❌ A Criar
- **Visual:** Projeção de faturamento estimada no topo, seguida pelas 3 Estratégias de Oferta Sugeridas pela IA (mapeadas de `copy_data.alternative_products`).
- **Headline:** `"Escolha o formato de oferta ideal para sua audiência."`
- **Copy:** `"Nossa IA identificou 3 formatos com alto potencial de faturamento para o seu nicho. Escolha como você prefere monetizar sua expertise:"`
- **Opções de Oferta (Cards Selecionáveis):**
  - **Material Digital (PDF/E-book):** `"Venda um e-book, guia, template ou planilha que você possui."`
  - **Acesso Exclusivo (Link de Grupo):** `"Venda acesso ao seu grupo VIP no WhatsApp, Telegram ou Close Friends."`
  - **Sessão / Mentoria (Agendamento):** `"Venda uma mentoria individual ou em grupo com link do Calendly."`
  - **Pré-Venda Instantânea (Sem Pressa):** `"Valide a ideia sem ter o arquivo pronto hoje. Defina o prazo de entrega que você quiser."`
- **Ajustes da Oferta (Preenchidos pela IA, editáveis):**
  - **Nome do Produto/Oferta:** Personalizável pelo criador.
  - **Preço Recomendado:** Sugerido pela IA (ex: R$ 47,00 ou R$ 147,00), editável.
  - **Gatilho de Urgência:** `( ) Tempo (Ex: Aberto por 48h)` ou `( ) Escassez (Ex: Apenas 50 vagas)`.
- **CTA Principal:** `Definir entrega do meu conteúdo ➔`

---

### Etapa 4 — Configuração da Entrega ("O Conteúdo & Alívio de Pressão")
- **Rota:** `/delivery/[campaign_id]`
- **Arquivo:** `frontend/platform/app/delivery/[campaign_id]/page.tsx`
- **Status:** ❌ A Criar
- **Visual:** Área limpa de upload ou link, com mensagem de paz de espírito para criadores testando a plataforma.
- **Headline:** `"Como seu comprador vai receber o conteúdo?"`
- **Copy:** `"Insira o arquivo ou o link de acesso. A ByteMedia cuida da entrega automática para cada comprador assim que o Pix for aprovado."`
- **Callout de Paz de Espírito (Alívio de Pressão):**
  > 😌 **Ainda não tem nada pronto? Fique tranquilo, você está no controle!**  
  > Você pode testar a plataforma sem correria. Escolha a opção que se adapta ao seu ritmo:
- **3 Modos Flexíveis de Entrega:**
  1. 📤 **"Já tenho meu arquivo pronto"** — Upload (Drag-and-Drop) do PDF, ZIP ou Planilha para entrega imediata pós-Pix.
  2. 🔗 **"Quero entregar via Link"** — Cole o link do grupo (WhatsApp/Telegram) ou agendamento (Calendly).
  3. ⚡ **"Pré-Venda com Prazo Flexível"** — Escolha a data de entrega para seus clientes *(ex: 7 dias, 14 dias ou data específica)*. O checkout avisa o comprador com transparência e você tem tempo de sobra para criar com calma.
  4. 🧪 **"Modo Rascunho (Vou divulgar depois)"** — Crie o checkout para ver como fica e só divulgue na sua rede social quando você subir o arquivo final.
- **CTA Principal:** `Conectar minha chave Pix ➔`

---

### Etapa 5 — Recebimento ("Chave Pix")
- **Rota:** `/pix/[campaign_id]`
- **Arquivo:** `frontend/platform/app/pix/[campaign_id]/page.tsx`
- **Status:** ❌ A Criar
- **Visual:** Card centralizado focado em simplicidade e transparência financeira.
- **Headline:** `"Pra onde a gente manda o seu Pix?"`
- **Copy:** `"Cole sua chave Pix. 100% do dinheiro de cada venda confirmada vai direto para a sua conta."`
- **Campos:** Seletor de Tipo (CPF, E-mail, Telefone, Chave Aleatória) + Input da Chave Pix.
- **Garantia:** `"Você receberá o valor das vendas diretamente nessa chave Pix após cada confirmação de pagamento."`
- **Nota de Arquitetura de Pagamentos:**
  > 💡 **Como funciona o repasse do Pix:**  
  > Como o Mercado Pago **não realiza split nativo para chaves Pix externas sem OAuth**, a ByteMedia opera no modelo de **Coleta Centralizada + PIX Out Automático via Webhook** (ou Split Nativo via Asaas).  
  > Quando o pagamento do cliente é aprovado, o webhook do backend dispara uma transferência Pix automática para a chave cadastrada pelo criador. Isso garante que o criador receba em **qualquer banco** sem precisar ter conta no Mercado Pago.
- **CTA Principal:** `Ativar minha página de vendas 🚀`


---

### Etapa 6 — O Play ("Lançamento & Dossiê")
- **Rota:** `/success/[campaign_id]`
- **Arquivo:** `frontend/platform/app/success/[campaign_id]/page.tsx`
- **Status:** ⚠️ Parcialmente Implementado
- **Visual:** Status "Página de Vendas Ativa" pulsando verde, botão gigante de link e card do Dossiê.
- **Headline:** `"Sua oferta está no ar e pronta para vender! 🚀"`
- **Copy de Apoio:** `"Sua página de checkout PIX está ativa. Baixe seu Dossiê de Lançamento para ver os roteiros prontos de Stories e a estratégia de vendas."`
- **Ações Principais:**
  - **Ação 1 (Vendas):** Botão Gigante `Copiar Link da Página`.
  - **Ação 2 (Estratégia):** Botão `Baixar Dossiê de Lançamento (PDF)`.

---

## 📊 Matriz de Status e Implementação

| Etapa | Tela / Rota | Rota do Arquivo | Status |
|-------|-------------|-----------------|--------|
| 1 — Handle | `/` | `frontend/platform/app/page.tsx` | ✅ Pronto |
| 2 — Análise | `/processing` | `frontend/platform/app/processing/page.tsx` | ✅ Pronto |
| 3 — Escolha da Oferta | `/product/[id]` | `frontend/platform/app/product/[campaign_id]/page.tsx` | ❌ Criar |
| 4 — Configurar Entrega | `/delivery/[id]` | `frontend/platform/app/delivery/[campaign_id]/page.tsx` | ❌ Criar |
| 5 — Chave Pix | `/pix/[id]` | `frontend/platform/app/pix/[campaign_id]/page.tsx` | ❌ Criar |
| 6 — Lançamento | `/success/[id]` | `frontend/platform/app/success/[campaign_id]/page.tsx` | ⚠️ Refatorar |

---

## 📄 Estrutura Executiva do Dossiê (PDF)

O **Dossiê de Lançamento em PDF** é gerado automaticamente e dividido em 4 blocos acionáveis para o creator ler em 2 minutos:

1. **Projeção Financeira:** Ticket médio recomendado e quantidade de vendas necessárias para atingir a meta de faturamento.
2. **Raio-X do Comprador (Persona):**
   - *Quem é:* Perfil exato do seguidor comprador.
   - *A Dor:* O problema urgente que a sua oferta resolve.
   - *A Objeção:* O motivo que o faria hesitar e como quebrar essa objeção.
3. **A Oferta (Big Idea):** Promessa principal e formato escolhido pelo criador (PDF, Link, Pré-Venda).
4. **Roteiro Prático (Stories):** 3 opções de ganchos (3 segundos) e scripts curtos para o criador ler, gravar nos Stories e colar o link de vendas.

---

## 🌐 Roadmap & Infraestrutura Futura

> **Decisão de Arquitetura para Escala:**
> Na fase pós-MVP, a infraestrutura da plataforma será migrada para a stack serverless de ultra-baixa latência:
>
> - **Supabase**: PostgreSQL gerenciado para banco de dados 1:1, Supabase Storage (CDN global) para hospedar os arquivos enviados pelos criadores na Etapa 4, e Webhooks nativos para confirmação instantânea de Pix.
> - **Cloudflare Pages & Workers**: Hospedagem Edge das aplicações Next.js (`platform` e `checkout`) para entrega sub-50ms no Brasil inteiro com custo de escala próximo de zero.