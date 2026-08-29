# String - Operating System para Creators

A **String** não é uma agência de marketing, é uma **Holding de Infraestrutura Executiva**. Atuamos como o braço operacional (COO/CFO terceirizado) para grandes influenciadores, ajudando a estruturar propriedade intelectual, lançar marcas próprias (D2C) e gerenciar infoprodutos e licenciamentos B2B.

## 🚀 Sobre o Projeto da Landing Page

Este projeto contém a Landing Page oficial da String, projetada para converter criadores de conteúdo de alto escalão (Tier 1). O design segue uma linha estética "Light Mode Corporativo", mesclando elementos de alto luxo, minimalismo e comunicação direta focada em negócios, equity e operações.

### Estrutura de Negócio Apresentada:
- **Infoprodutos & Comunidades:** Estruturação tecnológica, gestão de membros e otimização de funil (LTV).
- **Produtos Físicos (D2C):** Operação "Drop" (pré-venda), manufatura inteligente sob demanda e fulfillment direto (risco zero de estoque).
- **Licenciamento B2B:** Negociação e contratos para Collabs com grandes marcas do varejo físico.

## 🛠️ Tecnologias Utilizadas
Para garantir a máxima performance, simplicidade de manutenção e facilidade de hospedagem, o projeto foi construído utilizando uma arquitetura Single-Page modular, porém sem frameworks complexos:

- **HTML5 & Vanilla JavaScript (ES Modules):** Componentização da interface sem necessidade de React ou Vue.
- **Tailwind CSS (via CDN):** Estilização rápida e responsiva.
- **CSS Customizado:** Variáveis CSS e animações exclusivas (Scroll Reveal com IntersectionObserver).

## ⚙️ Como rodar localmente
Como o projeto utiliza **ES Modules** (`<script type="module">`), ele precisa de um servidor local.

**Opção 1: Usando Python**
```bash
python3 -m http.server 8000
```
Acesse: `http://localhost:8000`

**Opção 2: Usando VS Code**
1. Instale a extensão **Live Server**.
2. Clique com o botão direito no `index.html` e selecione "Open with Live Server".
