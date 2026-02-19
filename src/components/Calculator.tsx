import { useState, useEffect } from 'react'
import { useStore } from '../store'
import type { Operation } from '../types'

interface Props {
  onClose: () => void
}

interface HistoryItem {
  expression: string
  result: number
  timestamp: number
}

export default function Calculator({ onClose }: Props) {
  const [display, setDisplay] = useState('0')
  const [currentCardId, setCurrentCardId] = useState<string | null>(null)
  const [operator, setOperator] = useState<Operation | null>(null)
  const [waitingSecondValue, setWaitingSecondValue] = useState(false)
  const [firstValue, setFirstValue] = useState<number | null>(null)
  const [calculationDisplay, setCalculationDisplay] = useState('')
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [showingResult, setShowingResult] = useState(false)
  
  const { addNode, updateNode, addEdge, addResultado, values } = useStore()

  // Sincronização com teclado (não capturar se o foco estiver em input/editável)
  useEffect(() => {
    const isEditing = () => {
      const el = document.activeElement
      if (!el) return false
      const tag = el.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return true
      if (el.getAttribute?.('contenteditable') === 'true') return true
      return false
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isEditing()) return

      // Números 0-9
      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault()
        handleDigit(e.key)
        return
      }

      // Operadores
      if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') {
        e.preventDefault()
        handleOperator(e.key)
        return
      }

      // Equals (Enter ou =)
      if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault()
        handleEquals()
        return
      }

      // Clear (Escape ou c/C)
      if (e.key === 'Escape' || e.key.toLowerCase() === 'c') {
        e.preventDefault()
        handleClear()
        return
      }

      // Decimal (. ou vírgula)
      if (e.key === '.' || e.key === ',') {
        e.preventDefault()
        handleDecimal()
        return
      }

      // Backspace (apagar último dígito)
      if (e.key === 'Backspace') {
        e.preventDefault()
        handleBackspace()
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [display, currentCardId, operator, waitingSecondValue])

  const handleDigit = (digit: string) => {
    // Se estava mostrando resultado, reseta para novo cálculo
    if (showingResult) {
      setDisplay(digit)
      setShowingResult(false)
      setCurrentCardId(null)
      setOperator(null)
      setWaitingSecondValue(false)
      setFirstValue(null)
      setCalculationDisplay('')
      
      // Cria novo card Origem
      const value = parseFloat(digit)
      const id = addNode('origem', { x: 100, y: 100 })
      updateNode(id, { value, title: 'Valor 1' })
      setCurrentCardId(id)
      setFirstValue(value)
      setCalculationDisplay(digit)
      return
    }
    
    const newDisplay = display === '0' ? digit : display + digit
    setDisplay(newDisplay)
    
    const value = parseFloat(newDisplay)
    
    if (!currentCardId) {
      // Primeiro valor: cria card Origem
      const id = addNode('origem', { x: 100, y: 100 })
      updateNode(id, { value, title: 'Valor 1' })
      setCurrentCardId(id)
      setFirstValue(value)
      setCalculationDisplay(newDisplay)
    } else if (waitingSecondValue) {
      // Segundo valor: atualiza card Etapa
      updateNode(currentCardId, { value })
      setCalculationDisplay(`${firstValue} ${operator} ${newDisplay}`)
    } else {
      // Continuando primeiro valor (dezenas, centenas…): atualiza card atual
      updateNode(currentCardId, { value })
      setFirstValue(value)
      setCalculationDisplay(newDisplay)
    }
  }

  const handleOperator = (op: '+' | '-' | '*' | '/') => {
    if (!currentCardId) return
    
    const opMap: Record<string, Operation> = {
      '+': '+',
      '-': '-',
      '*': '×',
      '/': '÷'
    }
    
    const operation = opMap[op]
    
    // Cria card Etapa linkado ao card atual
    const { nodes } = useStore.getState()
    const sourceNode = nodes[currentCardId]
    
    if (sourceNode) {
      const newPos = { 
        x: sourceNode.position.x + 300, 
        y: sourceNode.position.y 
      }
      
      const newId = addNode('etapa', newPos)
      updateNode(newId, { 
        operation, 
        value: 0,
        title: 'Valor 2'
      })
      
      addEdge(currentCardId, newId, operation)
      
      setCurrentCardId(newId)
      setOperator(operation)
      setDisplay('0')
      setWaitingSecondValue(true)
      setCalculationDisplay(`${firstValue} ${operation}`)
    }
  }

  const handleEquals = () => {
    if (!currentCardId || !operator) return
    
    // Cria card Resultado
    addResultado(currentCardId, { evalPrecedence: true })
    
    // Aguarda cálculo e mostra resultado
    setTimeout(() => {
      const { nodes } = useStore.getState()
      const resultNode = Object.values(nodes).find(n => 
        n.type === 'resultado' && 
        useStore.getState().edges.some(e => e.sourceId === currentCardId && e.targetId === n.id)
      )
      
      if (resultNode) {
        const result = values[resultNode.id]
        const fullExpression = `${calculationDisplay} = ${result ?? '?'}`
        
        // Mostra resultado completo no display principal
        setDisplay(fullExpression)
        setCalculationDisplay('')
        setShowingResult(true)
        
        // Adiciona ao histórico
        if (result !== null && result !== undefined) {
          setHistory(prev => [...prev, {
            expression: fullExpression,
            result,
            timestamp: Date.now()
          }])
        }
      }
    }, 100)
  }

  const handleClear = () => {
    setDisplay('0')
    setCurrentCardId(null)
    setOperator(null)
    setWaitingSecondValue(false)
    setFirstValue(null)
    setCalculationDisplay('')
    setShowingResult(false)
  }

  const handleDecimal = () => {
    if (!display.includes('.')) {
      setDisplay(prev => prev + '.')
    }
  }

  const handleBackspace = () => {
    if (display.length > 1) {
      setDisplay(prev => prev.slice(0, -1))
    } else {
      setDisplay('0')
    }
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      right: 24,
      zIndex: 1000,
      width: 280,
      maxHeight: 'calc(100vh - 48px)',
      background: '#ffffff',
      borderRadius: 12,
      padding: 20,
      boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
      border: '1px solid #e5e7eb',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        marginBottom: 16,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <h3 style={{ 
          fontSize: 14, 
          fontWeight: 600, 
          color: '#1e293b', 
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}>
          <span style={{ fontSize: 16 }}>🧮</span> Calculadora
        </h3>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            fontSize: 18,
            padding: 4,
            lineHeight: 1,
          }}
        >
          ✕
        </button>
      </div>

      {/* Histórico */}
      {history.length > 0 && (
        <div style={{
          marginBottom: 12,
          maxHeight: 120,
          overflowY: 'auto',
          background: '#f8fafc',
          borderRadius: 8,
          padding: 8,
          border: '1px solid #e2e8f0',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 8,
            paddingBottom: 6,
            borderBottom: '1px solid #e2e8f0',
          }}>
            <span style={{
              fontSize: 11,
              fontWeight: 600,
              color: '#64748b',
              textTransform: 'uppercase',
            }}>
              Histórico
            </span>
            <button
              onClick={() => setHistory([])}
              style={{
                background: 'none',
                border: 'none',
                color: '#ef4444',
                cursor: 'pointer',
                fontSize: 10,
                fontWeight: 600,
                padding: '2px 6px',
                borderRadius: 4,
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#fee2e2'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
            >
              Limpar
            </button>
          </div>
          {history.map((item, index) => (
            <div
              key={item.timestamp}
              style={{
                fontSize: 12,
                fontFamily: 'monospace',
                color: '#475569',
                padding: '4px 0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: index < history.length - 1 ? '1px solid #e2e8f0' : 'none',
              }}
            >
              <span>{item.expression}</span>
            </div>
          ))}
        </div>
      )}

      {/* Status Indicator */}
      {currentCardId && (
        <div style={{
          fontSize: 11,
          color: '#64748b',
          marginBottom: 8,
          textAlign: 'center',
          fontWeight: 600,
        }}>
          {!operator ? '1️⃣ Primeiro valor' : 
           waitingSecondValue ? '2️⃣ Segundo valor' : 
           '✅ Pronto'}
        </div>
      )}

      {/* Calculation Display (expressão) - só mostra se não está mostrando resultado */}
      {calculationDisplay && !showingResult && (
        <div style={{
          fontSize: 13,
          color: '#64748b',
          marginBottom: 6,
          textAlign: 'right',
          fontFamily: 'monospace',
          minHeight: 20,
        }}>
          {calculationDisplay}
        </div>
      )}

      {/* Display (valor atual ou resultado completo) */}
      <div style={{
        background: '#f8fafc',
        padding: '16px 12px',
        borderRadius: 8,
        marginBottom: 12,
        fontSize: showingResult ? 20 : 28,
        fontWeight: 'bold',
        textAlign: 'right',
        fontFamily: 'monospace',
        color: showingResult ? '#22c55e' : '#1e293b',
        minHeight: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        border: '1px solid #e2e8f0',
      }}>
        {display}
      </div>

      {/* Buttons */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 6,
      }}>
        <button
          onClick={handleClear}
          style={{
            padding: 12,
            border: 'none',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            background: '#fee2e2',
            color: '#dc2626',
            gridColumn: 'span 2',
          }}
        >
          C
        </button>
        <button
          onClick={() => handleOperator('/')}
          disabled={!currentCardId || waitingSecondValue}
          style={{
            padding: 12,
            border: 'none',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: currentCardId && !waitingSecondValue ? 'pointer' : 'not-allowed',
            background: currentCardId && !waitingSecondValue ? '#fed7aa' : '#f1f5f9',
            color: currentCardId && !waitingSecondValue ? '#f97316' : '#cbd5e1',
          }}
        >
          ÷
        </button>
        <button
          onClick={() => handleOperator('*')}
          disabled={!currentCardId || waitingSecondValue}
          style={{
            padding: 12,
            border: 'none',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: currentCardId && !waitingSecondValue ? 'pointer' : 'not-allowed',
            background: currentCardId && !waitingSecondValue ? '#dbeafe' : '#f1f5f9',
            color: currentCardId && !waitingSecondValue ? '#3b82f6' : '#cbd5e1',
          }}
        >
          ×
        </button>

        {['7', '8', '9'].map(n => (
          <button
            key={n}
            onClick={() => handleDigit(n)}
            style={{
              padding: 12,
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              background: '#f1f5f9',
              color: '#1e293b',
            }}
          >
            {n}
          </button>
        ))}
        <button
          onClick={() => handleOperator('-')}
          disabled={!currentCardId || waitingSecondValue}
          style={{
            padding: 12,
            border: 'none',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: currentCardId && !waitingSecondValue ? 'pointer' : 'not-allowed',
            background: currentCardId && !waitingSecondValue ? '#fee2e2' : '#f1f5f9',
            color: currentCardId && !waitingSecondValue ? '#ef4444' : '#cbd5e1',
          }}
        >
          −
        </button>

        {['4', '5', '6'].map(n => (
          <button
            key={n}
            onClick={() => handleDigit(n)}
            style={{
              padding: 12,
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              background: '#f1f5f9',
              color: '#1e293b',
            }}
          >
            {n}
          </button>
        ))}
        <button
          onClick={() => handleOperator('+')}
          disabled={!currentCardId || waitingSecondValue}
          style={{
            padding: 12,
            border: 'none',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: currentCardId && !waitingSecondValue ? 'pointer' : 'not-allowed',
            background: currentCardId && !waitingSecondValue ? '#dcfce7' : '#f1f5f9',
            color: currentCardId && !waitingSecondValue ? '#22c55e' : '#cbd5e1',
          }}
        >
          +
        </button>

        {['1', '2', '3'].map(n => (
          <button
            key={n}
            onClick={() => handleDigit(n)}
            style={{
              padding: 12,
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              background: '#f1f5f9',
              color: '#1e293b',
            }}
          >
            {n}
          </button>
        ))}
        <button
          onClick={handleEquals}
          disabled={!currentCardId || !operator || !waitingSecondValue}
          style={{
            padding: 12,
            border: 'none',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: currentCardId && operator && waitingSecondValue ? 'pointer' : 'not-allowed',
            background: currentCardId && operator && waitingSecondValue ? '#22c55e' : '#f1f5f9',
            color: currentCardId && operator && waitingSecondValue ? '#ffffff' : '#cbd5e1',
            gridRow: 'span 2',
          }}
        >
          =
        </button>

        <button
          onClick={() => handleDigit('0')}
          style={{
            padding: 12,
            border: 'none',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            background: '#f1f5f9',
            color: '#1e293b',
            gridColumn: 'span 2',
          }}
        >
          0
        </button>
        <button
          onClick={handleDecimal}
          style={{
            padding: 12,
            border: 'none',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            background: '#f1f5f9',
            color: '#1e293b',
          }}
        >
          .
        </button>
      </div>
    </div>
  )
}
