import { useStore } from '../store'
import { formatDecimalBR } from '../utils/numbers'

interface Props {
  onClose: () => void
}

export default function TabelaPanel({ onClose }: Props) {
  const getFlowTableRows = useStore(s => s.getFlowTableRows)
  const nodes = useStore(s => s.nodes)
  const values = useStore(s => s.values)
  const { headers, rows } = getFlowTableRows()

  const isEmpty = headers.length === 0

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        left: 24,
        zIndex: 900,
        background: '#ffffff',
        borderRadius: 12,
        boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
        minWidth: 220,
        maxWidth: 320,
        overflow: 'hidden',
      }}
      role="region"
      aria-label="Tabela do fluxo"
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 14px',
        borderBottom: '1px solid #e2e8f0',
        background: '#f8fafc',
        fontSize: 12,
        fontWeight: 700,
        color: '#475569',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
      }}>
        <span>Tabela do fluxo</span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar tabela"
          style={{
            background: 'none',
            border: 'none',
            padding: 4,
            cursor: 'pointer',
            color: '#64748b',
            fontSize: 18,
            lineHeight: 1,
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#1e293b' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#64748b' }}
        >
          ×
        </button>
      </div>
      <div style={{ padding: 12 }}>
        {isEmpty ? (
          <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
            Nenhum fluxo (adicione Origem → Etapas → Resultado).
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 180 }}>
              <thead>
                <tr>
                  {headers.map((h, j) => (
                    <th
                      key={j}
                      style={{
                        textAlign: j === 0 ? 'right' : j === headers.length - 1 ? 'right' : 'center',
                        padding: '8px 10px',
                        borderBottom: '1px solid #e2e8f0',
                        fontWeight: 600,
                        color: '#334155',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i}>
                    {row.map((val, j) => (
                      <td
                        key={j}
                        style={{
                          padding: '8px 10px',
                          borderBottom: '1px solid #f1f5f9',
                          textAlign: j === 0 ? 'right' : j === row.length - 1 ? 'right' : 'center',
                          fontWeight: j === row.length - 1 ? 600 : 400,
                          color: val !== null ? (j === row.length - 1 ? '#0f172a' : '#475569') : '#94a3b8',
                        }}
                      >
                        {val !== null ? formatDecimalBR(val) : '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
