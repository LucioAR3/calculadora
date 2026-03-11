# Calculadora Visual — Origem → Etapa → Resultado

Aplicação web de calculadora visual interativa baseada em fluxo (Origem → Etapa → Resultado).

## 🚀 Como Usar

```bash
# Instalar dependências
npm install

# Rodar em modo desenvolvimento
npm run dev

# Build para produção
npm run build
```

Acesse: http://localhost:5173/

## 🎯 Conceito: Origem → Etapa → Resultado

### Estrutura de Fluxo
O sistema trabalha com 3 tipos de cards:

1. **🏦 Origem** — Ponto de partida
   - Card azul claro com valor inicial
   - Representa o valor base do cálculo
   - Input dinâmico (cresce com o valor)
   - Botões: "+ Origem" e "+ Add Etapa"

2. **📊 Etapa** — Transformações intermediárias
   - Cards coloridos por operação (+, -, ×, ÷)
   - Input dinâmico (cresce com o valor)
   - Aplicam operações ao valor recebido
   - Mostram impacto (↑ ganho ou ↓ perda)
   - Botões: "+ Etapa" e "→ Result." (adicionar Resultado)
   - **Etapa múltipla:** toggle "Múltiplo" para uma etapa processar várias origens (até 9), cada uma com seu resultado.

3. **🎯 Resultado** (card de destino) — Resultado final
   - Card cinza com resultado calculado
   - Atualiza automaticamente
   - Representa o valor final do fluxo

## ✨ Operações Disponíveis

### Cores Semânticas por Operação
- **🟢 Soma (+)**: Verde - ↑ 1000
- **🔴 Subtração (-)**: Vermelho - ↓ 500
- **🔵 Multiplicação (×)**: Azul - ↑ 2000
- **🟠 Divisão (÷)**: Laranja - 250

## 🎨 Funcionalidades dos Cards

### Card de Origem (🏦)
```
┌─────────────────────┐
│ 🏦 Origem           │
│ VALOR INICIAL       │
│ [   5000   ]       │
│ [+ Origem][+ Add Etapa] │
└─────────────────────┘
```
- Valor editável
- Input dinâmico (ajusta ao tamanho)
- Criar nova origem linkada
- Criar etapa de operação

### Card de Etapa (📊)
```
┌─────────────────────┐
│ 📊 Etapa            │
│ IMPACTO             │
│ [+] [  1000  ]     │
│ ↑ 6000             │
│ [+ Etapa][→ Dest.] │
└─────────────────────┘
```
- Operador editável (+, -, ×, ÷)
- Valor de impacto
- Input dinâmico (ajusta ao tamanho)
- Indicador visual (↑↓)
- Criar nova etapa
- Criar resultado final

### Card de Resultado (🎯)
```
┌─────────────────────┐
│ 🎯 Resultado        │
│                     │
│      6000          │
│                     │
└─────────────────────┘
```
- Resultado automático
- Recálculo reativo
- Display grande e claro

## 📋 Exemplo de Fluxo

### Caso: 5000 + 1000 - 500 = 5500

```
🏦 Origem      📊 Etapa (+)    📊 Etapa (-)    🎯 Resultado
  5000    →      + 1000    →     - 500     →     5500
                 ↑ 6000          ↓ 5500
```

**Passo a passo:**
1. Click "Adicionar" → Cria origem com 5000
2. Click "+ Add Etapa" → Cria etapa de soma
3. Digite "1000" → Impacto: ↑ 6000
4. Click "+ Etapa" → Nova etapa
5. Troque operador para "-"
6. Digite "500" → Impacto: ↓ 5500
7. Click "→ Result." → Resultado final: 5500

## 🎨 Inputs Dinâmicos

Todos os campos de valor (Origem e Etapa) possuem **inputs dinâmicos**:

- **Valores pequenos**: Input compacto (60px mínimo)
  - Ex: `5` → [___5___]
  
- **Valores médios**: Input ajustado
  - Ex: `1000` → [__1000__]
  
- **Valores grandes**: Input expandido (200px máximo)
  - Ex: `123456789` → [_123456789_]

### Benefícios:
- ✅ Visual limpo e organizado
- ✅ Card se adapta ao conteúdo
- ✅ Melhor uso do espaço
- ✅ Leitura mais fácil

## 🔄 Recálculo automático

Altere qualquer valor na cadeia:
- Mude origem de 5000 → 10000
- Todos os valores downstream atualizam automaticamente
- 10000 + 1000 = 11000
- 11000 - 500 = 10500

## 🛡️ Proteções do Sistema

### Motor de Cálculo
- ✅ **Sem ciclos** - Detecção automática (DFS)
- ✅ **Ordem correta** - Topological sort
- ✅ **Propagação reativa** - Atualização em cascata
- ✅ **Máximo 2 inputs** - Limite por operação
- ✅ **Múltiplas entradas** - Soma antes de operar

### Posicionamento Inteligente
- ✅ Primeira origem: Centro (0, 0)
- ✅ Novas etapas: +300px horizontal
- ✅ Ramificações: +150px vertical
- ✅ Sem sobreposição automática

## 🎨 Design Minimalista

### Visual Clean
- Bordas finas (1px)
- Conexões sutis (1.5px)
- Handles discretos (8px)
- Sombras leves
- Background pontilhado suave

### Tipografia Adaptativa
- Inputs: 18px, peso 700
- Destino: 28px, peso bold
- Labels: 10px, uppercase
- Indicadores: 16px

## 🏗️ Arquitetura

### Stack Tecnológica
- **React 18** - UI components
- **TypeScript** - Type safety
- **Vite** - Build & dev server
- **React Flow** - Canvas interativo
- **Zustand** - State management

### Estrutura de Arquivos
```
src/
├── App.tsx              # Root
├── main.tsx              # Entry + CSS React Flow
├── store.ts              # Zustand + cálculos (calcGraph, topoSort, etapa múltipla)
├── types.ts              # GraphNode, GraphEdge, Operation
├── appMode.ts            # Modo básico / financeiro
├── featureFlags.ts      # isFinancialModeEnabled
├── utils/
│   └── numbers.ts       # to2Decimals, formatDecimalOptional
└── components/
    ├── Whiteboard.tsx   # Canvas React Flow
    ├── TopMenu.tsx      # Menu superior (salvar/abrir)
    ├── BottomToolbar.tsx # Toolbar inferior (modos, calculadora, simulador)
    ├── Card.tsx         # Cards (Origem / Etapa / Resultado)
    ├── Calculator.tsx   # Calculadora com precedência
    ├── SimuladorJuros.tsx # Juros simples/compostos (modo financeiro)
    ├── ConfirmModal.tsx # Modal excluir fluxo
    ├── CustomEdge.tsx   # Arestas com operação
    └── CustomHandle.tsx # Handles dos nós
```

### Algoritmos Implementados
- **Detecção de Ciclos**: DFS com recursion stack
- **Topological Sort**: Kahn's algorithm
- **Cálculo Reativo**: Propagação downstream
- **Posicionamento**: Grid-based sem overlaps
- **Input Dinâmico**: Canvas text metrics

## ⌨️ Atalhos

| Atalho | Ação |
|--------|------|
| `Backspace/Delete` | Deletar selecionados |
| `Mouse Wheel` | Zoom (10% - 400%) |
| `Arraste canvas` | Pan/mover viewport |
| `Arraste área` | Seleção múltipla |
| `ESC` | Fechar calculadora |

## 📊 Comparação com FIDC

| Conceito FIDC | Nossa Implementação |
|---------------|---------------------|
| Conta FiDC | 🏦 Origem |
| Etapas (Imposto, Taxa, etc) | 📊 Etapa (+, -, ×, ÷) |
| Valor Líquido Final | 🎯 Resultado |
| Base de Cálculo | Topological Sort |
| Valores Monetários | Valores Numéricos |

## 🎯 Características MVP

- ✅ 4 operações básicas
- ✅ Inputs dinâmicos adaptativos
- ✅ Máximo 2 inputs por operação
- ✅ Sem loops permitidos
- ✅ Interface minimalista
- ✅ Valores numéricos simples

## 📄 Licença

MIT

---

**Inspirado em aplicações financeiras profissionais, com inputs adaptativos e interface minimalista.** 🎨✨
