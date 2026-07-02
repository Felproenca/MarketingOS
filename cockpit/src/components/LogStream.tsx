import { useEffect, useRef, useState } from 'react'
import { Terminal } from 'lucide-react'

interface LogEntry {
  id: string
  ts: string
  level: 'info' | 'ok' | 'warn' | 'error' | 'system'
  msg: string
}

const LEVEL_COLOR: Record<LogEntry['level'], string> = {
  info:   'var(--cyan)',
  ok:     'var(--green)',
  warn:   'var(--amber)',
  error:  'var(--red)',
  system: 'var(--text-3)',
}

const LEVEL_PREFIX: Record<LogEntry['level'], string> = {
  info:   'INFO',
  ok:     ' OK ',
  warn:   'WARN',
  error:  ' ERR',
  system: ' SYS',
}

const DEMO_LOGS: LogEntry[] = [
  { id: '1', ts: '09:00:01', level: 'system', msg: 'MarketingOS Cockpit inicializado' },
  { id: '2', ts: '09:00:02', level: 'ok',     msg: 'Banco de referências carregado — 11 entries' },
  { id: '3', ts: '09:00:02', level: 'ok',     msg: 'Motion patterns carregados — 8 padrões' },
  { id: '4', ts: '09:00:03', level: 'info',   msg: 'Missão ARQ-Santos-SP em execução — Copy Strategy' },
  { id: '5', ts: '09:00:03', level: 'info',   msg: 'Prompt carregado: skill-criatividade.md + copy-patterns.ts' },
  { id: '6', ts: '09:00:08', level: 'warn',   msg: '3 sinais novos aguardando abordagem' },
  { id: '7', ts: '09:00:10', level: 'system', msg: 'Claude Code — executor ativo' },
]

export default function LogStream() {
  const [logs, setLogs] = useState<LogEntry[]>(DEMO_LOGS)
  const [blink, setBlink] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const interval = setInterval(() => setBlink(b => !b), 600)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  const ts = () => {
    const d = new Date()
    return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}`
  }

  const addLog = () => {
    const demos = [
      { level: 'info' as const, msg: 'Gerando headline baseada em COPY_PATTERN_04 — Desejo antes da Solução' },
      { level: 'ok' as const, msg: 'Copy strategy gerada — 847 tokens' },
      { level: 'info' as const, msg: 'Selecionando referências: ref-linear + ref-basement + ref-framer' },
      { level: 'warn' as const, msg: 'Referência cuberto.com sem código — usando padrão de tipografia local' },
      { level: 'ok' as const, msg: 'Page structure definida — 9 seções' },
      { level: 'info' as const, msg: 'Motion patterns: MOTION_01 (hero) + MOTION_02 (cards) + MOTION_05 (cta)' },
      { level: 'ok' as const, msg: 'Build concluído — site/index.html gerado' },
      { level: 'ok' as const, msg: 'QA aprovado — hero prende em 2.3s, copy específica, CTA visível' },
    ]
    const pick = demos[Math.floor(Math.random() * demos.length)]
    setLogs(prev => [...prev.slice(-30), { id: Date.now().toString(), ts: ts(), ...pick }])
  }

  return (
    <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
      {/* Header */}
      <div
        className="flex items-center justify-between"
        style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', background: 'var(--bg-card)' }}
      >
        <div className="flex items-center gap-2">
          <Terminal size={13} style={{ color: 'var(--accent)' }} />
          <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--text-2)', letterSpacing: '0.05em' }}>
            SYSTEM LOG
          </span>
        </div>
        <button
          onClick={addLog}
          style={{
            fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--accent)',
            background: 'var(--accent-glow)', border: '1px solid var(--accent-glow-strong)',
            borderRadius: 4, padding: '3px 8px', cursor: 'pointer',
          }}
        >
          + SIM
        </button>
      </div>

      {/* Log list */}
      <div style={{ height: 220, overflowY: 'auto', padding: '10px 14px' }}>
        {logs.map(log => (
          <div
            key={log.id}
            className="log-line flex gap-3 mb-1"
            style={{ fontFamily: 'var(--f-mono)', fontSize: 11, lineHeight: '1.6' }}
          >
            <span style={{ color: 'var(--text-3)', flexShrink: 0 }}>{log.ts}</span>
            <span style={{ color: LEVEL_COLOR[log.level], flexShrink: 0, fontWeight: 500 }}>
              [{LEVEL_PREFIX[log.level]}]
            </span>
            <span style={{ color: 'var(--text-2)' }}>{log.msg}</span>
          </div>
        ))}
        <div className="flex gap-3" style={{ fontFamily: 'var(--f-mono)', fontSize: 11 }}>
          <span style={{ color: 'var(--text-3)' }}>{ts()}</span>
          <span style={{ color: 'var(--accent)', opacity: blink ? 1 : 0 }}>█</span>
        </div>
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
