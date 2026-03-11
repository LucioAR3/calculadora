/**
 * Aviso temporário (toast) exibido acima do menu de ferramentas.
 * Some sozinho após alguns segundos; usuário pode fechar pelo botão.
 */

import { useEffect } from 'react'
import { useStore } from '../store'

const DURATION_MS = 6000
/** Acima da toolbar flutuante (bottom 24 + altura ~48 + margem 12). */
const BOTTOM_OFFSET = 84

export default function FlashMessage() {
  const flashMessage = useStore(s => s.flashMessage)
  const setFlashMessage = useStore(s => s.setFlashMessage)

  useEffect(() => {
    if (!flashMessage) return
    const t = setTimeout(() => setFlashMessage(null), DURATION_MS)
    return () => clearTimeout(t)
  }, [flashMessage, setFlashMessage])

  if (!flashMessage) return null

  const handleClose = () => setFlashMessage(null)

  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: BOTTOM_OFFSET,
        left: '50%',
        transform: 'translateX(-50%)',
        maxWidth: 'min(420px, calc(100vw - 32px))',
        padding: '12px 16px',
        background: '#1e293b',
        color: '#f8fafc',
        fontSize: 13,
        lineHeight: 1.45,
        borderRadius: 10,
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
        zIndex: 9998,
        border: '1px solid #334155',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') handleClose()
      }}
    >
      <span style={{ flex: 1 }}>{flashMessage.text}</span>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          handleClose()
        }}
        aria-label="Fechar"
        style={{
          flexShrink: 0,
          background: 'none',
          border: 'none',
          color: '#f8fafc',
          padding: 4,
          borderRadius: 6,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(248, 250, 252, 0.15)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'none'
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
          <path d="M4 4l8 8M12 4l-8 8" />
        </svg>
      </button>
    </div>
  )
}
