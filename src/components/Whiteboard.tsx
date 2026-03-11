import { useCallback, useMemo } from 'react'
import { 
  ReactFlow, 
  Background, 
  BackgroundVariant,
  type Connection, 
  type Edge
} from '@xyflow/react'
import { useStore } from '../store'
import Card from './Card'
import CustomEdge from './CustomEdge'

const nodeTypes = { card: Card }
const edgeTypes = { custom: CustomEdge }

/** Viewport inicial: (0,0) no centro da tela na primeira execução. */
function getDefaultViewport() {
  if (typeof window === 'undefined') return { x: 0, y: 0, zoom: 1 }
  return {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    zoom: 1,
  }
}

export default function Whiteboard() {
  const { nodes, edges, updateNode, addEdge, removeEdge, removeNode, reconnectEdge } = useStore()
  const defaultViewport = useMemo(getDefaultViewport, [])

  const flowNodes = useMemo(
    () => Object.values(nodes).map(n => ({
      id: n.id,
      type: 'card',
      position: n.position,
      data: { ...n } as Record<string, unknown>,
    })),
    [nodes]
  )

  const flowEdges: Edge[] = useMemo(
    () => {
      const visibleNodeIds = new Set(flowNodes.map(n => n.id))
      return edges
        .filter(e => visibleNodeIds.has(e.sourceId) && visibleNodeIds.has(e.targetId))
        .map(e => ({
          id: e.id,
          source: e.sourceId,
          target: e.targetId,
          type: 'custom',
          data: {
            operation: nodes[e.targetId]?.operation ?? e.operation,
          },
          reconnectable: true,
        }))
    },
    [edges, nodes, flowNodes]
  )

  const onConnect = useCallback(
    (c: Connection) => {
      if (c.source && c.target && c.source !== c.target) {
        addEdge(c.source, c.target)
      }
    },
    [addEdge]
  )

  const onReconnect = useCallback(
    (oldEdge: Edge, newConnection: Connection) => {
      if (newConnection.source && newConnection.target) {
        reconnectEdge(oldEdge.id, newConnection.source, newConnection.target)
      }
    },
    [reconnectEdge]
  )

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        onConnect={onConnect}
        onReconnect={onReconnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={(changes) => {
          changes.forEach(c => {
            if (c.type === 'position' && c.position && c.id) {
              updateNode(c.id, { position: c.position })
            } else if (c.type === 'remove' && c.id) {
              removeNode(c.id)
            }
          })
        }}
        onEdgesChange={(changes) => {
          changes.forEach(c => {
            if (c.type === 'remove' && c.id) removeEdge(c.id)
          })
        }}
        defaultViewport={defaultViewport}
        minZoom={0.1}
        maxZoom={4}
        deleteKeyCode={['Backspace', 'Delete']}
        panOnScroll
        selectionOnDrag
        panOnDrag={[1, 2]}
      >
        <Background 
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1.5}
          color="#e2e8f0"
          style={{ background: '#ffffff' }}
        />
      </ReactFlow>
    </div>
  )
}
