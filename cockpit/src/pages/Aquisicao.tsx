import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Info, Radar, Send, Target } from 'lucide-react'
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

const STATUS_ORDER: (Signal['status'] | 'all')[] = ['all', 'novo', 'abordado', 'negociando', 'fechado', 'perdido']

const s = {
  page: { flex: 1, overflowY: 'auto' as const, padding: '28px 30px 90px', maxWidth: 1180, width: '100%' },
  grid4: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 14 },
  stat: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 11, padding: '15px 17px' },
  statV: { fontFamily: 'var(--f-display)', fontSize: 30, lineHeight: 1, marginBottom: 4 },
  statL: { fontSize: 12, color: 'var(--text)', fontWeight: 600, marginBottom: 2 },
  statS: { fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--text-3)', textTransform: 'uppercase' as const },
  panel: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 13, padding: 18 },
  card: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 11, padding: '15px 17px', marginBottom: 10, transition: 'border-color .15s' },
  tag: { fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.07em', textTransform: 'uppercase' as const, padding: '3px 8px', borderRadius: 5, border: '1px solid transparent' },
}

const ScoreDot = ({ score }: { score: number }) => {
  const color = score >= 8 ? 'var(--green)' : score >= 6 ? 'var(--amber)' : 'var(--red)'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}` }} />
      <span style={{ fontFamily: 'var(--f-display)', fontSize: 20, color, lineHeight: 1 }}>{score}</span>
      <span style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--text-3)' }}>/10</span>
    </div>
  )
}

export default function Aquisicao() {
  const [filter, setFilter] = useState<Signal['status'] | 'all'>('all')

  const filtered = MOCK_SIGNALS.filter(signal => filter === 'all' || signal.status === filter)
  const counts = {
    novo: MOCK_SIGNALS.filter(signal => signal.status === 'novo').length,
    abordado: MOCK_SIGNALS.filter(signal => signal.status === 'abordado').length,
    negociando: MOCK_SIGNALS.filter(signal => signal.status === 'negociando').length,
    fechado: MOCK_SIGNALS.filter(signal => signal.status === 'fechado').length,
    scoreAlto: MOCK_SIGNALS.filter(signal => signal.score >= 8).length,
  }

  return (
    <div style={s.page}>
      <header style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20, marginBottom: 24, flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'var(--text-3)', font: '10px var(--f-mono)', letterSpacing: '0.1em', marginBottom: 8 }}>
            <Radar size={12} /> PIPELINE DE AQUISIÇÃO
          </div>
          <h1 style={{ fontFamily: 'var(--f-display)', fontSize: 34, color: 'var(--text)', lineHeight: 1, marginBottom: 6, letterSpacing: '0.01em' }}>AQUISIÇÃO</h1>
          <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.06em' }}>SINAIS DETECTADOS POR FONTE</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 12px', border: '1px dashed var(--border-bright)', borderRadius: 9, color: 'var(--text-3)', font: '10px var(--f-mono)', maxWidth: 340 }}>
          <Info size={12} style={{ color: 'var(--amber)', flexShrink: 0 }} />
          <span>Visualização local de demonstração — os sinais reais virão do coletor (data_sync).</span>
        </div>
      </header>

      <div style={s.grid4}>
        <Stat value={String(counts.novo)} label="Sinais novos" color="var(--accent)" sub="prioridade de abordagem" />
        <Stat value={String(counts.negociando)} label="Em negociação" color="var(--amber)" sub="follow-up ativo" />
        <Stat value={String(counts.fechado)} label="Fechados" color="var(--green)" sub="convertidos" />
        <Stat value={String(counts.scoreAlto)} label="Score 8+ (alto)" color="var(--cyan)" sub="melhores oportunidades" />
      </div>

      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 16 }}>
        {STATUS_ORDER.map(status => {
          const active = filter === status
          return (
            <button
              key={status}
              onClick={() => setFilter(status)}
              style={{
                fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.05em',
                padding: '6px 12px', borderRadius: 999, cursor: 'pointer',
                background: active ? 'var(--accent)' : 'var(--bg-card)',
                color: active ? '#070907' : 'var(--text-2)',
                border: `1px solid ${active ? 'var(--accent)' : 'var(--border-bright)'}`,
                fontWeight: active ? 700 : 400,
                transition: 'all 0.15s',
              }}
            >
              {status === 'all' ? 'TODOS' : STATUS_LABELS[status]}
              <span style={{ opacity: 0.6, marginLeft: 5 }}>{status === 'all' ? MOCK_SIGNALS.length : counts[status as keyof typeof counts] ?? 0}</span>
            </button>
          )
        })}
      </div>

      <div style={s.panel}>
        {filtered.length === 0 && <div style={{ color: 'var(--text-3)', fontSize: 12, textAlign: 'center', padding: '26px 0' }}>Nenhum sinal neste estado.</div>}
        {filtered.map(signal => {
          const { color, bg } = STATUS_COLORS[signal.status]
          return (
            <div
              key={signal.id}
              style={{ ...s.card, borderColor: 'var(--border)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-bright)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                <ScoreDot score={signal.score} />
                <div style={{ flex: 1, minWidth: 240 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 5 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{signal.empresa}</span>
                    <span style={{ ...s.tag, color, background: bg, borderColor: `${color}30` }}>{STATUS_LABELS[signal.status]}</span>
                    <span style={{ ...s.tag, color: 'var(--text-3)', background: 'var(--bg-hover)', borderColor: 'var(--border)' }}>{signal.fonte}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 4 }}>{signal.nicho}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--f-mono)' }}>{signal.evento}</div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <Link
                    to="/missoes/nova"
                    style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--accent)', background: 'var(--accent-glow)', border: '1px solid var(--border-accent)', borderRadius: 7, padding: '7px 12px', textDecoration: 'none' }}
                  >
                    <Target size={11} /> MISSÃO
                  </Link>
                  <button style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--text-2)', background: 'var(--bg-hover)', border: '1px solid var(--border)', borderRadius: 7, padding: '7px 12px', cursor: 'pointer' }}>
                    <Send size={11} /> ABORDAR
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 14, color: 'var(--text-3)', fontFamily: 'var(--f-mono)', fontSize: 10 }}>
        <ArrowUpRight size={12} /> Pipeline local — dados de exemplo até o coletor de sinais ser ativado.
      </div>
    </div>
  )
}

function Stat({ value, label, color, sub }: { value: string; label: string; color: string; sub: string }) {
  return (
    <div style={s.stat}>
      <div style={{ ...s.statV, color }}>{value}</div>
      <div style={s.statL}>{label}</div>
      <div style={s.statS}>{sub}</div>
    </div>
  )
}
