import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { MOCK_CLIENTS } from '../data/mockData'

const STATUS_COLOR: Record<string, { color: string; bg: string }> = {
  ativo:     { color: 'var(--green)', bg: 'rgba(0,255,136,0.08)' },
  prospecto: { color: 'var(--accent)', bg: 'var(--accent-glow)' },
  demo:      { color: 'var(--cyan)', bg: 'rgba(0,212,255,0.08)' },
  inativo:   { color: 'var(--text-3)', bg: 'var(--bg-hover)' },
}

export default function Clientes() {
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px', maxWidth: 900 }}>
      <div className="flex items-start justify-between mb-8">
        <div>
          <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.08em', marginBottom: 6 }}>CRM</div>
          <h1 className="display" style={{ fontSize: 32, color: 'var(--text)', lineHeight: 1 }}>CLIENTES</h1>
        </div>
        <button
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            color: 'var(--text-2)', fontFamily: 'var(--f-mono)', fontSize: 11,
            padding: '9px 16px', borderRadius: 8, cursor: 'pointer',
          }}
        >
          <Plus size={13} /> NOVO CLIENTE
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {MOCK_CLIENTS.map(c => {
          const { color, bg } = STATUS_COLOR[c.status] || STATUS_COLOR.inativo
          return (
            <div
              key={c.slug}
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 20px' }}
            >
              <div className="flex items-center gap-4">
                {/* Avatar placeholder */}
                <div
                  className="display flex-shrink-0"
                  style={{
                    width: 44, height: 44, borderRadius: 10, background: 'var(--bg-hover)',
                    border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18, color: color,
                  }}
                >
                  {c.nome.charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <div className="flex items-center gap-3 mb-1">
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{c.nome}</div>
                    <span className="tag" style={{ color, background: bg, border: `1px solid ${color}30` }}>
                      {c.status.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-2)' }}>
                    {c.nicho}{c.cidade ? ` · ${c.cidade}` : ''}
                  </div>
                </div>
                <div className="text-right">
                  <div className="display" style={{ fontSize: 22, color: 'var(--text)', lineHeight: 1 }}>{c.missoes}</div>
                  <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--text-3)' }}>
                    {c.missoes === 1 ? 'MISSÃO' : 'MISSÕES'}
                  </div>
                </div>
                <Link
                  to={`/clientes/${c.slug}`}
                  style={{
                    fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--accent)',
                    background: 'var(--accent-glow)', border: '1px solid var(--border-accent)',
                    borderRadius: 6, padding: '6px 12px', textDecoration: 'none',
                    whiteSpace: 'nowrap',
                  }}
                >
                  ABRIR →
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
