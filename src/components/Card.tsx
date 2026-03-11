import { useState, useRef, useEffect, useMemo } from 'react'
import { Position, type NodeProps } from '@xyflow/react'
import { useStore, getStageOrderMap } from '../store'
import type { GraphNode, Operation } from '../types'
import { formatDecimalBR, parseDecimalBR } from '../utils/numbers'
import CustomHandle from './CustomHandle'

export default function Card({ id, data }: NodeProps) {
  const dataNode = data as unknown as Record<string, unknown>
  const node = useStore(s => s.nodes[id] ?? dataNode) as GraphNode
  const {
    updateNode,
    removeNode,
    values,
    addNode,
    addEdge,
    removeAllInputs,
    removeAllOutputs,
    edges,
    openConfirmModal,
    duplicateNode,
    getFormula,
    focusNodeId,
    setFocusNodeId,
    getNextPositionFrom,
    addOrigemFromResult,
  } = useStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const [opMenuOpen, setOpMenuOpen] = useState(false)
  const [addDropupOpen, setAddDropupOpen] = useState(false)
  const [inputFocused, setInputFocused] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const menuRef = useRef<HTMLDivElement>(null)
  const addDropupRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [inputWidth, setInputWidth] = useState(80)

  useEffect(() => {
    if (focusNodeId === id && (node.type === 'origem' || node.type === 'etapa')) {
      inputRef.current?.focus()
      setFocusNodeId(null)
    }
  }, [focusNodeId, id, node.type, setFocusNodeId])

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

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (addDropupRef.current && !addDropupRef.current.contains(target)) setAddDropupOpen(false)
    }
    if (addDropupOpen) document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [addDropupOpen])

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
      case '%':
        return { bg: '#f5f3ff', border: '#7c3aed', text: '#5b21b6', icon: '%' }
      default:
        return { bg: '#f3f4f6', border: '#9ca3af', text: '#374151', icon: '📊' }
    }
  }

  const c = getColors()
  const rawDisplayValue = node.type === 'resultado' 
    ? (values[id] ?? '—') 
    : (values[id] ?? node.value ?? 0)
  const displayValue = typeof rawDisplayValue === 'number' ? formatDecimalBR(rawDisplayValue) : rawDisplayValue
  const resultFormula = node.type === 'resultado' ? getFormula(id) : null

  const inputEdges = edges.filter(e => e.targetId === id)
  const outputEdges = edges.filter(e => e.sourceId === id)
  const hasTwoInputs = inputEdges.length >= 2
  const isEtapaMultiple = node.type === 'etapa' && !!node.isMultiple
  const maxResultsMultiplo = 9
  const canAddMoreResults = !isEtapaMultiple || outputEdges.length < Math.min(inputEdges.length, maxResultsMultiplo)
  const nodes = useStore(s => s.nodes)
  const stageOrderMap = useMemo(() => getStageOrderMap(nodes, edges), [nodes, edges])
  const stageOrder = node.type === 'etapa' ? (stageOrderMap[id] ?? 0) : 0

  // Origem conectada como 2ª (ou posterior) entrada de etapa com Múltiplo desligado: visível mas inativa no cálculo
  const isDormantOrigin = useMemo(() => {
    if (node.type !== 'origem') return false
    return outputEdges.some(e => {
      const target = nodes[e.targetId]
      if (target?.type !== 'etapa' || target.isMultiple) return false
      const inputsToEtapa = edges.filter(x => x.targetId === e.targetId)
      if (inputsToEtapa.length < 2) return false
      const firstConnectedOrigin = inputsToEtapa[0].sourceId
      return firstConnectedOrigin !== id
    })
  }, [node.type, node.isMultiple, id, nodes, edges, outputEdges])

  const handleOperationSelect = (op: Operation) => {
    updateNode(id, { operation: op })
    setOpMenuOpen(false)
  }

  const handleAddOrigem = () => {
    if (node.type === 'resultado') {
      addOrigemFromResult(id)
    } else {
      const newId = addNode('origem', getNextPositionFrom(node.position))
      addEdge(id, newId)
    }
    setAddDropupOpen(false)
  }
  const handleAddEtapa = () => {
    const newId = addNode('etapa', getNextPositionFrom(node.position))
    addEdge(id, newId)
    setAddDropupOpen(false)
  }
  const handleAddResult = () => {
    const newId = addNode('resultado', getNextPositionFrom(node.position))
    updateNode(newId, { title: 'Resultado' })
    addEdge(id, newId)
    setAddDropupOpen(false)
  }

  return (
    <div
      className="card-node"
      style={{
      minWidth: node.type === 'resultado' ? 220 : inputWidth + 80,
      background: isDormantOrigin ? '#f1f5f9' : c.bg,
      border: isEtapaMultiple ? `2px dashed ${c.border}` : `1px solid ${c.border}`,
      borderRadius: 12,
      padding: 16,
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      position: 'relative',
      opacity: isDormantOrigin ? 0.85 : 1,
    }}
      title={isDormantOrigin ? 'Conectada mas inativa. Ative Múltiplo na Etapa para participar do cálculo.' : undefined}
    >
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
        
        <>
            <input
              type="text"
              value={node.title || ''}
              onChange={(e) => !isDormantOrigin && updateNode(id, { title: e.target.value })}
              readOnly={isDormantOrigin}
              disabled={isDormantOrigin}
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
                cursor: isDormantOrigin ? 'not-allowed' : undefined,
              }}
            />
            {/* Menu 3 pontos */}
            <div ref={menuRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="nodrag"
            aria-label="Abrir menu do card"
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
          </>
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
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 8,
          gap: 8,
          flexWrap: 'wrap',
        }}>
          <span style={{
            fontSize: 10,
            fontWeight: 700,
            color: '#64748b',
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
          }}>
            Impacto
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {node.isMultiple && inputEdges.length > 0 && (
              <span style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                {inputEdges.length} {inputEdges.length === 1 ? 'entrada' : 'entradas'}
              </span>
            )}
            {hasTwoInputs && (
              <>
                <label className="nodrag" style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 11, fontWeight: 600, color: c.text }}>
                  <input
                    type="checkbox"
                    checked={!!node.isMultiple}
                    onChange={() => updateNode(id, { isMultiple: !node.isMultiple })}
                    aria-label="Modo múltiplo: um resultado por origem"
                  />
                  Múltiplo
                </label>
              </>
            )}
          </div>
        </div>
      )}

      {node.type === 'etapa' && stageOrder >= 1 && (
        <span style={{
          fontSize: 9,
          fontWeight: 700,
          color: c.text,
          opacity: 0.85,
          letterSpacing: '0.3px',
        }}>
          {stageOrder}ª etapa
        </span>
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
                {(['+', '-', '×', '÷', '%'] as const).map((op) => (
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
              type="text"
              inputMode="decimal"
              value={inputFocused ? inputValue : formatDecimalBR(node.value ?? 0)}
              onChange={(e) => {
                if (isDormantOrigin) return
                const raw = e.target.value
                if (raw !== '' && !/^-?[\d.,]*$/.test(raw)) return
                const commaCount = (raw.match(/,/g) || []).length
                if (commaCount > 1) return
                const hasComma = raw.includes(',')
                const sep = hasComma ? ',' : '.'
                const afterSep = raw.split(sep)[1] || ''
                if (afterSep.length > 2) return
                setInputValue(raw)
                const num = parseDecimalBR(raw)
                updateNode(id, { value: Number.isNaN(num) ? 0 : num })
              }}
              onFocus={() => {
                if (isDormantOrigin) return
                setInputFocused(true)
                setInputValue((node.value === 0 || node.value == null) ? '' : formatDecimalBR(node.value ?? 0))
              }}
              onBlur={() => {
                setInputFocused(false)
                if (isDormantOrigin) return
                const v = inputValue.trim()
                const num = parseDecimalBR(v)
                updateNode(id, { value: (v === '' || Number.isNaN(num)) ? 0 : num })
              }}
              readOnly={isDormantOrigin}
              disabled={isDormantOrigin}
              className="nodrag"
              aria-label={isDormantOrigin ? 'Valor (origem inativa)' : undefined}
              style={{
                width: `${inputWidth}px`,
                padding: '10px 16px',
                border: `1px solid ${c.border}`,
                borderRadius: 8,
                fontSize: 18,
                fontWeight: 700,
                textAlign: 'center',
                color: c.text,
                background: isDormantOrigin ? '#e2e8f0' : '#ffffff',
                cursor: isDormantOrigin ? 'not-allowed' : undefined,
                MozAppearance: 'textfield',
                WebkitAppearance: 'none',
                appearance: 'none',
              }}
            />
        ) : (
          <div style={{ textAlign: 'center', padding: '10px 16px' }}>
            {resultFormula && (
              <div style={{
                fontSize: 11,
                color: '#64748b',
                fontFamily: 'monospace',
                marginBottom: 4,
                fontWeight: 400,
              }}>
                {resultFormula}
              </div>
            )}
            <div style={{
              fontSize: 28,
              fontWeight: 'bold',
              color: c.text,
            }}>
              {displayValue}
            </div>
          </div>
        )}
      </div>

      {/* Indicador de impacto para Etapa + dica múltiplo acima dos botões */}
      {node.type === 'etapa' && (() => {
        const isNegative = node.operation === '-'
        const impactDisplay = displayValue
        const impactColor = isNegative ? '#ef4444' : '#22c55e'
        const impactArrow = isNegative ? '↓' : '↑'
        return (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
            marginBottom: 12,
          }}>
            <span style={{ flex: 1, textAlign: 'left' }}>
              {node.isMultiple && (
                <span style={{ fontSize: 9, color: '#64748b', whiteSpace: 'nowrap' }} title="Cada origem gera um valor. Conecte um Resultado por origem para ver todos.">
                  (1 resultado por origem)
                </span>
              )}
            </span>
            <span style={{
              fontSize: 16,
              fontWeight: 'bold',
              color: impactColor,
              textAlign: 'right',
            }}>
              {impactArrow} {impactDisplay}
            </span>
          </div>
        )
      })()}

      <div ref={addDropupRef} style={{ position: 'relative', marginTop: 12 }}>
        <button
          type="button"
          onClick={() => setAddDropupOpen(!addDropupOpen)}
          className="nodrag"
          style={{
            width: '100%',
            padding: '8px 12px',
            border: 'none',
            background: addDropupOpen ? '#2563eb' : '#3b82f6',
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
          onMouseEnter={(e) => { e.currentTarget.style.background = addDropupOpen ? '#2563eb' : '#2563eb' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = addDropupOpen ? '#2563eb' : '#3b82f6' }}
          aria-label="Adicionar nó"
        >
          <span>+</span> Adicionar
        </button>
        {addDropupOpen && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: 6,
            background: '#fff',
            borderRadius: 8,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            padding: '4px 0',
            minWidth: 140,
            zIndex: 1100,
          }}>
            {!isEtapaMultiple && (
              <>
                {node.type === 'resultado' && (
                  <button
                    type="button"
                    className="nodrag"
                    onClick={handleAddOrigem}
                    style={{ width: '100%', padding: '10px 16px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, textAlign: 'left', color: '#1e293b', display: 'flex', alignItems: 'center', gap: 8 }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#f0f9ff' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'none' }}
                  >
                    <span style={{ color: '#0ea5e9' }}>●</span> Origem
                  </button>
                )}
                {(node.type === 'origem' || node.type === 'etapa') && (
                  <button
                    type="button"
                    className="nodrag"
                    onClick={handleAddEtapa}
                    style={{ width: '100%', padding: '10px 16px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, textAlign: 'left', color: '#1e293b', display: 'flex', alignItems: 'center', gap: 8 }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#f0fdf4' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'none' }}
                  >
                    <span style={{ color: '#22c55e' }}>●</span> Etapa
                  </button>
                )}
              </>
            )}
            {node.type === 'etapa' && (
              <button
                type="button"
                className="nodrag"
                onClick={handleAddResult}
                disabled={isEtapaMultiple && !canAddMoreResults}
                title={isEtapaMultiple && !canAddMoreResults ? `Máximo de resultados = quantidade de origens (até ${maxResultsMultiplo})` : undefined}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  border: 'none',
                  background: 'none',
                  cursor: isEtapaMultiple && !canAddMoreResults ? 'not-allowed' : 'pointer',
                  fontSize: 13,
                  textAlign: 'left',
                  color: isEtapaMultiple && !canAddMoreResults ? '#94a3b8' : '#1e293b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  opacity: isEtapaMultiple && !canAddMoreResults ? 0.7 : 1,
                }}
                onMouseEnter={(e) => { if (!(isEtapaMultiple && !canAddMoreResults)) e.currentTarget.style.background = '#f8fafc' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'none' }}
              >
                <span style={{ color: '#64748b' }}>→</span> Result
              </button>
            )}
          </div>
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
        .card-node span {
          vertical-align: bottom;
          text-align: left;
        }
        input[type=number]::-webkit-outer-spin-button,
        input[type=number]::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
      `}</style>
    </div>
  )
}
