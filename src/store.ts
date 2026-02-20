import { create } from 'zustand'
import type { GraphNode, GraphEdge, Operation } from './types'

interface State {
  nodes: Record<string, GraphNode>
  edges: GraphEdge[]
  values: Record<string, number | null>
  confirmModal: { isOpen: boolean; nodeId: string; count: number } | null
  addNode: (type: GraphNode['type'], pos?: { x: number; y: number }) => string
  updateNode: (id: string, data: Partial<GraphNode>) => void
  removeNode: (id: string) => void
  addEdge: (src: string, tgt: string, operation?: Operation) => void
  removeEdge: (id: string) => void
  removeAllInputs: (nodeId: string) => void
  removeAllOutputs: (nodeId: string) => void
  reconnectEdge: (edgeId: string, newSource: string, newTarget: string) => void
  getConnectedNodes: (nodeId: string) => string[]
  removeFlow: (nodeId: string) => void
  openConfirmModal: (nodeId: string) => void
  closeConfirmModal: () => void
  addEtapa: (sourceId: string, operation: Operation) => void
  addResultado: (sourceId: string, options?: { evalPrecedence?: boolean }) => void
  calc: () => void
  loadFlow: (data: { nodes: Record<string, GraphNode>; edges: GraphEdge[] }) => void
  duplicateNode: (nodeId: string) => string | null
  getFormula: (resultNodeId: string) => string | null
  focusNodeId: string | null
  setFocusNodeId: (id: string | null) => void
}

let nodeId = 0
let edgeId = 0

// Detecta ciclos no grafo
const hasCycle = (edges: GraphEdge[], newSrc: string, newTgt: string): boolean => {
  const graph = new Map<string, string[]>()
  
  edges.forEach(e => {
    if (!graph.has(e.sourceId)) graph.set(e.sourceId, [])
    graph.get(e.sourceId)!.push(e.targetId)
  })
  
  if (!graph.has(newSrc)) graph.set(newSrc, [])
  graph.get(newSrc)!.push(newTgt)
  
  const visited = new Set<string>()
  const recStack = new Set<string>()
  
  const dfs = (node: string): boolean => {
    visited.add(node)
    recStack.add(node)
    
    const neighbors = graph.get(node) || []
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor)) return true
      } else if (recStack.has(neighbor)) {
        return true
      }
    }
    
    recStack.delete(node)
    return false
  }
  
  for (const node of graph.keys()) {
    if (!visited.has(node)) {
      if (dfs(node)) return true
    }
  }
  
  return false
}

// Precedência científica: × e ÷ antes de + e −
const PRECEDENCE = { '+': 0, '-': 0, '×': 1, '÷': 1 } as const
type OpToken = '+' | '-' | '×' | '÷'

const evalWithPrecedence = (tokens: (number | OpToken)[]): number | null => {
  if (tokens.length === 0) return null
  if (tokens.length === 1) return typeof tokens[0] === 'number' ? tokens[0] : null

  const work = [...tokens]
  for (let prec = 1; prec >= 0; prec--) {
    let i = 1
    while (i < work.length) {
      const op = work[i]
      if (typeof op !== 'string' || PRECEDENCE[op as OpToken] !== prec) {
        i += 2
        continue
      }
      const a = work[i - 1] as number
      const b = work[i + 1] as number
      if (typeof a !== 'number' || typeof b !== 'number') {
        i += 2
        continue
      }
      let v: number
      switch (op) {
        case '×': v = a * b; break
        case '÷': v = b !== 0 ? a / b : NaN; break
        case '+': v = a + b; break
        case '-': v = a - b; break
        default: i += 2; continue
      }
      if (Number.isNaN(v)) return null
      work.splice(i - 1, 3, v)
      i = 1
    }
  }
  const result = work[0]
  return typeof result === 'number' ? result : null
}

// Cadeia linear: resultado ← etapa ← ... ← origem (sem bifurcações)
const getLinearChain = (
  resultId: string,
  nodes: Record<string, GraphNode>,
  inputsMap: Map<string, Array<{ sourceId: string; operation?: Operation }>>
): GraphNode[] | null => {
  const chain: GraphNode[] = []
  let currentId: string | null = resultId
  const visited = new Set<string>()
  while (currentId) {
    if (visited.has(currentId)) return null
    visited.add(currentId)
    const node = nodes[currentId]
    if (!node) return null
    chain.push(node)
    if (node.type === 'origem') return chain.reverse()
    const inputs: Array<{ sourceId: string; operation?: Operation }> = inputsMap.get(currentId) || []
    if (inputs.length !== 1) return null
    currentId = inputs[0].sourceId
  }
  return null
}

// Cadeia para exibir fórmula: para em outro resultado (não expande subcálculo)
const getFormulaChain = (
  resultId: string,
  nodes: Record<string, GraphNode>,
  inputsMap: Map<string, Array<{ sourceId: string; operation?: Operation }>>
): GraphNode[] | null => {
  const chain: GraphNode[] = []
  let currentId: string | null = resultId
  const visited = new Set<string>()
  while (currentId) {
    if (visited.has(currentId)) return null
    visited.add(currentId)
    const node = nodes[currentId]
    if (!node) return null
    chain.push(node)
    if (node.type === 'origem') return chain.reverse()
    if (node.type === 'resultado' && node.id !== resultId) return chain.reverse()
    const inputs: Array<{ sourceId: string; operation?: Operation }> = inputsMap.get(currentId) || []
    if (inputs.length !== 1) return null
    currentId = inputs[0].sourceId
  }
  return null
}

// Topological sort para ordem de avaliação
const topoSort = (nodes: Record<string, GraphNode>, edges: GraphEdge[]): string[] => {
  const inDegree = new Map<string, number>()
  const graph = new Map<string, string[]>()
  
  Object.keys(nodes).forEach(id => {
    inDegree.set(id, 0)
    graph.set(id, [])
  })
  
  edges.forEach(e => {
    graph.get(e.sourceId)!.push(e.targetId)
    inDegree.set(e.targetId, (inDegree.get(e.targetId) || 0) + 1)
  })
  
  const queue: string[] = []
  inDegree.forEach((degree, id) => {
    if (degree === 0) queue.push(id)
  })
  
  const result: string[] = []
  while (queue.length > 0) {
    const node = queue.shift()!
    result.push(node)
    
    graph.get(node)!.forEach(neighbor => {
      inDegree.set(neighbor, inDegree.get(neighbor)! - 1)
      if (inDegree.get(neighbor) === 0) {
        queue.push(neighbor)
      }
    })
  }
  
  return result
}

// Calcula valores do grafo
const calcGraph = (nodes: Record<string, GraphNode>, edges: GraphEdge[]) => {
  const result: Record<string, number | null> = {}
  const order = topoSort(nodes, edges)
  
  const inputsMap = new Map<string, Array<{ sourceId: string, operation?: Operation }>>()
  edges.forEach(e => {
    if (!inputsMap.has(e.targetId)) {
      inputsMap.set(e.targetId, [])
    }
    inputsMap.get(e.targetId)!.push({ sourceId: e.sourceId, operation: e.operation })
  })
  
  order.forEach(nodeId => {
    const node = nodes[nodeId]
    if (!node) return
    
    const inputs = inputsMap.get(nodeId) || []
    
    if (node.type === 'origem') {
      if (inputs.length === 0) {
        result[nodeId] = node.value ?? 0
      } else {
        let sum = 0
        inputs.forEach(inp => {
          const val = result[inp.sourceId]
          if (val !== null && val !== undefined) {
            sum += val
          }
        })
        result[nodeId] = sum
      }
    } else if (node.type === 'etapa') {
      if (inputs.length >= 1) {
        const input1 = result[inputs[0].sourceId]
        const input2 = inputs.length >= 2 ? result[inputs[1].sourceId] : node.value
        
        if (input1 !== null && input2 !== null && node.operation) {
          switch (node.operation) {
            case '+':
              result[nodeId] = input1 + input2
              break
            case '-':
              result[nodeId] = input1 - input2
              break
            case '×':
              result[nodeId] = input1 * input2
              break
            case '÷':
              result[nodeId] = input2 !== 0 ? input1 / input2 : null
              break
          }
        } else {
          result[nodeId] = null
        }
      } else {
        result[nodeId] = node.value ?? null
      }
    } else if (node.type === 'resultado') {
      if (inputs.length > 0) {
        // Pipeline (whiteboard): resultado = valor do último nó. Calculadora: resultado = expressão com precedência.
        const usePrecedence = node.evalPrecedence === true
        const chain = usePrecedence ? getLinearChain(nodeId, nodes, inputsMap) : null
        if (usePrecedence && chain && chain.length >= 1) {
          const tokens: (number | OpToken)[] = [chain[0].value ?? 0]
          for (let i = 1; i < chain.length; i++) {
            const etapa = chain[i]
            if (etapa.type === 'etapa' && etapa.operation) {
              tokens.push(etapa.operation, etapa.value ?? 0)
            }
          }
          result[nodeId] = tokens.length > 1 ? evalWithPrecedence(tokens) : (chain[0].value ?? null)
        } else {
          result[nodeId] = result[inputs[0].sourceId] ?? null
        }
      } else {
        result[nodeId] = null
      }
    }
  })
  
  return result
}

// Calcula próxima posição sem sobreposição
const getNextPosition = (
  nodes: Record<string, GraphNode>,
  basePos?: { x: number; y: number }
): { x: number; y: number } => {
  if (!basePos) {
    return { x: 0, y: 0 }
  }
  
  const OFFSET_X = 300
  const OFFSET_Y = 150
  
  let newPos = { x: basePos.x + OFFSET_X, y: basePos.y }
  
  const positions = Object.values(nodes).map(n => n.position)
  const hasOverlap = (pos: { x: number; y: number }) => {
    return positions.some(p => 
      Math.abs(p.x - pos.x) < 100 && Math.abs(p.y - pos.y) < 100
    )
  }
  
  if (hasOverlap(newPos)) {
    newPos = { x: basePos.x + OFFSET_X, y: basePos.y + OFFSET_Y }
  }
  
  return newPos
}

export const useStore = create<State>((set, get) => ({
  nodes: {},
  edges: [],
  values: {},
  confirmModal: null,
  focusNodeId: null,

  setFocusNodeId: (id) => set({ focusNodeId: id }),

  addNode: (type, pos) => {
    const id = `n${nodeId++}`
    const { nodes } = get()
    
    const position = pos || getNextPosition(nodes)
    
    const node: GraphNode = {
      id,
      type,
      value: type === 'resultado' ? null : 0,
      position,
      ...(type === 'etapa' ? { operation: '+' as Operation } : {}),
    }
    
    set(s => ({ nodes: { ...s.nodes, [id]: node } }))
    get().calc()
    return id
  },

  updateNode: (id, data) => {
    set(s => ({
      nodes: { ...s.nodes, [id]: { ...s.nodes[id], ...data } }
    }))
    get().calc()
  },

  removeNode: (id) => {
    set(s => {
      const { [id]: _, ...rest } = s.nodes
      return {
        nodes: rest,
        edges: s.edges.filter(e => e.sourceId !== id && e.targetId !== id)
      }
    })
    get().calc()
  },

  addEdge: (src, tgt, operation) => {
    if (src === tgt) return
    
    const { edges, nodes } = get()
    
    if (hasCycle(edges, src, tgt)) {
      console.warn('Conexão bloqueada: criaria um ciclo')
      return
    }
    
    if (edges.some(e => e.sourceId === src && e.targetId === tgt)) return
    
    const targetInputs = edges.filter(e => e.targetId === tgt)
    if (targetInputs.length >= 2) {
      console.warn('Nó já tem 2 inputs (máximo)')
      return
    }
    
    const targetNode = nodes[tgt]
    let filtered = edges
    if (targetNode && targetNode.type === 'resultado') {
      filtered = edges.filter(e => e.targetId !== tgt)
    }
    
    const newEdge: GraphEdge = {
      id: `e${edgeId++}`,
      sourceId: src,
      targetId: tgt,
      operation
    }
    
    set({ edges: [...filtered, newEdge] })
    get().calc()
  },

  removeEdge: (id) => {
    set(s => ({ edges: s.edges.filter(e => e.id !== id) }))
    get().calc()
  },

  removeAllInputs: (nodeId) => {
    set(s => ({ edges: s.edges.filter(e => e.targetId !== nodeId) }))
    get().calc()
  },

  removeAllOutputs: (nodeId) => {
    set(s => ({ edges: s.edges.filter(e => e.sourceId !== nodeId) }))
    get().calc()
  },

  reconnectEdge: (edgeId, newSource, newTarget) => {
    if (newSource === newTarget) return
    
    const { edges } = get()
    const oldEdge = edges.find(e => e.id === edgeId)
    
    if (!oldEdge) return
    
    // Remove o edge antigo temporariamente para verificar ciclos
    const filteredEdges = edges.filter(e => e.id !== edgeId)
    
    // Verifica se a nova conexão criaria um ciclo
    if (hasCycle(filteredEdges, newSource, newTarget)) {
      console.warn('Reconexão bloqueada: criaria um ciclo')
      return
    }
    
    // Verifica se já existe essa conexão
    if (filteredEdges.some(e => e.sourceId === newSource && e.targetId === newTarget)) {
      console.warn('Conexão já existe')
      return
    }
    
    // Atualiza o edge
    set(s => ({
      edges: s.edges.map(e => 
        e.id === edgeId 
          ? { ...e, sourceId: newSource, targetId: newTarget }
          : e
      )
    }))
    get().calc()
  },

  addEtapa: (sourceId, operation) => {
    const { nodes, addNode, addEdge } = get()
    const sourceNode = nodes[sourceId]
    
    if (!sourceNode) return
    
    const newPos = getNextPosition(nodes, sourceNode.position)
    const newId = addNode('etapa', newPos)
    
    get().updateNode(newId, { operation })
    addEdge(sourceId, newId, operation)
  },

  addResultado: (sourceId, options) => {
    const { nodes, addNode, addEdge, updateNode } = get()
    const sourceNode = nodes[sourceId]
    
    if (!sourceNode) return
    
    const newPos = getNextPosition(nodes, sourceNode.position)
    const newId = addNode('resultado', newPos)
    if (options?.evalPrecedence) {
      updateNode(newId, { evalPrecedence: true })
    }
    addEdge(sourceId, newId)
  },

  getConnectedNodes: (nodeId) => {
    const { edges } = get()
    const connected = new Set<string>()
    const visited = new Set<string>()
    
    const traverse = (id: string) => {
      if (visited.has(id)) return
      visited.add(id)
      connected.add(id)
      
      // Busca upstream (entradas)
      edges
        .filter(e => e.targetId === id)
        .forEach(e => traverse(e.sourceId))
      
      // Busca downstream (saídas)
      edges
        .filter(e => e.sourceId === id)
        .forEach(e => traverse(e.targetId))
    }
    
    traverse(nodeId)
    return Array.from(connected)
  },

  removeFlow: (nodeId) => {
    const { getConnectedNodes } = get()
    const nodesToRemove = getConnectedNodes(nodeId)
    
    set(s => {
      const newNodes = { ...s.nodes }
      nodesToRemove.forEach(id => {
        delete newNodes[id]
      })
      
      return {
        nodes: newNodes,
        edges: s.edges.filter(e => 
          !nodesToRemove.includes(e.sourceId) && 
          !nodesToRemove.includes(e.targetId)
        ),
        confirmModal: null
      }
    })
    
    get().calc()
  },

  openConfirmModal: (nodeId) => {
    const { getConnectedNodes } = get()
    const count = getConnectedNodes(nodeId).length
    set({ confirmModal: { isOpen: true, nodeId, count } })
  },

  closeConfirmModal: () => {
    set({ confirmModal: null })
  },

  calc: () => {
    const { nodes, edges } = get()
    set({ values: calcGraph(nodes, edges) })
  },

  loadFlow: (data) => {
    const { nodes: loadedNodes, edges: loadedEdges } = data
    if (!loadedNodes || typeof loadedNodes !== 'object' || !Array.isArray(loadedEdges)) return
    set({ nodes: loadedNodes, edges: loadedEdges, confirmModal: null })
    get().calc()
    const maxN = Math.max(0, ...Object.keys(loadedNodes).map(k => parseInt(k.replace(/^n/, ''), 10)).filter(n => !Number.isNaN(n)))
    const maxE = Math.max(0, ...loadedEdges.map((e: GraphEdge) => parseInt(e.id.replace(/^e/, ''), 10)).filter(n => !Number.isNaN(n)))
    nodeId = maxN + 1
    edgeId = maxE + 1
  },

  duplicateNode: (nodeId) => {
    const { nodes, addNode, updateNode } = get()
    const source = nodes[nodeId]
    if (!source) return null
    const newPos = getNextPosition(nodes, source.position)
    const newId = addNode(source.type, newPos)
    updateNode(newId, {
      value: source.value,
      title: source.title,
      ...(source.operation != null && { operation: source.operation }),
      ...(source.evalPrecedence != null && { evalPrecedence: source.evalPrecedence }),
    })
    return newId
  },

  getFormula: (resultNodeId) => {
    const { nodes, edges } = get()
    const node = nodes[resultNodeId]
    if (!node || node.type !== 'resultado') return null
    const inputsMap = new Map<string, Array<{ sourceId: string; operation?: Operation }>>()
    edges.forEach(e => {
      if (!inputsMap.has(e.targetId)) inputsMap.set(e.targetId, [])
      inputsMap.get(e.targetId)!.push({ sourceId: e.sourceId, operation: e.operation })
    })
    const chain = getFormulaChain(resultNodeId, nodes, inputsMap)
    if (!chain || chain.length === 0) return null
    const withoutResult = chain.slice(0, -1)
    if (withoutResult.length === 0) return null
    const ids = withoutResult.map(n => n.id)
    const ops: (Operation | undefined)[] = []
    for (let i = 1; i < withoutResult.length; i++) {
      const n = withoutResult[i]
      ops.push(n.type === 'etapa' ? n.operation : undefined)
    }
    const hasAddSub = ops.some(o => o === '+' || o === '-')
    const hasMulDiv = ops.some(o => o === '×' || o === '÷')
    const needParens = hasAddSub && hasMulDiv
    const isMulDiv = (o: Operation | undefined) => o === '×' || o === '÷'
    const runs: { startIdIdx: number; endIdIdx: number }[] = []
    for (let i = 0; i < ops.length; i++) {
      if (!isMulDiv(ops[i])) continue
      const startIdIdx = i
      while (i < ops.length && isMulDiv(ops[i])) i++
      runs.push({ startIdIdx, endIdIdx: i })
      i--
    }
    const openParenAt = (idIdx: number) => needParens && runs.some(r => r.startIdIdx === idIdx)
    const closeParenAfter = (idIdx: number) => needParens && runs.some(r => r.endIdIdx === idIdx)
    const parts: string[] = []
    for (let i = 0; i < ids.length; i++) {
      if (openParenAt(i)) parts.push('(')
      parts.push(ids[i])
      if (closeParenAfter(i)) parts.push(')')
      if (i < ops.length && ops[i]) parts.push(' ', ops[i]!, ' ')
    }
    return parts.join('').replace(/\s+/g, ' ').trim()
  },
}))
