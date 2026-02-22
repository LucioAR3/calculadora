import { useState, useRef, useEffect } from 'react'
import { useReactFlow, useViewport } from '@xyflow/react'
import { useStore } from '../store'

interface Props {
  onOpenCalc: () => void
}

const ZOOM_LEVELS = [10, 25, 50, 75, 100, 150, 200, 300, 400]

type AppMode = 'basico' | 'financeiro'

export default function BottomToolbar({ onOpenCalc }: Props) {
  const [zoomOpen, setZoomOpen] = useState(false)
  const [mode, setMode] = useState<AppMode>('basico')
  const zoomRef = useRef<HTMLDivElement>(null)
  const { addNode } = useStore()
  const { setViewport } = useReactFlow()
  const { x, y, zoom } = useViewport()

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (zoomRef.current && !zoomRef.current.contains(e.target as Node)) {
        setZoomOpen(false)
      }
    }
    if (zoomOpen) document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [zoomOpen])

  const zoomPct = Math.round(zoom * 100)

  const handleZoom = (percent: number) => {
    setViewport({ x, y, zoom: percent / 100 }, { duration: 200 })
    setZoomOpen(false)
  }

  const handleAddOrigem = () => {
    addNode('origem', { x: -x / zoom + 200, y: -y / zoom + 200 })
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      background: '#ffffff',
      padding: '8px 12px',
      borderRadius: 12,
      boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
    }}>
      {/* Add Origem */}
      <button
        onClick={handleAddOrigem}
        style={{
          background: '#3b82f6',
          color: '#ffffff',
          border: 'none',
          padding: '10px 20px',
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = '#2563eb'}
        onMouseLeave={(e) => e.currentTarget.style.background = '#3b82f6'}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M8 3v10M3 8h10" />
        </svg>
        Adicionar
      </button>

      {/* Divider */}
      <div style={{ width: 1, height: 24, background: '#e2e8f0' }} />

      {/* Calculator */}
      <button
        onClick={onOpenCalc}
        style={{
          background: 'none',
          border: 'none',
          padding: 8,
          borderRadius: 8,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          color: '#64748b',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
        title="Calculadora"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="4" y="2" width="12" height="16" rx="2" />
          <path d="M7 5h6M7 8h2M11 8h2M7 11h2M11 11h2M7 14h2M11 14h2" />
        </svg>
      </button>

      {/* Divider */}
      <div style={{ width: 1, height: 24, background: '#e2e8f0' }} />

      {/* Zoom */}
      <div ref={zoomRef} style={{ position: 'relative' }}>
        <button
          onClick={() => setZoomOpen(!zoomOpen)}
          style={{
            background: 'none',
            border: 'none',
            padding: '8px 12px',
            borderRadius: 8,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            color: '#64748b',
            fontSize: 13,
            fontWeight: 600,
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="7" cy="7" r="4" />
            <path d="M10 10l3 3" />
          </svg>
          {zoomPct}%
          <svg 
            width="12" 
            height="12" 
            viewBox="0 0 12 12" 
            fill="currentColor"
            style={{
              transform: zoomOpen ? 'rotate(180deg)' : 'rotate(0)',
              transition: 'transform 0.2s',
            }}
          >
            <path d="M2 4l4 4 4-4" />
          </svg>
        </button>

        {/* Zoom Dropdown */}
        {zoomOpen && (
          <div style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginBottom: 8,
            background: '#ffffff',
            borderRadius: 8,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            padding: '4px 0',
            minWidth: 120,
          }}>
            {ZOOM_LEVELS.map(level => (
              <button
                key={level}
                onClick={() => handleZoom(level)}
                style={{
                  width: '100%',
                  padding: '8px 16px',
                  border: 'none',
                  background: Math.abs(zoomPct - level) < 5 ? '#eff6ff' : 'none',
                  textAlign: 'center',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: Math.abs(zoomPct - level) < 5 ? 600 : 400,
                  color: Math.abs(zoomPct - level) < 5 ? '#3b82f6' : '#1e293b',
                }}
                onMouseEnter={(e) => {
                  if (Math.abs(zoomPct - level) >= 5) {
                    e.currentTarget.style.background = '#f1f5f9'
                  }
                }}
                onMouseLeave={(e) => {
                  if (Math.abs(zoomPct - level) >= 5) {
                    e.currentTarget.style.background = 'none'
                  }
                }}
              >
                {level}%
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Divider */}
      <div style={{ width: 1, height: 24, background: '#e2e8f0' }} />

      {/* Modo: Básico (verde) e Financeiro (lilás) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <button
          onClick={() => setMode('basico')}
          title="Modo básico"
          style={{
            padding: 8,
            borderRadius: 8,
            border: 'none',
            cursor: 'pointer',
            background: mode === 'basico' ? 'rgba(34, 197, 94, 0.2)' : 'none',
            color: mode === 'basico' ? '#16a34a' : '#22c55e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            fontSize: 18,
            fontWeight: 500,
            fontFamily: 'system-ui, sans-serif',
          }}
          onMouseEnter={(e) => {
            if (mode !== 'basico') e.currentTarget.style.background = 'rgba(34, 197, 94, 0.1)'
          }}
          onMouseLeave={(e) => {
            if (mode !== 'basico') e.currentTarget.style.background = 'none'
          }}
        >
          α
        </button>
        <span title="Modo financeiro">
        <button
          disabled
          style={{
            padding: 8,
            borderRadius: 8,
            border: 'none',
            cursor: 'default',
            background: 'none',
            color: '#a855f7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            fontSize: 18,
            fontWeight: 700,
            fontFamily: 'system-ui, sans-serif',
            opacity: 0.6,
          }}
        >
          π
        </button>
        </span>
      </div>
    </div>
  )
}
