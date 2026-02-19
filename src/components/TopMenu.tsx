import { useState, useRef, useEffect } from 'react'
import { useStore } from '../store'

interface Props {
  projectName: string
  onNameChange: (name: string) => void
}

export default function TopMenu({ projectName, onNameChange }: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { nodes, edges, loadFlow } = useStore()

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleSave = () => {
    const data = {
      projectName,
      nodes,
      edges,
      timestamp: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${projectName.replace(/\s+/g, '-')}-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    setMenuOpen(false)
  }

  const handleOpen = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string)
        if (data.nodes && data.edges) {
          loadFlow({ nodes: data.nodes, edges: data.edges })
          if (data.projectName != null) onNameChange(String(data.projectName))
        }
      } catch {
        alert('Arquivo inválido. Use um JSON exportado pelo projeto.')
      }
      e.target.value = ''
    }
    reader.readAsText(file)
    setMenuOpen(false)
  }

  const handleExit = () => {
    if (confirm('Deseja sair? Alterações não salvas serão perdidas.')) {
      window.location.reload()
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: 16,
      left: 16,
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
    }}>
      {/* Nome do Projeto */}
      <div style={{
        background: '#ffffff',
        padding: '12px 16px',
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        minWidth: 200,
      }}>
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={projectName}
            onChange={(e) => onNameChange(e.target.value)}
            onBlur={() => setIsEditing(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') setIsEditing(false)
            }}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: 14,
              fontWeight: 600,
              color: '#1e293b',
              background: 'transparent',
            }}
          />
        ) : (
          <div
            onClick={() => setIsEditing(true)}
            style={{
              flex: 1,
              fontSize: 14,
              fontWeight: 600,
              color: '#1e293b',
              cursor: 'text',
            }}
          >
            {projectName}
          </div>
        )}
        
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 4,
            display: 'flex',
            alignItems: 'center',
            color: '#64748b',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="8" cy="3" r="1.5" />
            <circle cx="8" cy="8" r="1.5" />
            <circle cx="8" cy="13" r="1.5" />
          </svg>
        </button>
      </div>

      {/* Menu Dropdown */}
      {menuOpen && (
        <div style={{
          background: '#ffffff',
          borderRadius: 8,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          overflow: 'hidden',
          minWidth: 200,
        }}>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <button
            onClick={handleOpen}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: 'none',
              background: 'none',
              textAlign: 'left',
              cursor: 'pointer',
              fontSize: 14,
              color: '#1e293b',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2 6h12l-2 6H4L2 6zM2 6l2-4h8l2 4" />
            </svg>
            Abrir Projeto
          </button>
          <button
            onClick={handleSave}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: 'none',
              background: 'none',
              textAlign: 'left',
              cursor: 'pointer',
              fontSize: 14,
              color: '#1e293b',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M13 13v-3H3v3M11 3v5H5V3M2 2h12v12H2z" />
            </svg>
            Salvar Projeto
          </button>
          
          <div style={{ height: 1, background: '#e2e8f0', margin: '4px 0' }} />
          
          <button
            onClick={handleExit}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: 'none',
              background: 'none',
              textAlign: 'left',
              cursor: 'pointer',
              fontSize: 14,
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 14H3a1 1 0 01-1-1V3a1 1 0 011-1h3M11 11l3-3-3-3M14 8H6" />
            </svg>
            Sair
          </button>
        </div>
      )}

      {/* Info */}
      <div style={{
        background: 'rgba(255,255,255,0.9)',
        padding: '8px 12px',
        borderRadius: 6,
        fontSize: 12,
        color: '#64748b',
      }}>
        {Object.keys(nodes).length} cards • {edges.length} conexões
      </div>
    </div>
  )
}
