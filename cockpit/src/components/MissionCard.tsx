import { Link } from 'react-router-dom'
import { ArrowRight, Globe, FileText, Radio, Zap } from 'lucide-react'
import type { Mission } from '../types'

const MODE_LABEL: Record<Mission['modo'], string> = {
  prospeccao: 'Site Prospecção',
  premium: 'Site Premium',
  conteudo: 'Conteúdo',
  aquisicao: 'Aquisição',
}

const MODE_ICON: Record<Mission['modo'], React.ReactNode> = {
  prospeccao: <Globe size={11} />,
  premium: <Zap size={11} />,
  conteudo: <FileText size={11} />,
  aquisicao: <Radio size={11} />,
}

const STATUS_CONFIG: Record<Mission['status'], { label: string; color: string }> = {
  draft:   { label: 'RASCUNHO', color: 'var(--text-3)' },
  running: { label: 'EXECUTANDO', color: 'var(--accent)' },
  done:    { label: 'CONCLUÍDA', color: 'var(--green)' },
  error:   { label: 'ERRO', color: 'var(--red)' },
  paused:  { label: 'PAUSADA', color: 'var(--amber)' },
}

export default function MissionCard({ mission }: { mission: Mission }) {
  const { label: statusLabel, color: statusColor } = STATUS_CONFIG[mission.status]
  const doneSteps = mission.steps.filter(s => s.status === 'done').length
  const totalSteps = mission.steps.length
  const progress = totalSteps > 0 ? (doneSteps / totalSteps) * 100 : 0

  return (
    <Link
      to={`/missoes/${mission.id}`}
      style={{
        display: 'block',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        padding: '16px 18px',
        textDecoration: 'none',
        transition: 'border-color 0.2s, background 0.2s',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-bright)'
        ;(e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
        ;(e.currentTarget as HTMLElement).style.background = 'var(--bg-card)'
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="tag flex items-center gap-1"
            style={{ color: 'var(--cyan)', background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)' }}
          >
            {MODE_ICON[mission.modo]}
            {MODE_LABEL[mission.modo]}
          </span>
          <span
            className="tag"
            style={{ color: statusColor, background: `${statusColor}12`, border: `1px solid ${statusColor}30` }}
          >
            {mission.status === 'running' && <span className="pulse inline-block mr-1" style={{ width: 5, height: 5, borderRadius: '50%', background: statusColor }} />}
            {statusLabel}
          </span>
        </div>
        <ArrowRight size={14} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
      </div>

      {/* Title */}
      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 4, lineHeight: 1.3 }}>
        {mission.nome}
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 12 }}>
        {mission.empresa}{mission.cidade ? ` · ${mission.cidade}` : ''}
      </div>

      {/* Progress bar */}
      {totalSteps > 0 && (
        <div>
          <div className="flex justify-between items-center mb-1">
            <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--text-3)' }}>
              {doneSteps}/{totalSteps} etapas
            </span>
            <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: statusColor }}>
              {Math.round(progress)}%
            </span>
          </div>
          <div style={{ height: 3, background: 'var(--bg-hover)', borderRadius: 2, overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${progress}%`,
                background: progress === 100 ? 'var(--green)' : 'var(--accent)',
                borderRadius: 2,
                transition: 'width 0.6s ease',
                boxShadow: progress === 100 ? '0 0 8px rgba(0,255,136,0.4)' : '0 0 8px var(--accent-glow-strong)',
              }}
            />
          </div>
        </div>
      )}
    </Link>
  )
}
