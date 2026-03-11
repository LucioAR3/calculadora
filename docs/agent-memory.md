# agent-memory (só agente; atualizar conforme contexto)

## mapa
numeros padrão BR: src/utils/numbers.ts to2Decimals, formatDecimalBR, parseDecimalBR, formatDisplayBR. Decimal vírgula, milhares ponto (0,50 | 1.000,00 | 1.000.000). store calcGraph/updateNode to2Decimals; Card input e display formatDecimalBR/parseDecimalBR. Diretriz: docs/padrao-numerico-br.md.
menu projeto: TopMenu.tsx | handleSave handleOpen handleFileChange fileInputRef; resumo "X cards • Y conexões • Z fluxos" (fluxos = nós tipo resultado); botão menu aria-label. ConfirmModal role=dialog aria-modal aria-labelledby.
menu card ⋮: Card.tsx | menuOpen duplicateNode; etapa badge "Nª etapa" via getStageOrderMap. removeNode removeAllInputs removeAllOutputs openConfirmModal; etapa toggle Múltiplo borda dashed isMultiple. Um único CTA "Adicionar" em todos os cards: abre dropdown abaixo; ordem fixa Origem, Etapa, Result. Etapa com Múltiplo ativo: dropdown só mostra Result; limite de resultados = quantidade de origens (até 9); Result desabilitado quando no limite.
salvar/abrir: TopMenu handleSave handleOpen handleFileChange; store loadFlow (feature salvar mantida). Tabela do fluxo: BottomToolbar ícone tabela; TabelaPanel canto inferior esquerdo; store getFlowTableRows() retorna { headers, rows }. Regra unificada: 1 linha = 1 fluxo; colunas = nomenclaturas (Origem, 1ª etapa, …, Resultado). Coleta fluxos multi (etapa múltipla) depois lineares (getFormulaChain); normaliza por maxCols (pad null); headers = labels do fluxo mais longo.
store: store.ts | getFormula: fórmula do resultado lista todos os cards do fluxo por ID (ex.: n6 + n7 + n8 para Origem→Etapa→Etapa→Resultado); só IDs, nunca valor numérico. getPositionForNewFlow() (0,0 se vazio; senão maxX+380, minY); calcGraph; nodes edges values getStageOrderMap addOrigemFromResult (ordem etapas 1ª 2ª 3ª) confirmModal flashMessage setFlashMessage addNode updateNode removeNode addEdge removeEdge addEtapa addResultado loadFlow duplicateNode calc reconnectEdge calcGraph topoSort evalWithPrecedence getLinearChain; etapa múltipla: isMultiple flowId addEdge flowId limite N resultados. addEdge: ao bloquear 3ª conexão em etapa (não múltipla) setFlashMessage com texto UX; etapa múltipla 9 origens idem. FlashMessage.tsx exibe toast role=alert, auto-dismiss 6s, clique fecha.
arestas: CustomEdge.tsx data.operation → cor por op; Whiteboard.tsx flowEdges data.operation; onConnect onReconnect
tipos: types.ts GraphNode GraphEdge NodeType ('origem'|'etapa'|'resultado') Operation evalPrecedence
modal confirmar: ConfirmModal.tsx store confirmModal openConfirmModal closeConfirmModal removeFlow
salvar/abrir json: TopMenu handleSave handleOpen handleFileChange; store loadFlow
duplicar card: store duplicateNode(nodeId); Card.tsx botão menu

## decisões
resultado = confirmação =. whiteboard pipeline (valor último nó). calculadora precedência (evalPrecedence true). após = cria Resultado ligado última Etapa sem nova Etapa. GraphNode.evalPrecedence em store calcGraph.
ordem etapas: docs/regra-ordem-etapas.md. origem=0; etapa = 1+max(ordem entradas). Card exibe "1ª etapa", "2ª etapa". getStageOrderMap(nodes,edges) em store.
etapa 2 entradas: Card mostra "2ª entrada" + valor do outro card (values[secondSourceId]); não exibir node.value quando há 2 inputs (evita ÷0/+0). store calcGraph: com 2 entradas e !isMultiple só 1ª entrada no cálculo (input2 = node.value); getFormula idem (id1 op val). Origem 2ª entrada etapa !isMultiple: Card isDormantOrigin → origem desativada (readOnly, botões disabled, hint "Inativa — ative Múltiplo na Etapa"); ao ativar Múltiplo volta ativa.
Feature Etapa Múltipla: docs/feature-etapa-multipla.md GraphNode.isMultiple; GraphEdge.flowId. store calcGraph: etapa isMultiple → apply(op, origem_i, node.value) por edge de saída (flowId ou ordem); addEdge: etapa múltipla até 9 origens e até 9 resultados (max resultados = min(origens, 9)). Card: canAddMoreResults considera limite 9. Card: toggle Múltiplo (etapa, 2+ entradas), borda dashed quando isMultiple, botão Result. desabilitado se resultados >= origens. Etapa 2 entradas sem isMultiple = binária (2→1).

## regras agente
save: usuário pedir salvar → acrescentar em agent-memory (formato denso). pesquisar: antes de buscar no código consultar mapa; achar algo novo → acrescentar mapa. formato: otimizado para agente não para leitura usuário.
teste: após rodar com sucesso → remover arquivo(s) de teste. teste é teste, não faz parte da estrutura do projeto.
