import { useState } from 'react'
import { Radar, Send } from 'lucide-react'
import { MOCK_SIGNALS } from '../data/mockData'
import type { Signal } from '../types'

const STATUS_COLORS: Record<Signal['status'], { color: string; bg: string }> = {
  novo:        { color: 'var(--accent)', bg: 'var(--accent-glow)' },
  abordado:    { color: 'var(--cyan)', bg: 'rgba(0,212,255,0.08)' },
  negociando:  { color: 'var(--amber)', bg: 'rgba(255,184,0,0.08)' },
  fechado:     { color: 'var(--green)', bg: 'rgba(0,255,136,0.08)' },
  perdido:     { color: 'var(--text-3)', bg: 'var(--bg-hover)' },
}

const STATUS_LABELS: Record<Signal['status'], string> = {
  novo: 'NOVO', abordado: 'ABORDADO', negociando: 'NEGOCIANDO', fechado: 'FECHADO', perdido: 'PERDIDO',
}

const ScoreDot = ({ score }: { score: number }) => {
  const color = score >= 8 ? 'var(--green)' : score >= 6 ? 'var(--amber)' : 'var(--red)'
  return (
    <div className="flex items-center gap-1.5">
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
      <span className="display" style={{ fontSize: 20, color, lineHeight: 1 }}>{score}</span>
      <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--text-3)' }}>/10</span>
    </div>
  )
}

export default function Aquisicao() {
  const [filter, setFilter] = useState<Signal['status'] | 'all'>('all')

  const filtered = MOCK_SIGNALS.filter(s => filter === 'all' || s.status === filter)
  const novo = MOCK_SIGNALS.filter(s => s.status === 'novo').length
  const negociando = MOCK_SIGNALS.filter(s => s.status === 'negociando').length

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px', maxWidth: 960 }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.08em', marginBottom: 6 }}>PIPELINE</div>
        <h1 className="display" style={{ fontSize: 32, color: 'var(--text)', lineHeight: 1, marginBottom: 16 }}>AQUISIÇÃO</h1>

        {/* Stat row */}
        <div className="flex gap-4">
          {[
            { label: 'Sinais Novos', value: novo, color: 'var(--accent)' },
            { label: 'Em Negociação', value: negociando, color: 'var(--amber)' },
            { label: 'Total', value: MOCK_SIGNALS.length, color: 'var(--text-2)' },
          ].map(s => (
            <div key={s.label} style={{ padding: '12px 16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }}>
              <div className="display" style={{ fontSize: 26, color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--text-3)', marginTop: 3 }}>{s.label.toUpperCase()}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6">
        {(['all', 'novo', 'abordado', 'negociando', 'fechado', 'perdido'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.05em',
              padding: '5px 11px', borderRadius: 5, border: 'none', cursor: 'pointer',
              background: filter === f ? 'var(--accent)' : 'var(--bg-card)',
              color: filter === f ? '#000' : 'var(--text-2)',
              fontWeight: filter === f ? 700 : 400,
              transition: 'all 0.15s',
            }}
          >
            {f === 'all' ? 'TODOS' : STATUS_LABELS[f]}
          </button>
        ))}
      </div>

      {/* Signals */}
      <div className="flex flex-col gap-3">
        {filtered.map(sig => {
          const { color, bg } = STATUS_COLORS[sig.status]
          return (
            <div
              key={sig.id}
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 20px' }}
            >
              <div className="flex items-start gap-4">
                <ScoreDot score={sig.score} />
                <div style={{ flex: 1 }}>
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{sig.empresa}</div>
                    <span className="tag" style={{ color, background: bg, border: `1px solid ${color}30` }}>
                      {STATUS_LABELS[sig.status]}
                    </span>
                    <span className="tag" style={{ color: 'var(--text-3)', background: 'var(--bg-hover)', border: '1px solid var(--border)' }}>
                      {sig.fonte}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 6 }}>{sig.nicho}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)', fontFamily: 'var(--f-mono)' }}>{sig.evento}</div>
                </div>
                <div className="flex gap-2">
                  <button
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--accent)',
                      background: 'var(--accent-glow)', border: '1px solid var(--border-accent)',
                      borderRadius: 6, padding: '6px 12px', cursor: 'pointer',
                    }}
                  >
                    <Radar size={11} /> MISSÃO
                  </button>
                  <button
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--text-2)',
                      background: 'var(--bg-hover)', border: '1px solid var(--border)',
                      borderRadius: 6, padding: '6px 12px', cursor: 'pointer',
                    }}
                  >
                    <Send size={11} /> ABORDAR
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
