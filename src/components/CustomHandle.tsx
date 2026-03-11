import { Handle, Position, type HandleProps, useViewport } from '@xyflow/react'
import { useStore } from '../store'

/** Tamanhos a 100% zoom (px em tela). Em zoom in/out, tamanho em espaço do nó = base/zoom para manter igual na tela. */
const HANDLE_SIZE_BASE = 16
const HANDLE_SIZE_MIN = 12
const HANDLE_SIZE_MAX = 48
const BADGE_SIZE_BASE = 16
const BADGE_SIZE_MIN = 12
const BADGE_SIZE_MAX = 40
const BADGE_FONT_BASE = 10
const BADGE_FONT_MIN = 8
const BADGE_FONT_MAX = 20

interface CustomHandleProps extends Omit<HandleProps, 'type' | 'position'> {
  nodeId: string
  type: 'source' | 'target'
  position: Position
  color: string
}

export default function CustomHandle({ nodeId, type, position, color, ...props }: CustomHandleProps) {
  const { edges } = useStore()
  const { zoom } = useViewport()

  const size = Math.min(HANDLE_SIZE_MAX, Math.max(HANDLE_SIZE_MIN, HANDLE_SIZE_BASE / zoom))

  const isSource = type === 'source'
  const connectionCount = edges.filter(e =>
    isSource ? e.sourceId === nodeId : e.targetId === nodeId
  ).length

  const badgeSize = Math.min(BADGE_SIZE_MAX, Math.max(BADGE_SIZE_MIN, BADGE_SIZE_BASE / zoom))
  const badgeFontSize = Math.min(BADGE_FONT_MAX, Math.max(BADGE_FONT_MIN, BADGE_FONT_BASE / zoom))

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
          width: size,
          height: size,
          background: color,
          border: '2px solid #ffffff',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
      />

      {connectionCount > 0 && (
        <div
          style={{
            position: 'absolute',
            top: -badgeSize * 0.6,
            [isSource ? 'left' : 'right']: -badgeSize * 0.6,
            background: color,
            color: '#ffffff',
            width: badgeSize,
            height: badgeSize,
            borderRadius: badgeSize / 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: badgeFontSize,
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
