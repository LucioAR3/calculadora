import { useState, useRef, useEffect, type CSSProperties } from 'react'
import { useReactFlow, useViewport } from '@xyflow/react'
import { useStore } from '../store'

interface Props {
  onToggleTable: () => void
  tableOpen: boolean
}

const ZOOM_LEVELS = [10, 25, 50, 75, 100, 150, 200, 300, 400]

const dropupBtnStyle: CSSProperties = {
  width: '100%',
  padding: '10px 16px',
  border: 'none',
  background: 'none',
  cursor: 'pointer',
  fontSize: 13,
  textAlign: 'left',
  color: '#1e293b',
  display: 'flex',
  alignItems: 'center',
  gap: 8,
}

export default function BottomToolbar({ onToggleTable, tableOpen }: Props) {
  const [zoomOpen, setZoomOpen] = useState(false)
  const [addDropupOpen, setAddDropupOpen] = useState(false)
  const zoomRef = useRef<HTMLDivElement>(null)
  const addDropupRef = useRef<HTMLDivElement>(null)
  const { addNode, updateNode, getPositionForNewFlow } = useStore()
  const { setViewport } = useReactFlow()
  const { x, y, zoom } = useViewport()

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node
      if (zoomRef.current && !zoomRef.current.contains(target)) setZoomOpen(false)
      if (addDropupRef.current && !addDropupRef.current.contains(target)) setAddDropupOpen(false)
    }
    if (zoomOpen || addDropupOpen) document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [zoomOpen, addDropupOpen])

  const zoomPct = Math.round(zoom * 100)

  const handleZoom = (percent: number) => {
    setViewport({ x, y, zoom: percent / 100 }, { duration: 200 })
    setZoomOpen(false)
  }

  const handleAddOrigem = () => {
    addNode('origem', getPositionForNewFlow())
    setAddDropupOpen(false)
  }

  const handleAddEtapa = () => {
    addNode('etapa', getPositionForNewFlow())
    setAddDropupOpen(false)
  }

  const handleAddResult = () => {
    const id = addNode('resultado', getPositionForNewFlow())
    updateNode(id, { title: 'Resultado' })
    setAddDropupOpen(false)
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
      <div ref={addDropupRef} style={{ position: 'relative' }}>
        <button
          onClick={() => setAddDropupOpen(!addDropupOpen)}
          style={{
            background: addDropupOpen ? '#2563eb' : '#3b82f6',
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
          onMouseLeave={(e) => { if (!addDropupOpen) e.currentTarget.style.background = '#3b82f6' }}
          title="Adicionar nó (Origem, Etapa ou Result)"
          aria-label="Abrir menu adicionar"
        >
          <span style={{ fontSize: 16 }}>+</span>
          Adicionar
        </button>
        {addDropupOpen && (
          <div style={{
            position: 'absolute',
            bottom: '100%',
            left: 0,
            marginBottom: 6,
            background: '#fff',
            borderRadius: 8,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            padding: '4px 0',
            minWidth: 160,
            zIndex: 1100,
          }}>
            <button
              type="button"
              onClick={handleAddOrigem}
              style={dropupBtnStyle}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#f0f9ff' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'none' }}
            >
              <span style={{ color: '#0ea5e9' }}>●</span> Origem
            </button>
            <button
              type="button"
              onClick={handleAddEtapa}
              style={dropupBtnStyle}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#f0fdf4' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'none' }}
            >
              <span style={{ color: '#22c55e' }}>●</span> Etapa
            </button>
            <button
              type="button"
              onClick={handleAddResult}
              style={dropupBtnStyle}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'none' }}
            >
              <span style={{ color: '#64748b' }}>→</span> Result
            </button>
          </div>
        )}
      </div>

      <div style={{ width: 1, height: 24, background: '#e2e8f0' }} />

      <button
        type="button"
        onClick={onToggleTable}
        style={{
          background: tableOpen ? '#e0f2fe' : 'none',
          border: 'none',
          padding: 8,
          borderRadius: 8,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: tableOpen ? '#0369a1' : '#64748b',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => { if (!tableOpen) e.currentTarget.style.background = '#f1f5f9' }}
        onMouseLeave={(e) => { if (!tableOpen) e.currentTarget.style.background = 'none' }}
        title="Tabela do fluxo"
        aria-label={tableOpen ? 'Fechar tabela do fluxo' : 'Abrir tabela do fluxo'}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 3h18v18H3z" />
          <path d="M3 9h18" />
          <path d="M3 15h18" />
          <path d="M9 3v18" />
          <path d="M15 3v18" />
        </svg>
      </button>

      <div style={{ width: 1, height: 24, background: '#e2e8f0' }} />

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
    </div>
  )
}
