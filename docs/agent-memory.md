# agent-memory (só agente; atualizar conforme contexto)

## mapa
menu projeto: TopMenu.tsx | handleSave handleOpen handleFileChange fileInputRef
menu card ⋮: Card.tsx | menuOpen duplicateNode; etapa badge "Nª etapa" via getStageOrderMap. Card resultado: gera Etapa ou Origem (addOrigemFromResult), não gera outro Resultado. removeNode removeAllInputs removeAllOutputs openConfirmModal + Etapa → Result.; etapa toggle Múltiplo borda dashed isMultiple
calculadora: Calculator.tsx | display currentCardId operator waitingSecondValue firstValue calculationDisplay handleDigit handleOperator handleEquals handleClear handleDecimal handleBackspace isEditing addResultado(,{evalPrecedence:true})
abrir calc: BottomToolbar.tsx onOpenCalc; App.tsx calcOpen Calculator
store: store.ts | nodes edges values getStageOrderMap addOrigemFromResult (ordem etapas 1ª 2ª 3ª) confirmModal addNode updateNode removeNode addEdge removeEdge addEtapa addResultado loadFlow duplicateNode calc reconnectEdge calcGraph topoSort evalWithPrecedence getLinearChain; etapa múltipla: isMultiple flowId addEdge flowId limite N resultados
arestas visual: CustomEdge.tsx data.operation
arestas dados: Whiteboard.tsx flowEdges nodes[e.targetId]?.operation ?? e.operation onConnect onReconnect
tipos: types.ts GraphNode GraphEdge NodeType Operation evalPrecedence
modal confirmar: ConfirmModal.tsx store confirmModal openConfirmModal closeConfirmModal removeFlow
salvar/abrir json: TopMenu handleSave handleOpen handleFileChange; store loadFlow
duplicar card: store duplicateNode(nodeId); Card.tsx botão menu

## decisões
resultado = confirmação =. whiteboard pipeline (valor último nó). calculadora precedência (evalPrecedence true). após = cria Resultado ligado última Etapa sem nova Etapa. GraphNode.evalPrecedence em store calcGraph.

ordem etapas: docs/regra-ordem-etapas.md. origem=0; etapa = 1+max(ordem entradas). Card exibe "1ª etapa", "2ª etapa". getStageOrderMap(nodes,edges) em store.
etapa 2 entradas: Card mostra "2ª entrada" + valor do outro card (values[secondSourceId]); não exibir node.value quando há 2 inputs (evita ÷0/+0). store calcGraph: input2 = inputs[1].sourceId quando 2 edges.

analise lógica/evolução: docs/analise-logica-evolucao-financeira.md | compilação 2 análises fluxo, lógica etapa/resultado, entrada/saída financeiro.
Financial Engine alinhamento: docs/financial-engine-alinhamento.md | Core Domain Calculators estrutura src/financial/; contrato mínimo juros simples; sem tocar store types UI.
Feature Etapa Múltipla: implementada. doc: docs/feature-etapa-multipla.md GraphNode.isMultiple; GraphEdge.flowId. store calcGraph: etapa isMultiple → apply(op, origem_i, node.value) por edge de saída (flowId ou ordem); addEdge: etapa múltipla até 9 origens e até 9 resultados (max resultados = min(origens, 9)). Card: canAddMoreResults considera limite 9. Card: toggle Múltiplo (etapa, 2+ entradas), borda dashed quando isMultiple, botão Result. desabilitado se resultados >= origens. Etapa 2 entradas sem isMultiple = binária (2→1).

## regras agente
save: usuário pedir salvar → acrescentar em agent-memory (formato denso). pesquisar: antes de buscar no código consultar mapa; achar algo novo → acrescentar mapa. formato: otimizado para agente não para leitura usuário.
