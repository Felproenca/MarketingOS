import { Link } from 'react-router-dom'
import { Plus, Radar, FileText, Globe } from 'lucide-react'
import MissionCard from '../components/MissionCard'
import LogStream from '../components/LogStream'
import { MOCK_MISSIONS, MOCK_SIGNALS } from '../data/mockData'

const QUICK_ACTIONS = [
  { to: '/missoes/nova?modo=prospeccao', label: 'Nova Prospecção', icon: Globe, accent: 'var(--accent)' },
  { to: '/missoes/nova?modo=conteudo',   label: 'Criar Conteúdo',  icon: FileText, accent: 'var(--cyan)' },
  { to: '/aquisicao',                    label: 'Ver Sinais',      icon: Radar, accent: 'var(--amber)' },
]

const STATS = [
  { label: 'Missões Ativas', value: '1', color: 'var(--accent)', sub: 'esta semana' },
  { label: 'Sites Gerados', value: '2', color: 'var(--green)', sub: 'total' },
  { label: 'Sinais Novos', value: '2', color: 'var(--amber)', sub: 'aguardando' },
  { label: 'Clientes', value: '3', color: 'var(--cyan)', sub: 'no sistema' },
]

export default function Dashboard() {
  const runningMissions = MOCK_MISSIONS.filter(m => m.status === 'running')
  const recentMissions = MOCK_MISSIONS.slice(0, 3)
  const newSignals = MOCK_SIGNALS.filter(s => s.status === 'novo')

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px', maxWidth: 1100 }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1
            className="display"
            style={{ fontSize: 36, color: 'var(--text)', lineHeight: 1, marginBottom: 6 }}
          >
            COMMAND CENTER
          </h1>
          <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--text-3)', letterSpacing: '0.06em' }}>
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }).toUpperCase()}
          </div>
        </div>
        <Link
          to="/missoes/nova"
          className="flex items-center gap-2"
          style={{
            background: 'var(--accent)',
            color: '#000',
            fontWeight: 700,
            fontSize: 13,
            padding: '10px 18px',
            borderRadius: 8,
            textDecoration: 'none',
            fontFamily: 'var(--f-display)',
            letterSpacing: '0.04em',
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.85'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
        >
          <Plus size={15} strokeWidth={2.5} />
          NOVA MISSÃO
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-3 mb-8" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {STATS.map(stat => (
          <div
            key={stat.label}
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 18px' }}
          >
            <div className="display" style={{ fontSize: 32, color: stat.color, lineHeight: 1, marginBottom: 4 }}>
              {stat.value}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text)', fontWeight: 600, marginBottom: 2 }}>
              {stat.label}
            </div>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--text-3)' }}>
              {stat.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 360px' }}>
        {/* Left */}
        <div className="flex flex-col gap-6">
          {/* Quick actions */}
          <div>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.08em', marginBottom: 10 }}>
              AÇÕES RÁPIDAS
            </div>
            <div className="flex gap-3">
              {QUICK_ACTIONS.map(qa => (
                <Link
                  key={qa.to}
                  to={qa.to}
                  className="flex items-center gap-2 flex-1"
                  style={{
                    padding: '10px 14px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    textDecoration: 'none',
                    fontSize: 12,
                    fontWeight: 600,
                    color: qa.accent,
                    transition: 'border-color 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = qa.accent}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'}
                >
                  <qa.icon size={13} />
                  {qa.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Running mission alert */}
          {runningMissions.length > 0 && (
            <div
              style={{
                background: 'var(--accent-glow)',
                border: '1px solid var(--border-accent)',
                borderRadius: 10,
                padding: '14px 18px',
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="pulse" style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)' }} />
                <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--accent)', letterSpacing: '0.06em' }}>
                  MISSÃO EM EXECUÇÃO
                </span>
              </div>
              {runningMissions.map(m => {
                const running = m.steps.find(s => s.status === 'running')
                return (
                  <Link key={m.id} to={`/missoes/${m.id}`} style={{ textDecoration: 'none' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>{m.nome}</div>
                    {running && (
                      <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--accent)' }}>
                        → {running.label}
                      </div>
                    )}
                  </Link>
                )
              })}
            </div>
          )}

          {/* Recent missions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.08em' }}>
                MISSÕES RECENTES
              </div>
              <Link to="/missoes" style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--accent)', textDecoration: 'none' }}>
                VER TODAS →
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              {recentMissions.map(m => <MissionCard key={m.id} mission={m} />)}
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="flex flex-col gap-5">
          {/* Signals */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.08em' }}>
                SINAIS NOVOS
              </div>
              <Link to="/aquisicao" style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--amber)', textDecoration: 'none' }}>
                VER TODOS →
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              {newSignals.map(sig => (
                <div
                  key={sig.id}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    padding: '12px 14px',
                  }}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{sig.empresa}</div>
                    <div
                      className="tag"
                      style={{
                        color: sig.score >= 8 ? 'var(--green)' : sig.score >= 6 ? 'var(--amber)' : 'var(--text-2)',
                        background: 'var(--bg-hover)',
                        border: '1px solid var(--border)',
                        flexShrink: 0,
                      }}
                    >
                      {sig.score}/10
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-2)', marginBottom: 4 }}>{sig.nicho}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--f-mono)' }}>{sig.evento}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Log stream */}
          <div>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.08em', marginBottom: 10 }}>
              SYSTEM LOG
            </div>
            <LogStream />
          </div>
        </div>
      </div>
    </div>
  )
}
