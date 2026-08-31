# ByteMedia — Fluxo Wizard do Creator (B2B)

> **Princípio de design:** o menor número de telas possível, sem jargão técnico, sem surpresas.
> O creator nunca deve sentir que está em um dashboard de TI. Ele está lançando um produto.

---

## Barra de Progresso

Presente no topo de todas as etapas pós-handle. Sempre visível, sempre honesta sobre onde o creator está.

```
Passo 1 de 5  ●━━━━━━━━○━━━━━━━━○━━━━━━━━○━━━━━━━━○
              Analisando   Produto   Entrega   Receber   Lançar
```

---

## Etapa 1 — Handle (Entrada)
**Tela:** `frontend/platform/app/page.tsx`
**Status atual:** ✅ Implementada

O creator digita o `@handle` e opcionalmente descreve a ideia do produto.
Sem login, sem cadastro. Zero fricção.

---

## Etapa 2 — Análise (Processamento automático)
**Tela:** `frontend/platform/app/processing/page.tsx`
**Status atual:** ✅ Implementada

O sistema analisa o perfil publicamente disponível e estrutura a oferta com IA.
O creator aguarda. Nenhuma ação necessária.

---

## Etapa 3 — Escolha do Produto
**Tela:** `frontend/platform/app/product/[campaign_id]/page.tsx`
**Status atual:** ❌ Não existe — precisa ser criada

A IA apresenta **3 sugestões de produto** baseadas no nicho do creator.
Cada card mostra: nome do produto, descrição curta, preço sugerido, tipo (PDF, link, mentoria...).

O creator escolhe uma **ou** descreve a própria ideia num campo livre.
Pode editar nome e preço antes de avançar.

**CTA:** "Esse é meu produto →"

---

## Etapa 4 — Entrega do Produto
**Tela:** `frontend/platform/app/delivery/[campaign_id]/page.tsx`
**Status atual:** ❌ Não existe — precisa ser criada

### Por tipo de produto:

| Tipo | O que o creator faz | O que o sistema faz após a compra |
|------|---------------------|-----------------------------------|
| PDF / E-book | Faz upload do arquivo | Envia link de download por email ao comprador |
| Planilha / Template | Faz upload do arquivo | Envia link de download por email ao comprador |
| Acesso a comunidade (WhatsApp / Telegram) | Cola o link do grupo | Envia o link por email ao comprador |
| Mentoria / Agendamento | Cola o link do Calendly | Envia o link por email ao comprador |

O seletor de tipo usa ícones grandes e linguagem direta, não termos técnicos.
Exemplo: "Quero vender um PDF" / "Quero vender acesso a um grupo" / "Quero vender uma mentoria".

**Definições finais confirmadas aqui:**
- Número de vagas disponíveis (escassez)
- Preço (último ajuste)

**CTA:** "Configurar como receber →"

---

## Etapa 5 — Como Receber (Chave Pix)
**Tela:** `frontend/platform/app/pix/[campaign_id]/page.tsx`
**Status atual:** ❌ Não existe — precisa ser criada

### O que o creator vê:

```
Qual é a sua chave Pix para receber as vendas?

[ CPF / E-mail / Telefone / Chave aleatória ]

┌──────────────────────────────────────┐
│  Cole aqui sua chave Pix             │
└──────────────────────────────────────┘

Você receberá os valores das vendas diretamente
nessa chave após cada confirmação de pagamento.
```

Sem mencionar token, API, Mercado Pago ou qualquer termo técnico.
A chave Pix é salva no banco vinculada à campanha.

> **Decisão de arquitetura (MVP):**
> Os pagamentos são coletados pela conta ByteMedia no Mercado Pago.
> A transferência ao creator via Pix acontece automaticamente (webhook confirmado → PIX Out para a chave cadastrada) ou manualmente no MVP inicial.
> O creator não precisa ter nem saber o que é Mercado Pago.

**CTA:** "Lançar meu Drop →"

---

## Etapa 6 — Lançamento 🚀
**Tela:** `frontend/platform/app/success/[campaign_id]/page.tsx`
**Status atual:** ⚠️ Parcialmente implementada

O creator vê a confirmação de que o Drop está ao ar.

**Elementos da tela:**
- ✅ Badge "Drop Ativo" pulsando
- Link da página de vendas (copiável com 1 clique)
- Download do Blueprint PDF (relatório estratégico)
- Templates prontos de copy para Stories / bio do Instagram

**Métricas futuras (pós-MVP):**
- Visualizações em tempo real
- Cliques no botão de compra
- Conversões confirmadas

---

## Fluxo Completo

```
[Creator]
    │
    ▼
① Handle → ② Análise (auto) → ③ Produto → ④ Entrega → ⑤ Chave Pix → ⑥ Lançamento
                                                                            │
                                                                            ▼
                                                                    [Drop ao vivo]
                                                                            │
[Comprador]                                                                 │
    │                                                                       │
    └──────────── Acessa página de vendas ──────────────────────────────────┘
                        │
                        ▼
                  Paga via Mercado Pago
                        │
                        ▼
                  Webhook confirma
                        │
              ┌─────────┴─────────┐
              ▼                   ▼
    Email ao comprador      Pix ao creator
    com produto             com valor da venda
```

---

## O que está implementado vs. o que falta

| Etapa | Tela | Status |
|-------|------|--------|
| 1 — Handle | `app/page.tsx` | ✅ Pronto |
| 2 — Análise | `app/processing/` | ✅ Pronto |
| 3 — Escolha do Produto | `app/product/[id]/` | ❌ Criar |
| 4 — Entrega do Produto | `app/delivery/[id]/` | ❌ Criar |
| 5 — Chave Pix | `app/pix/[id]/` | ❌ Criar |
| 6 — Lançamento | `app/success/[id]/` | ⚠️ Refatorar |
| Entrega ao comprador | webhook → email | ❌ Implementar |
| Repasse ao creator | webhook → Pix Out | ❌ Implementar |

---

## Tipos de produto suportados no MVP

- ✅ PDF / E-book (upload)
- ✅ Planilha / Template (upload)
- ✅ Link de grupo — WhatsApp, Telegram, Discord
- ✅ Link de agendamento — Calendly, Google Agenda
- ❌ Curso com área de membros — Fase 2
- ❌ Produto físico — Fase 2
