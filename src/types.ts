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
  /** Etapa: quando true, N origens → N resultados (cada origem aplica op+valor independente) */
  isMultiple?: boolean
}

export interface GraphEdge {
  id: string
  sourceId: string
  targetId: string
  operation?: Operation
  /** Em etapa múltipla: identifica qual origem (sourceId) alimenta este output */
  flowId?: string
}
