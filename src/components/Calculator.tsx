import { useState, useEffect } from 'react'
import { useStore } from '../store'
import type { Operation } from '../types'

interface Props {
  onClose: () => void
}

export default function Calculator({ onClose }: Props) {
  const [display, setDisplay] = useState('0')
  const [currentCardId, setCurrentCardId] = useState<string | null>(null)
  const [operator, setOperator] = useState<Operation | null>(null)
  const [waitingSecondValue, setWaitingSecondValue] = useState(false)
  const [firstValue, setFirstValue] = useState<number | null>(null)
  const [calculationDisplay, setCalculationDisplay] = useState('')
  const [showingResult, setShowingResult] = useState(false)
  const [hasEnteredValueForCurrentStep, setHasEnteredValueForCurrentStep] = useState(false)
  
  const { addNode, updateNode, addEdge, addResultado, setFocusNodeId, getNextPositionFrom } = useStore()

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
      setHasEnteredValueForCurrentStep(true)
      return
    }
    
    if (waitingSecondValue) setHasEnteredValueForCurrentStep(true)
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
    if (waitingSecondValue && !hasEnteredValueForCurrentStep) return

    const opMap: Record<string, Operation> = {
      '+': '+',
      '-': '-',
      '*': '×',
      '/': '÷'
    }
    const operation = opMap[op]
    const { nodes } = useStore.getState()
    const sourceNode = nodes[currentCardId]
    if (!sourceNode) return

    if (waitingSecondValue) {
      updateNode(currentCardId, { value: parseFloat(display) || 0 })
    }

    const newPos = getNextPositionFrom(sourceNode.position)
    const newId = addNode('etapa', newPos)
    updateNode(newId, { operation, value: 0, title: 'Valor 2' })
    addEdge(currentCardId, newId, operation)

    setCurrentCardId(newId)
    setOperator(operation)
    setDisplay('0')
    setWaitingSecondValue(true)
    setHasEnteredValueForCurrentStep(false)
    setFirstValue(waitingSecondValue ? (parseFloat(display) || 0) : (firstValue ?? 0))
    setCalculationDisplay(
      waitingSecondValue
        ? `${calculationDisplay} ${display} ${operation}`
        : `${firstValue} ${operation}`
    )
    setFocusNodeId(newId)
  }

  const handleEquals = () => {
    if (!currentCardId || !operator || showingResult) return
    if (waitingSecondValue) {
      updateNode(currentCardId, { value: parseFloat(display) || 0 })
    }

    addResultado(currentCardId, { evalPrecedence: true })
    setShowingResult(true)
    setCalculationDisplay('')
  }

  const handleClear = () => {
    setDisplay('0')
    setCurrentCardId(null)
    setOperator(null)
    setWaitingSecondValue(false)
    setFirstValue(null)
    setCalculationDisplay('')
    setShowingResult(false)
    setHasEnteredValueForCurrentStep(false)
  }

  const handleDecimal = () => {
    if (!display.includes('.')) {
      setDisplay(prev => prev + '.')
      if (waitingSecondValue) setHasEnteredValueForCurrentStep(true)
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

      {/* Buttons */}
      {(() => {
        const opEnabled = currentCardId && !showingResult && (!waitingSecondValue || hasEnteredValueForCurrentStep)
        return (
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
          disabled={!opEnabled}
          style={{
            padding: 12,
            border: 'none',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: opEnabled ? 'pointer' : 'not-allowed',
            background: opEnabled ? '#fed7aa' : '#f1f5f9',
            color: opEnabled ? '#f97316' : '#cbd5e1',
          }}
        >
          ÷
        </button>
        <button
          onClick={() => handleOperator('*')}
          disabled={!opEnabled}
          style={{
            padding: 12,
            border: 'none',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: opEnabled ? 'pointer' : 'not-allowed',
            background: opEnabled ? '#dbeafe' : '#f1f5f9',
            color: opEnabled ? '#3b82f6' : '#cbd5e1',
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
          disabled={!opEnabled}
          style={{
            padding: 12,
            border: 'none',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: opEnabled ? 'pointer' : 'not-allowed',
            background: opEnabled ? '#fee2e2' : '#f1f5f9',
            color: opEnabled ? '#ef4444' : '#cbd5e1',
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
          disabled={!opEnabled}
          style={{
            padding: 12,
            border: 'none',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: opEnabled ? 'pointer' : 'not-allowed',
            background: opEnabled ? '#dcfce7' : '#f1f5f9',
            color: opEnabled ? '#22c55e' : '#cbd5e1',
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
          disabled={!currentCardId || !operator || !waitingSecondValue || showingResult || !hasEnteredValueForCurrentStep}
          style={{
            padding: 12,
            border: 'none',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: currentCardId && operator && waitingSecondValue && !showingResult && hasEnteredValueForCurrentStep ? 'pointer' : 'not-allowed',
            background: currentCardId && operator && waitingSecondValue && !showingResult && hasEnteredValueForCurrentStep ? '#22c55e' : '#f1f5f9',
            color: currentCardId && operator && waitingSecondValue && !showingResult && hasEnteredValueForCurrentStep ? '#ffffff' : '#cbd5e1',
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
        )
      })()}
    </div>
  )
}
