# Análise: lógica, clareza visual e evolução para mercado financeiro

**Objetivo:** Compilar as análises de fluxos (spray + Recursos/Capital final), definir a lógica mais eficaz e compreensível, e documentar direção para digitalização de processo de trabalho e evolução para uso financeiro.  
**Escopo:** Apenas análise e documentação; nenhuma alteração de código.

---

## 1. Síntese das duas análises de fluxo

### 1.1 Fluxo spray (exemplo-spray.json)

| Achado | Descrição |
|--------|-----------|
| Fórmula ≠ valor | Um Resultado mostrava fórmula "n1 + 150" e valor 550; gera dúvida se o cálculo é n1+150 ou valor do nó anterior. |
| Fórmula ausente | Cards de Resultado (ex.: 20 sob Custo por spray, 550 final) sem fórmula acima do valor. |
| Redundância | Dois Resultados finais com 550, mesma origem (Capital final). |
| Positivo | Cálculos intermediários corretos; fluxo linear (colunas) ajuda leitura. |

### 1.2 Fluxo Recursos / Capital final / Resultado

| Achado | Descrição |
|--------|-----------|
| "Recursos" 400 vs 200 | Com 2 entradas (Capital 1000 + outro 600), o app usa a 2ª entrada como operando: 1000−600=400. O valor digitado no impacto (-800) não é usado; falta clareza. |
| "Custo por spray" 20 | 800÷30 ≈ 26,67; 20 sugere 600÷30 — valor do card ou ordem dos operandos inconsistente. |
| Capital final 300 | No modo Múltiplo (400+150 e 150+150), um resultado é 550 e outro 300; qual valor o card da etapa exibe precisa ser inequívoco. |
| Resultado com 2 entradas | App usa só a **primeira** fonte; usuário pode esperar **soma** (300+150=450). Comportamento atual não é óbvio. |

---

## 2. Princípios: digital imita realidade, matemática dá lógica

- **Digitalização do processo humano:** O fluxo no app deve refletir o que uma pessoa faz no papel ou na planilha: entradas → operações → resultados, com cada passo identificável e auditável.
- **Matemática como base:** As quatro operações (+, −, ×, ÷) e a ordem dos operandos devem ser determinísticas e visíveis. Fórmula exibida = cálculo aplicado.
- **Adaptação e evolução:** O modelo deve servir tanto a problemas genéricos (spray, custos, receita) quanto a cenários financeiros (entradas/saídas, fluxos de caixa, múltiplas contas).

Consequências para esta versão:

- **Uma operação por etapa:** Cada card Etapa = uma operação bem definida (A op B), com A e B identificados (origem, 2ª entrada ou valor fixo).
- **Resultado = valor bem definido:** Todo Resultado deve ter origem única e clara (um nó fonte ou uma fórmula explícita), e a fórmula deve ser sempre exibida quando existir.
- **Dois modos de etapa com 2 entradas:** (1) **Binário:** uma operação sobre duas origens → um resultado (ex.: custo ÷ quantidade). (2) **Múltiplo:** mesma operação aplicada a cada origem → um resultado por origem. A UI deve deixar explícito qual modo está ativo e o que está sendo usado como operando (valor digitado vs 2ª entrada).

---

## 3. Lógica mais eficaz e compreensível (proposta)

### 3.1 Etapa com 1 entrada

- **Operação:** `valor_origem op valor_card` (valor do card = "impacto" digitado).
- **Visual:** Mostrar claramente "IMPACTO" e o valor usado (ex.: + 50, − 800, ÷ 30). Sem ambiguidade.

### 3.2 Etapa com 2 entradas (modo binário)

- **Operação:** `valor_1ª_entrada op valor_2ª_entrada`. O valor do card (impacto digitado) **não** entra no cálculo.
- **Visual:** Mostrar "1ª entrada" e "2ª entrada" (ou equivalentes) com os valores vindos dos cards, não um número solto que pareça "impacto". Evitar que o usuário digite 800 e o sistema use 600 da 2ª entrada sem aviso.

### 3.3 Etapa com 2+ entradas (modo múltiplo)

- **Operação:** Para cada origem i: `valor_origem_i op valor_card` → resultado i. N resultados, um por origem.
- **Visual:** Borda serrilhada, "N entradas", e indicador do valor do card usado em todos. Cada Resultado exibe fórmula da forma "origem_id op valor".

### 3.4 Card Resultado

- **Fonte única (1 entrada):** Valor = valor do nó fonte (pipeline) ou expressão com precedência (calculadora). **Sempre** exibir a fórmula quando for derivável (cadeia linear, etapa múltipla com flowId).
- **Duas entradas:** Hoje = valor da primeira fonte. Para ser compreensível: ou (A) proibir/desencorajar 2 entradas em Resultado, ou (B) definir regra explícita (ex.: "sempre soma quando 2 entradas" e mostrar "n1 + n2"). Documentar e refletir na UI.

### 3.5 Consistência numérica

- Ordem dos operandos fixa e documentada (ex.: divisão = primeiro edge ÷ segundo edge; subtração = primeiro − segundo).
- Valores usados no cálculo = sempre os do store no momento do calc (sem valor "pendente" ou desatualizado na tela).

---

## 4. Direção para mercado financeiro: entrada vs saída

### 4.1 Entrada e saída são relativos ao ponto de vista

- **Minha saída = entrada de outro.** Ex.: se eu tenho saída de 500, do outro lado (pessoa ou empresa) há entrada de 500. O mesmo valor monetário é saída num contexto e entrada no outro.
- **Ao usar os termos "entrada" e "saída" no produto, isso precisa ficar explícito:** sempre em relação a **quem** (qual conta, qual ente, qual perspectiva). Caso contrário, o usuário pode confundir ou interpretar de forma absoluta o que é relativo.

### 4.2 Operações são neutras em relação a entrada/saída

- **Uma operação que no projeto consideramos "verde" (ex.: soma) pode estar atuando sobre fluxos de saída (vermelho).** Ex.: tenho saída em juros de X; posso **somar** mais juros ou **multiplicar** (juros sobre juros). A operação é soma ou multiplicação, mas o fluxo é saída — ou seja, o "verde" da operação está trabalhando em um fluxo "vermelho" de saída.
- **Conclusão:** cor/semântica (entrada = verde, saída = vermelho) indica a **natureza do fluxo** (para quem é entrada, para quem é saída). A **operação** (+, −, ×, ÷) é independente: pode ser aplicada a entradas ou a saídas. Ao documentar ou implementar "entrada" e "saída", deixar claro: (1) perspectiva (de quem); (2) operação e cor são conceitos separados.

### 4.3 Conceito operacional

- **Entrada (↑, verde):** fluxo que entra no ponto de vista escolhido (receita, aporte, ganho).
- **Saída (↓, vermelho):** fluxo que sai no ponto de vista escolhido (custo, despesa, retirada).

Em matemática e em fluxo de caixa, **ambos** podem usar qualquer uma das 4 operações:

- Soma de entradas: várias receitas → total receita (verde).
- Soma de saídas: várias despesas ou juros → total (vermelho).
- Subtração, multiplicação, divisão: em entradas ou em saídas (ex.: juros somados, multiplicados, descontos, reembolsos).

Ou seja: **cor/semântica (entrada/saída) não fixa a operação;** a operação é escolhida pelo usuário; a cor indica a natureza do fluxo no ponto de vista adotado.

### 4.4 Implicações para esta versão (base lógica)

- Manter as **quatro operações** em qualquer card Etapa, independente de depois classificarmos o fluxo como entrada ou saída.
- Garantir que a **fórmula e o valor** sejam sempre coerentes e visíveis, para que mais tarde possamos:
  - Associar um tipo (entrada/saída) ao nó ou à aresta.
  - Aplicar convenção visual (↑ verde, ↓ vermelho) sem mudar a matemática.

### 4.5 Evolução futura (sem implementar agora)

- Tipos de nó ou de aresta: **entrada** vs **saída** (além de origem/etapa/resultado).
- Paleta: verde para entrada, vermelho para saída (setas ↑/↓ opcionais).
- Agregações: "Total entradas", "Total saídas", "Saldo" (entradas − saídas) como padrões de fluxo reutilizáveis.
- Relatórios/export: linhas de fluxo de caixa a partir do grafo.

---

## 5. Resumo executivo

| Tema | Conclusão |
|------|-----------|
| **Análises compiladas** | Spray: fórmula ausente/incorreta em Resultados, redundância. Recursos/Capital: confusão 1 vs 2 entradas, valor do card vs 2ª entrada, Resultado com 2 entradas não soma. |
| **Lógica proposta** | 1 entrada → origem op valor_card. 2 entradas binário → 1ª op 2ª (valor do card não usado). 2+ entradas múltiplo → cada origem op valor_card → N resultados. Resultado: sempre exibir fórmula; definir regra clara para 2 entradas (uma fonte vs soma). |
| **Digital = realidade** | Fluxo legível, ordem de operandos fixa, fórmula = cálculo aplicado, sem valores "fantasmas". |
| **Evolução financeira** | Entrada/saída são **relativos ao ponto de vista** (minha saída = entrada de outro). Operações são **neutras**: verde (ex. soma) pode atuar em fluxo vermelho (saída, ex. juros). Cor = natureza do fluxo; operação = independente. Deixar isso explícito ao trabalhar com "entrada" e "saída". |
| **Próximo passo** | Aplicar na codebase: (1) fórmula sempre que possível; (2) UI que deixe explícito "2ª entrada" vs "meu valor" na etapa; (3) regra e rótulo para Resultado com 2 entradas; (4) consistência de operandos e atualização de valores. |

---

*Documento apenas analítico; nenhuma alteração de código foi feita. Serve como base para decisões de produto e implementação.*
