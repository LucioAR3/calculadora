import { Handle, Position, type HandleProps } from '@xyflow/react'
import { useStore } from '../store'

interface CustomHandleProps extends Omit<HandleProps, 'type' | 'position'> {
  nodeId: string
  type: 'source' | 'target'
  position: Position
  color: string
}

export default function CustomHandle({ nodeId, type, position, color, ...props }: CustomHandleProps) {
  const { edges } = useStore()
  
  const isSource = type === 'source'
  const connectionCount = edges.filter(e => 
    isSource ? e.sourceId === nodeId : e.targetId === nodeId
  ).length

  return (
    <div
      style={{
        position: 'absolute',
        [position === Position.Left ? 'left' : 'right']: -4,
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 10,
      }}
    >
      <Handle
        {...props}
        type={type}
        position={position}
        style={{
          width: 10,
          height: 10,
          background: color,
          border: '2px solid #ffffff',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
      />
      
      {/* Badge contador de conexões */}
      {connectionCount > 0 && (
        <div
          style={{
            position: 'absolute',
            top: -8,
            [isSource ? 'left' : 'right']: -8,
            background: color,
            color: '#ffffff',
            width: 16,
            height: 16,
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 9,
            fontWeight: 'bold',
            border: '1.5px solid #ffffff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            pointerEvents: 'none',
          }}
        >
          {connectionCount}
        </div>
      )}
    </div>
  )
}
