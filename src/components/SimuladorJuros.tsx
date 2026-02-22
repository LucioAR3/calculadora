/**
 * Painel do simulador de juros simples.
 * Consome o Financial Engine (adaptador UI → engine); sem lógica financeira aqui.
 */

import { useState, useCallback } from 'react'
import { simulateSimpleInterest } from '../financial'

interface Props {
  onClose: () => void
}

export default function SimuladorJuros({ onClose }: Props) {
  const [principal, setPrincipal] = useState('1000')
  const [ratePct, setRatePct] = useState('1')
  const [periods, setPeriods] = useState('12')
  const [result, setResult] = useState<ReturnType<typeof simulateSimpleInterest> | null>(null)

  const handleSimulate = useCallback(() => {
    const p = parseFloat(principal)
    const r = parseFloat(ratePct) / 100
    const n = Math.floor(parseFloat(periods))
    if (Number.isNaN(p) || Number.isNaN(r) || Number.isNaN(n) || p < 0 || n < 0) {
      setResult(null)
      return
    }
    const res = simulateSimpleInterest({
      kind: 'simple_interest',
      principal: p,
      ratePerPeriod: r,
      periods: n,
    })
    setResult(res)
  }, [principal, ratePct, periods])

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1100,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 12,
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          padding: 24,
          minWidth: 320,
          maxWidth: 400,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 18, color: '#7c3aed' }}>Simulador — Juros simples</h2>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 20,
              color: '#64748b',
              padding: 4,
            }}
            aria-label="Fechar"
          >
            ×
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 13, color: '#475569' }}>Principal (R$)</span>
            <input
              type="number"
              min="0"
              step="100"
              value={principal}
              onChange={(e) => setPrincipal(e.target.value)}
              style={{ padding: 8, borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14 }}
            />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 13, color: '#475569' }}>Taxa por período (%)</span>
            <input
              type="number"
              min="0"
              step="0.1"
              value={ratePct}
              onChange={(e) => setRatePct(e.target.value)}
              style={{ padding: 8, borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14 }}
            />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 13, color: '#475569' }}>Períodos</span>
            <input
              type="number"
              min="0"
              step="1"
              value={periods}
              onChange={(e) => setPeriods(e.target.value)}
              style={{ padding: 8, borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14 }}
            />
          </label>

          <button
            type="button"
            onClick={handleSimulate}
            style={{
              padding: '10px 16px',
              background: '#7c3aed',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 600,
              marginTop: 8,
            }}
          >
            Simular
          </button>

          {result && (
            <div
              style={{
                marginTop: 16,
                padding: 16,
                background: '#f5f3ff',
                borderRadius: 8,
                fontSize: 14,
                color: '#1e293b',
              }}
            >
              <div style={{ marginBottom: 4 }}><strong>Juros:</strong> R$ {result.interest.toFixed(2)}</div>
              <div><strong>Montante:</strong> R$ {result.amount.toFixed(2)}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
