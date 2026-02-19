interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  count: number
  confirmText?: string
  cancelText?: string
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  count,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar'
}: ConfirmModalProps) {
  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: 12,
          padding: 24,
          maxWidth: 420,
          width: '90%',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ícone e Título */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 16,
        }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            background: '#fff7ed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
          }}>
            🔥
          </div>
          <h3 style={{
            margin: 0,
            fontSize: 18,
            fontWeight: 600,
            color: '#1f2937',
          }}>
            {title}
          </h3>
        </div>

        {/* Mensagem */}
        <p style={{
          margin: '0 0 16px 0',
          fontSize: 14,
          lineHeight: 1.6,
          color: '#6b7280',
        }}>
          {message}
        </p>

        {/* Contador de cards */}
        <div style={{
          background: '#fef3c7',
          border: '1px solid #fbbf24',
          borderRadius: 8,
          padding: 12,
          marginBottom: 20,
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <span style={{ fontSize: 18 }}>⚠️</span>
            <div>
              <div style={{
                fontSize: 13,
                fontWeight: 600,
                color: '#92400e',
                marginBottom: 2,
              }}>
                {count} card{count > 1 ? 's' : ''} será{count > 1 ? 'ão' : ''} excluído{count > 1 ? 's' : ''}
              </div>
              <div style={{
                fontSize: 12,
                color: '#78350f',
              }}>
                Esta ação não pode ser desfeita
              </div>
            </div>
          </div>
        </div>

        {/* Botões */}
        <div style={{
          display: 'flex',
          gap: 12,
          justifyContent: 'flex-end',
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              border: '1px solid #d1d5db',
              background: '#ffffff',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              color: '#374151',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f9fafb'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#ffffff'
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm()
              onClose()
            }}
            style={{
              padding: '10px 20px',
              border: 'none',
              background: '#f97316',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              color: '#ffffff',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#ea580c'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f97316'
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
