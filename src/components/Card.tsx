import { useState, useRef, useEffect } from 'react'
import { Position, type NodeProps } from '@xyflow/react'
import { useStore } from '../store'
import type { GraphNode, Operation } from '../types'
import CustomHandle from './CustomHandle'

export default function Card({ id, data }: NodeProps) {
  const node = data as unknown as GraphNode
  const { updateNode, removeNode, values, addEtapa, addResultado, addNode, addEdge, removeAllInputs, removeAllOutputs, edges, openConfirmModal, duplicateNode } = useStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const [opMenuOpen, setOpMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [inputWidth, setInputWidth] = useState(80)

  // Calcula largura do input baseado no valor
  useEffect(() => {
    if (inputRef.current && (node.type === 'origem' || node.type === 'etapa')) {
      const value = node.value?.toString() || '0'
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      if (context) {
        context.font = '18px system-ui'
        const metrics = context.measureText(value)
        const width = Math.max(60, Math.min(200, metrics.width + 40))
        setInputWidth(width)
      }
    }
  }, [node.value, node.type])

  // Cores baseadas em tipo e operação
  const getColors = () => {
    if (node.type === 'origem') {
      return { 
        bg: '#f0f9ff', 
        border: '#bae6fd', 
        text: '#0c4a6e',
        icon: '🏦'
      }
    }
    
    if (node.type === 'resultado') {
      return { 
        bg: '#f8fafc', 
        border: '#cbd5e1', 
        text: '#475569',
        icon: '🎯'
      }
    }
    
    // Etapas - cores por operação
    switch (node.operation) {
      case '+':
        return { bg: '#dcfce7', border: '#22c55e', text: '#166534', icon: '➕' }
      case '-':
        return { bg: '#fee2e2', border: '#ef4444', text: '#991b1b', icon: '➖' }
      case '×':
        return { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af', icon: '✖️' }
      case '÷':
        return { bg: '#fed7aa', border: '#f97316', text: '#9a3412', icon: '➗' }
      default:
        return { bg: '#f3f4f6', border: '#9ca3af', text: '#374151', icon: '📊' }
    }
  }

  const c = getColors()
  const displayValue = node.type === 'resultado' 
    ? (values[id] ?? '—') 
    : (values[id] ?? node.value ?? 0)

  const handleOperationSelect = (op: Operation) => {
    updateNode(id, { operation: op })
    setOpMenuOpen(false)
  }

  const handleAddOrigemLinked = () => {
    const basePos = node.position
    const newPos = { x: basePos.x + 300, y: basePos.y }
    const newId = addNode('origem', newPos)
    addEdge(id, newId)
    setMenuOpen(false)
  }

  return (
    <div style={{
      minWidth: node.type === 'resultado' ? 220 : inputWidth + 80,
      background: c.bg,
      border: `1px solid ${c.border}`,
      borderRadius: 12,
      padding: 16,
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      position: 'relative',
    }}>
      <CustomHandle
        nodeId={id}
        type="target"
        position={Position.Left}
        color={c.border}
      />
      <CustomHandle
        nodeId={id}
        type="source"
        position={Position.Right}
        color={c.border}
      />

      {/* Header com ícone */}
      <div style={{
        marginBottom: 12,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        <span style={{ fontSize: 20 }}>{c.icon}</span>
        
        <input
          type="text"
          value={node.title || ''}
          onChange={(e) => updateNode(id, { title: e.target.value })}
          placeholder={
            node.type === 'origem' ? 'Origem' :
            node.type === 'etapa' ? 'Etapa' :
            'Resultado'
          }
          className="nodrag"
          style={{
            flex: 1,
            border: 'none',
            background: 'transparent',
            fontSize: 13,
            fontWeight: 600,
            color: c.text,
            outline: 'none',
          }}
        />
        
        {/* Menu 3 pontos */}
        <div ref={menuRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="nodrag"
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              fontSize: 14,
              padding: 4,
              lineHeight: 1,
              fontWeight: 'bold',
            }}
          >
            ⋮
          </button>
          
          {menuOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: 4,
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              zIndex: 1000,
              minWidth: 180,
            }}>
              {/* Remover entradas */}
              {edges.some(e => e.targetId === id) && (
                <button
                  onClick={() => { removeAllInputs(id); setMenuOpen(false); }}
                  className="nodrag"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: 'none',
                    background: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: 13,
                    color: '#64748b',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                >
                  <span style={{ fontSize: 14 }}>←</span> Remover entradas
                </button>
              )}
              
              {/* Remover saídas */}
              {edges.some(e => e.sourceId === id) && (
                <button
                  onClick={() => { removeAllOutputs(id); setMenuOpen(false); }}
                  className="nodrag"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: 'none',
                    background: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: 13,
                    color: '#64748b',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                >
                  <span style={{ fontSize: 14 }}>→</span> Remover saídas
                </button>
              )}
              
              {/* Separador se houver conexões */}
              {(edges.some(e => e.targetId === id) || edges.some(e => e.sourceId === id)) && (
                <>
                  <div style={{ borderTop: '1px solid #e5e7eb', margin: '4px 0' }} />
                  
                  {/* Excluir fluxo completo */}
                  <button
                    onClick={() => {
                      openConfirmModal(id)
                      setMenuOpen(false)
                    }}
                    className="nodrag"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      border: 'none',
                      background: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: 13,
                      color: '#f97316',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#fff7ed'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                  >
                    <span style={{ fontSize: 16 }}>🔥</span> Excluir fluxo
                  </button>
                </>
              )}
              
              {/* Separador final */}
              <div style={{ borderTop: '1px solid #e5e7eb', margin: '4px 0' }} />
              
              {/* Duplicar card (sem links) */}
              <button
                onClick={() => { duplicateNode(id); setMenuOpen(false); }}
                className="nodrag"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: 'none',
                  background: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: 13,
                  color: '#1e293b',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
              >
                <span style={{ fontSize: 16 }}>📋</span> Duplicar card
              </button>
              
              {/* Excluir apenas este card */}
              <button
                onClick={() => { removeNode(id); setMenuOpen(false); }}
                className="nodrag"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: 'none',
                  background: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: 13,
                  color: '#ef4444',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
              >
                <span style={{ fontSize: 16 }}>🗑️</span> Excluir card
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Label do tipo */}
      {node.type === 'origem' && (
        <div style={{
          fontSize: 10,
          fontWeight: 700,
          color: '#64748b',
          letterSpacing: '0.5px',
          marginBottom: 8,
          textTransform: 'uppercase',
        }}>
          Valor Inicial
        </div>
      )}

      {node.type === 'etapa' && (
        <div style={{
          fontSize: 10,
          fontWeight: 700,
          color: '#64748b',
          letterSpacing: '0.5px',
          marginBottom: 8,
          textTransform: 'uppercase',
        }}>
          Impacto
        </div>
      )}

      {/* Content */}
      <div style={{ 
        display: 'flex', 
        gap: 8, 
        alignItems: 'center', 
        marginBottom: node.type === 'etapa' ? 12 : 0,
        justifyContent: node.type === 'resultado' ? 'center' : 'flex-start',
      }}>
        {node.type === 'etapa' && (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setOpMenuOpen(!opMenuOpen)}
              className="nodrag"
              style={{
                background: 'rgba(0,0,0,0.05)',
                border: 'none',
                borderRadius: 8,
                width: 40,
                height: 40,
                fontSize: 20,
                fontWeight: 'bold',
                color: c.text,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {node.operation || '+'}
            </button>
            
            {opMenuOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: 4,
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}>
                {['+', '-', '×', '÷'].map((op) => (
                  <button
                    key={op}
                    onClick={() => handleOperationSelect(op as Operation)}
                    className="nodrag"
                    style={{
                      padding: '10px 18px',
                      border: 'none',
                      background: node.operation === op ? '#f1f5f9' : 'none',
                      cursor: 'pointer',
                      fontSize: 18,
                      fontWeight: 'bold',
                      color: '#1e293b',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                    onMouseLeave={(e) => {
                      if (node.operation !== op) {
                        e.currentTarget.style.background = 'none'
                      }
                    }}
                  >
                    {op}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {node.type !== 'resultado' ? (
          <input
            ref={inputRef}
            type="number"
            value={node.value ?? 0}
            onChange={(e) => updateNode(id, { value: parseFloat(e.target.value) || 0 })}
            className="nodrag"
            style={{
              width: `${inputWidth}px`,
              padding: '10px 16px',
              border: `1px solid ${c.border}`,
              borderRadius: 8,
              fontSize: 18,
              fontWeight: 700,
              textAlign: 'center',
              color: c.text,
              background: '#ffffff',
              MozAppearance: 'textfield',
              WebkitAppearance: 'none',
              appearance: 'none',
            }}
          />
        ) : (
          <div style={{
            fontSize: 28,
            fontWeight: 'bold',
            color: c.text,
            textAlign: 'center',
            padding: '10px 16px',
          }}>
            {displayValue}
          </div>
        )}
      </div>

      {/* Indicador de impacto para Etapa */}
      {node.type === 'etapa' && (
        <div style={{
          fontSize: 16,
          fontWeight: 'bold',
          color: node.operation === '-' ? '#ef4444' : '#22c55e',
          textAlign: 'right',
          marginBottom: 12,
        }}>
          {node.operation === '-' ? '↓' : '↑'} {displayValue}
        </div>
      )}

      {/* Botões de ação */}
      <div style={{
        display: 'flex',
        gap: 8,
        marginTop: 12,
      }}>
        {node.type === 'origem' && (
          <>
            <button
              onClick={handleAddOrigemLinked}
              className="nodrag"
              style={{
                flex: 1,
                padding: '8px 12px',
                border: 'none',
                background: 'rgba(59, 130, 246, 0.1)',
                color: '#3b82f6',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)'}
            >
              <span>+</span> Origem
            </button>
            
            <button
              onClick={() => addEtapa(id, '+')}
              className="nodrag"
              style={{
                flex: 1,
                padding: '8px 12px',
                border: 'none',
                background: '#3b82f6',
                color: '#ffffff',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#2563eb'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#3b82f6'}
            >
              <span>+</span> Add Etapa
            </button>
          </>
        )}

        {node.type === 'etapa' && (
          <>
            <button
              onClick={() => addEtapa(id, node.operation || '+')}
              className="nodrag"
              style={{
                flex: 1,
                padding: '8px 12px',
                border: 'none',
                background: 'rgba(0,0,0,0.05)',
                color: c.text,
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
            >
              <span>+</span> Etapa
            </button>
            
            <button
              onClick={() => addResultado(id)}
              className="nodrag"
              style={{
                flex: 1,
                padding: '8px 12px',
                border: 'none',
                background: c.border,
                color: '#ffffff',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              <span>→</span> Result.
            </button>
          </>
        )}

        {node.type === 'resultado' && (
          <>
            <button
              onClick={() => addEtapa(id, '+')}
              className="nodrag"
              style={{
                flex: 1,
                padding: '8px 12px',
                border: 'none',
                background: 'rgba(75, 85, 99, 0.1)',
                color: '#475569',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(75, 85, 99, 0.2)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(75, 85, 99, 0.1)'}
            >
              <span>+</span> Etapa
            </button>
            
            <button
              onClick={() => addResultado(id)}
              className="nodrag"
              style={{
                flex: 1,
                padding: '8px 12px',
                border: 'none',
                background: '#94a3b8',
                color: '#ffffff',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              <span>→</span> Result.
            </button>
          </>
        )}
      </div>

      {/* ID Badge */}
      <div style={{
        position: 'absolute',
        top: -8,
        left: -8,
        background: c.border,
        color: '#ffffff',
        fontSize: 9,
        fontWeight: 'bold',
        padding: '2px 5px',
        borderRadius: 4,
        fontFamily: 'monospace',
      }}>
        {id}
      </div>
      
      <style>{`
        input[type=number]::-webkit-outer-spin-button,
        input[type=number]::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
      `}</style>
    </div>
  )
}
