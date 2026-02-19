# agent-memory (só agente; atualizar conforme contexto)

## mapa
menu projeto: TopMenu.tsx | handleSave handleOpen handleFileChange fileInputRef
menu card ⋮: Card.tsx | menuOpen duplicateNode removeNode removeAllInputs removeAllOutputs openConfirmModal + Etapa → Result.
calculadora: Calculator.tsx | display currentCardId operator waitingSecondValue firstValue calculationDisplay handleDigit handleOperator handleEquals handleClear handleDecimal handleBackspace isEditing addResultado(,{evalPrecedence:true})
abrir calc: BottomToolbar.tsx onOpenCalc; App.tsx calcOpen Calculator
store: store.ts | nodes edges values confirmModal addNode updateNode removeNode addEdge removeEdge addEtapa addResultado loadFlow duplicateNode calc reconnectEdge calcGraph topoSort evalWithPrecedence getLinearChain
arestas visual: CustomEdge.tsx data.operation
arestas dados: Whiteboard.tsx flowEdges nodes[e.targetId]?.operation ?? e.operation onConnect onReconnect
tipos: types.ts GraphNode GraphEdge NodeType Operation evalPrecedence
modal confirmar: ConfirmModal.tsx store confirmModal openConfirmModal closeConfirmModal removeFlow
salvar/abrir json: TopMenu handleSave handleOpen handleFileChange; store loadFlow
duplicar card: store duplicateNode(nodeId); Card.tsx botão menu

## decisões
resultado = confirmação =. whiteboard pipeline (valor último nó). calculadora precedência (evalPrecedence true). após = cria Resultado ligado última Etapa sem nova Etapa. GraphNode.evalPrecedence em store calcGraph.

## regras agente
save: usuário pedir salvar → acrescentar em agent-memory (formato denso). pesquisar: antes de buscar no código consultar mapa; achar algo novo → acrescentar mapa. formato: otimizado para agente não para leitura usuário.
