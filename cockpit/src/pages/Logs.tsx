import { useState, useEffect, useRef } from 'react'
import { Activity, Trash2 } from 'lucide-react'

interface LogEntry {
  id: string
  ts: string
  level: 'info' | 'ok' | 'warn' | 'error' | 'system' | 'mission'
  source: string
  msg: string
}

const LEVEL_COLOR: Record<LogEntry['level'], string> = {
  system:  '#44445A',
  info:    '#00D4FF',
  ok:      '#00FF88',
  warn:    '#FFB800',
  error:   '#FF2D55',
  mission: '#D4FF00',
}

const INITIAL_LOGS: LogEntry[] = [
  { id: '1', ts: '09:00:00.000', level: 'system',  source: 'cockpit',   msg: 'MarketingOS Cockpit v1.0 iniciado' },
  { id: '2', ts: '09:00:00.012', level: 'ok',      source: 'biblioteca', msg: 'Referências carregadas: 11 entries' },
  { id: '3', ts: '09:00:00.024', level: 'ok',      source: 'biblioteca', msg: 'Motion patterns: 8 padrões' },
  { id: '4', ts: '09:00:00.035', level: 'ok',      source: 'biblioteca', msg: 'Copy patterns: 6 estruturas' },
  { id: '5', ts: '09:00:01.140', level: 'info',    source: 'sinais',    msg: 'Sinais pendentes carregados: 2 novos, 1 em negociação' },
  { id: '6', ts: '09:00:01.200', level: 'mission', source: 'arq-santos', msg: 'Missão RUNNING: Copy Strategy em execução' },
  { id: '7', ts: '09:00:02.500', level: 'warn',    source: 'publisher', msg: 'Token Meta expirado — renovar antes de publicar' },
  { id: '8', ts: '09:00:03.000', level: 'system',  source: 'executor',  msg: 'Claude Code conectado — modelo claude-opus-4-8' },
]

const AUTO_LOGS = [
  { level: 'info'    as const, source: 'copy-engine',   msg: 'COPY_PATTERN_04 aplicado — Desejo antes da Solução' },
  { level: 'ok'      as const, source: 'copy-engine',   msg: 'Headline gerada: 34 tokens — específica ao nicho' },
  { level: 'info'    as const, source: 'references',    msg: 'Ref selecionada: ref-linear (layout) + ref-basement (visual)' },
  { level: 'mission' as const, source: 'arq-santos',    msg: 'Etapa Copy Strategy → DONE (1847ms)' },
  { level: 'info'    as const, source: 'arq-santos',    msg: 'Iniciando Page Structure...' },
  { level: 'warn'    as const, source: 'qa',            msg: 'Nenhuma animação de hero definida — motion pending' },
  { level: 'ok'      as const, source: 'motion',        msg: 'MOTION_01 (Hero Split Reveal) aplicado ao build' },
  { level: 'ok'      as const, source: 'build',         msg: 'index.html gerado — 1 arquivo, 34KB' },
  { level: 'ok'      as const, source: 'qa',            msg: 'Hero check: atenção em 2.1s — aprovado' },
  { level: 'ok'      as const, source: 'qa',            msg: 'Copy check: sem frases genéricas — aprovado' },
  { level: 'mission' as const, source: 'arq-santos',    msg: 'MISSÃO CONCLUÍDA — preview disponível' },
  { level: 'info'    as const, source: 'sinais',        msg: 'Novo sinal detectado: Studio Bloom (score 8)' },
]

export default function Logs() {
  const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS)
  const [autoPlay, setAutoPlay] = useState(false)
  const [blink, setBlink] = useState(true)
  const ref = useRef<HTMLDivElement>(null)

  const ts = () => {
    const d = new Date()
    return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}.${String(d.getMilliseconds()).padStart(3,'0')}`
  }

  useEffect(() => {
    const interval = setInterval(() => setBlink(b => !b), 500)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: 'smooth' })
  }, [logs])

  useEffect(() => {
    if (!autoPlay) return
    let idx = 0
    const interval = setInterval(() => {
      if (idx >= AUTO_LOGS.length) { setAutoPlay(false); return }
      const entry = AUTO_LOGS[idx++]
      setLogs(prev => [...prev, { id: `auto-${Date.now()}`, ts: ts(), ...entry }])
    }, 900 + Math.random() * 600)
    return () => clearInterval(interval)
  }, [autoPlay])

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '28px 32px', maxWidth: 900 }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.08em', marginBottom: 6 }}>MONITOR</div>
          <h1 className="display" style={{ fontSize: 32, color: 'var(--text)', lineHeight: 1 }}>SYSTEM LOGS</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setAutoPlay(p => !p)}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.05em',
              padding: '8px 16px', borderRadius: 7, border: 'none', cursor: 'pointer',
              background: autoPlay ? 'var(--accent)' : 'var(--bg-card)',
              color: autoPlay ? '#000' : 'var(--text-2)',
              fontWeight: autoPlay ? 700 : 400,
              transition: 'all 0.15s',
            }}
          >
            <Activity size={12} />
            {autoPlay ? 'SIMULANDO...' : 'SIMULAR RUN'}
          </button>
          <button
            onClick={() => setLogs(INITIAL_LOGS)}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              fontFamily: 'var(--f-mono)', fontSize: 11,
              padding: '8px 12px', borderRadius: 7, border: '1px solid var(--border)', cursor: 'pointer',
              background: 'transparent', color: 'var(--text-3)',
            }}
          >
            <Trash2 size={12} /> LIMPAR
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mb-4">
        {Object.entries(LEVEL_COLOR).map(([level, color]) => (
          <div key={level} className="flex items-center gap-1.5">
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
            <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.05em' }}>
              {level.toUpperCase()}
            </span>
          </div>
        ))}
      </div>

      {/* Terminal */}
      <div
        ref={ref}
        style={{
          flex: 1,
          background: '#040406',
          border: '1px solid var(--border)',
          borderRadius: 10,
          padding: '16px 20px',
          overflowY: 'auto',
          fontFamily: 'var(--f-mono)',
          fontSize: 12,
          lineHeight: '1.8',
          minHeight: 400,
        }}
      >
        {logs.map(log => (
          <div key={log.id} className="log-line flex gap-3">
            <span style={{ color: '#2C2C40', flexShrink: 0 }}>{log.ts}</span>
            <span style={{ color: LEVEL_COLOR[log.level], flexShrink: 0, minWidth: 52 }}>
              [{log.level.toUpperCase().padEnd(6)}]
            </span>
            <span style={{ color: '#44445A', flexShrink: 0, minWidth: 90 }}>{log.source}</span>
            <span style={{ color: log.level === 'mission' ? '#D4FF00' : log.level === 'error' ? '#FF2D55' : '#8080A0' }}>
              {log.msg}
            </span>
          </div>
        ))}
        <div className="flex gap-3">
          <span style={{ color: '#2C2C40' }}>{ts()}</span>
          <span style={{ color: '#D4FF00', opacity: blink ? 1 : 0, transition: 'opacity 0.1s' }}>█</span>
        </div>
      </div>
    </div>
  )
}
