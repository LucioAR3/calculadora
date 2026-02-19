export type NodeType = 'origem' | 'etapa' | 'resultado'
export type Operation = '+' | '-' | '×' | '÷'

export interface GraphNode {
  id: string
  type: NodeType
  value: number | null
  operation?: Operation
  title?: string
  position: { x: number; y: number }
  /** Quando true (apenas cálculo da calculadora), resultado = expressão com precedência; senão = valor do último nó (pipeline) */
  evalPrecedence?: boolean
}

export interface GraphEdge {
  id: string
  sourceId: string
  targetId: string
  operation?: Operation
}
