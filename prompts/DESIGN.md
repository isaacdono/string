# Diretrizes de UX/UI - ByteMedia MVP

## 1. Princípios Gerais
- **Fricção Zero:** Nenhuma tela de login. Navegação baseada em links diretos.
- **Mobile-First Absoluto:** 99% dos compradores virão do Instagram/TikTok. Interface desenhada para a proporção vertical (estilo Stories).
- **Feedback Constante:** Microinterações e loaders claros durante chamadas de IA e integrações financeiras.

## 2. Plataforma B2B (Visão do Criador)
- **Visual:** Institucional, minimalista, paleta neutra (Preto/Branco/Cinza).
- **Home:** Sem menus complexos. Apenas um input grande (Hero section) para digitar o `@handle` e o botão de ação.
- **Loading State:** Mensagens em steps para reduzir ansiedade ("Lendo perfil...", "Gerando copy...", "Criando checkout...").
- **Dashboard de Sucesso:** Interface limpa entregando apenas o link público do drop e o botão de download do PDF (Blueprint).

## 3. Drop Engine B2C (Página de Vendas)
- **Injeção de Identidade:** Uso de CSS Variables (`--color-primary`, `--color-bg`) injetadas dinamicamente via JSON para clonar a paleta do criador.
- **Estrutura da Página (Top-Down):**
  1. **Header:** Avatar circular e `@handle`.
  2. **Hero:** Imagem do produto + Título da oferta.
  3. **Escassez (Gatilho):** Cronômetro regressivo (Físico/Drop) ou Barra de Vagas Restantes (Digital).
  4. **Descrição:** Bullets diretos com benefícios.
  5. **Prova Social:** Elementos visuais que imitam balões de comentários reais do Instagram.
  6. **Sticky CTA:** Botão de "Comprar" fixo no rodapé, sempre visível durante o scroll.

## 4. UX do Checkout e PIX
- **Modal Integrado:** O clique de compra abre um "Bottom Sheet" (sobe da borda inferior) sem sair da página.
- **Formulário Enxuto:** Nome, E-mail e CPF. Auto-formatação (máscaras) no CPF.
- **Tela de Pagamento:** QR Code centralizado e botão largo de "Copiar Código PIX".
- **Confirmação Seamless:** Quando o webhook confirma o pagamento, o QR Code é trocado imediatamente por um "Check Verde" (Pagamento Aprovado) sem recarregar o navegador.