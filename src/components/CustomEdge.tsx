import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath, type EdgeProps } from '@xyflow/react'
import { useStore } from '../store'

export default function CustomEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data }: EdgeProps) {
  const { removeEdge } = useStore()
  
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  const operation = data?.operation as string | undefined
  
  // Cores baseadas na operação
  const getColor = () => {
    if (!operation) return '#cbd5e1'
    switch (operation) {
      case '+': return '#22c55e'
      case '-': return '#ef4444'
      case '×': return '#3b82f6'
      case '÷': return '#f97316'
      default: return '#cbd5e1'
    }
  }

  const color = getColor()

  return (
    <>
      <BaseEdge id={id} path={edgePath} style={{ stroke: color, strokeWidth: 1.5 }} />
      
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            background: '#ffffff',
            border: `1px solid ${color}`,
            borderRadius: 6,
            padding: operation ? '2px 6px' : '3px',
            fontSize: 11,
            fontWeight: 600,
            pointerEvents: 'all',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
          className="nodrag nopan"
        >
          {operation && <span style={{ color, lineHeight: 1 }}>{operation}</span>}
          <button
            onClick={(e) => {
              e.stopPropagation()
              removeEdge(id)
            }}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              width: 14,
              height: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 3,
              color: '#64748b',
              fontSize: 12,
              lineHeight: 1,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f1f5f9'
              e.currentTarget.style.color = '#ef4444'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = '#64748b'
            }}
          >
            ×
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  )
}
