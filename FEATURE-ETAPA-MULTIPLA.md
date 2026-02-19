# Feature: Etapa Múltipla

**Status:** 📋 Backlog (aguardando aprovação do MVP)  
**Versão alvo:** v1.5 ou v2.0  
**Complexidade:** ⭐⭐⭐ (Média-Alta)  
**Valor UX:** ⭐⭐⭐⭐⭐

## 🎯 Objetivo

Permitir que um único card **Etapa** processe múltiplas origens de forma independente, mantendo rastreabilidade visual através de sincronização de cores.

## 📊 Comportamento

### **Modo Único (atual)**
```
N0 (3) ──┐
         ├─► [Etapa +2] ──► [Resultado: 11]
N1 (6) ──┘

Lógica: (3+6) + 2 = 11
```

### **Modo Múltipla (novo)**
```
N0 (3) ──(azul)──► [Etapa +2] ──(azul)──► [N3: 5]
                   (Múltipla)
N1 (6) ──(verde)─►            ──(verde)─► [N4: 8]

Lógica:
- 3 + 2 = 5 (fluxo azul)
- 6 + 2 = 8 (fluxo verde)
```

## 🎨 Design Visual

### **Card Etapa em modo Múltipla:**
- **Badge** com texto "Múltipla"
- **Borda serrilhada** (`border-style: dashed`)
- **Handles únicos** (1 entrada, 1 saída)
- **Label interno** mostrando mapeamento de cores

### **Sincronização de cores:**
```
┌─────────────┐           ┌──────────────┐           ┌─────────────┐
│ 🏦 Origem   │  (azul)   │ 🔄 Etapa +2  │  (azul)   │ 🎯 Result.  │
│             │─────────► │              │─────────► │             │
│  [3]        │           │  Múltipla    │           │  [5]        │
└─────────────┘           │              │           │ 🔗 N0       │
   (azul)                 │  1️⃣ 3 → 5    │           └─────────────┘
                          │  2️⃣ 6 → 8    │              (azul)
┌─────────────┐           │              │           ┌─────────────┐
│ 🏦 Origem   │  (verde)  │              │  (verde)  │ 🎯 Result.  │
│             │─────────► │              │─────────► │             │
│  [6]        │           └──────────────┘           │  [8]        │
└─────────────┘              (serrilhado)            │ 🔗 N1       │
   (verde)                                           └─────────────┘
                                                        (verde)
```

## 🔧 Implementação Técnica

### **1. Estado do card Etapa:**
```typescript
interface GraphNode {
  // ... campos existentes
  isMultiple?: boolean
  colorMap?: Record<string, string> // { 'N0': '#3b82f6', 'N1': '#22c55e' }
}
```

### **2. Rastreamento de fluxo nos edges:**
```typescript
interface GraphEdge {
  // ... campos existentes
  flowId?: string      // identifica caminho origem→resultado
  pathColor?: string   // cor do fluxo
}
```

### **3. Store global de cores:**
```typescript
interface State {
  // ... campos existentes
  colorMapping: Record<string, string> // mapeamento nodeId → cor
  assignColor: (nodeId: string) => string
  clearColors: (etapaId: string) => void
}
```

### **4. Paleta de cores (máx 6):**
```typescript
const FLOW_COLORS = [
  '#3b82f6', // azul
  '#22c55e', // verde
  '#f97316', // laranja
  '#a855f7', // roxo
  '#ec4899', // rosa
  '#14b8a6', // teal
]
```

### **5. Ativação automática:**
```typescript
// Ao detectar 2+ origens conectadas à etapa:
- Ativa isMultiple = true automaticamente
- Atribui cores sequencialmente
- Propaga cores para edges e resultados
- Limita conexões a 6 origens (warning se tentar 7ª)
```

### **6. Lógica de cálculo:**
```typescript
// Em calcGraph():
if (node.type === 'etapa' && node.isMultiple) {
  // Para cada entrada, calcular saída independente
  inputs.forEach((input, index) => {
    const sourceId = input.sourceId
    const outputEdge = edges.find(e => 
      e.sourceId === nodeId && 
      e.flowId === input.flowId
    )
    if (outputEdge) {
      const targetId = outputEdge.targetId
      result[targetId] = applyOperation(
        input.value, 
        node.operation, 
        node.value
      )
    }
  })
} else {
  // Lógica atual (soma inputs)
}
```

## 🎯 Regras de negócio

1. **Ativação automática:** 2+ origens = modo múltipla
2. **Desativação automática:** volta a 1 origem = modo único
3. **Limite:** máximo 6 origens (6 cores distintas)
4. **Rastreabilidade:** badge no resultado mostra origem
5. **Cores persistem:** salvas no JSON do projeto

## ✅ Validações

- ❌ Bloquear 7ª conexão de origem
- ✅ Avisar usuário sobre limite
- ✅ Permitir remover origem para liberar slot
- ✅ Cores reatribuídas se origem for desconectada

## 🎨 Melhorias UX opcionais

### **Hover destaca caminho:**
```typescript
// Ao fazer hover em origem azul:
- Origem: borda mais grossa
- Edge: strokeWidth maior
- Etapa: destaca linha correspondente
- Resultado: borda mais grossa
```

### **Animação de fluxo:**
```css
/* Partículas coloridas percorrendo o edge */
@keyframes flow {
  from { stroke-dashoffset: 0; }
  to { stroke-dashoffset: -20; }
}
```

## 📋 Checklist de implementação

Quando implementar "Etapa Múltipla":

- [ ] Adicionar `isMultiple` e `colorMap` ao GraphNode
- [ ] Adicionar `flowId` e `pathColor` ao GraphEdge
- [ ] Criar `colorMapping` no store
- [ ] Implementar lógica de detecção (2+ origens)
- [ ] Implementar atribuição automática de cores
- [ ] Atualizar `calcGraph()` para processar múltiplos fluxos
- [ ] Estilizar card Etapa (badge + borda serrilhada)
- [ ] Propagar cores para Origem e Resultado
- [ ] Adicionar badge "🔗 Origem: N0" nos resultados
- [ ] Limitar conexões a 6 origens
- [ ] Atualizar JSON de save/load para incluir cores
- [ ] Testar cenários: 2, 3, 4, 5, 6 origens
- [ ] Testar desconexão e reconexão (cores corretas)
- [ ] Documentar no README

## 🚀 Como ativar no futuro

Simplesmente diga:
> "Implemente a feature **Etapa Múltipla**"

Todo o contexto e raciocínio está preservado neste documento.

---

**Data de criação:** 2026-02-15  
**Última atualização:** 2026-02-15  
**Autor:** Documentado durante desenvolvimento do MVP
