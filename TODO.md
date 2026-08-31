# TODO (ByteMedia Drop Platform) 🚀

## 🟢 Concluído (Done)
- [x] **Busca DuckDuckGo (Lite POST)**: Corrigido bloqueio anti-bot; busca de contexto público de criadores via DDG Lite operacional.
- [x] **Refatoração do Checkout B2C**: Removido avatar clichê de IA, contador estático 00:00:00 e badges falsos. Implementado timer real de 15min persistido por sessão.
- [x] **Responsividade Mobile**: Menu hambúrguer na navbar, grid responsivo, tipografia fluida e prevenção de scroll horizontal (`overflow-x: hidden`).
- [x] **Badge de Formato do Produto**: Landing de checkout agora exibe o formato do produto (E-book em PDF, Grupo VIP, Mentoria, etc.) com ícones dinâmicos.
- [x] **Renomeação de Blueprint para Dossiê**: Nomenclatura no PDF, UI e páginas alterada para "Dossiê de Lançamento" (nomenclatura executiva amigável a criadores).
- [x] **Alinhamento do System Prompt da IA**: Prompt ajustado para atuar como Especialista de Produto & Copywriting, criando infoprodutos do criador (não acesso a celebridades).
- [x] **Especificação do Fluxo Wizard do Creator**: Mapeamento completo no `prompts/CREATOR_WIZARD_FLOW.md` (6 etapas, rotas, copies, pré-venda flexível, repasse Pix e design de doodles Y2K/Stories).

## 🎯 Prioridade Atual (Creator Wizard — B2B)
- [ ] **Etapa 3 — Escolha da Oferta (`app/product/[id]/page.tsx`)**:
  - Exibir os 3 cards de produtos/ofertas sugeridos pela IA a partir de `copy_data.alternative_products`.
  - Permitir edição de Título, Preço e Escassez/Urgência.
  - Inserir projeção estimada de faturamento no topo.
- [ ] **Etapa 4 — Configuração da Entrega (`app/delivery/[id]/page.tsx`)**:
  - Área de upload de arquivos (PDF/planilhas) ou input de URL (WhatsApp/Telegram/Calendly).
  - Implementar o **Modo Pré-Venda Flexível** (com prazo customizável de entrega) e o **Modo Rascunho/Teste**.
  - Exibir callout de paz de espírito para o criador lançar no seu ritmo.
- [ ] **Etapa 5 — Conexão da Chave Pix (`app/pix/[id]/page.tsx`)**:
  - Input com seletor de tipo (CPF, E-mail, Telefone, Chave Aleatória) e validação em tempo real.
  - Salvar chave no banco vinculada à campanha para repasse via PIX Out / Webhook.
- [ ] **Refatoração da Etapa 6 (`app/success/[id]/page.tsx`)**:
  - Exibir botão gigante de copiar link, card de download do Dossiê PDF e opção "Editar Oferta/Pix".
- [ ] **Barra de Progresso (Passos 1 a 5)**:
  - Criar componente reutilizável `WizardProgressBar.tsx` para o topo das telas pós-entrada.

## ⚙️ Backend & Integrações
- [ ] **Endpoint de Atualização (`PUT /api/platform/campaign/{id}`)**:
  - Permitir que o wizard atualize título, preço, formato, escassez, chave Pix e status da campanha em cada passo.
- [ ] **Validação de Chave Pix & Repasse**:
  - Conectar webhook de confirmação de pagamento para disparar PIX Out automático para a chave do criador.
- [ ] **Serviço de E-mail para Compradores**:
  - Disparar e-mail com o link do produto/instruções assim que o PIX for aprovado.

## 🔮 Roadmap de Infraestrutura (Postergado/v2)
- [ ] **Migração para Supabase**: PostgreSQL gerenciado, Supabase Storage (CDN global de PDFs) e Webhooks nativos.
- [ ] **Migração para Cloudflare Pages & Workers**: Deploy Edge de alta performance para os apps Next.js (`platform` e `checkout`).