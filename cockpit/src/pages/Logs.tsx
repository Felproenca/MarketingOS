import { useState, useEffect, useRef } from 'react'
import { Activity, Info, Play, Terminal, Trash2 } from 'lucide-react'

interface LogEntry {
  id: string
  ts: string
  level: 'info' | 'ok' | 'warn' | 'error' | 'system' | 'mission'
  source: string
  msg: string
}

const LEVEL_COLOR: Record<LogEntry['level'], string> = {
  system:  'var(--text-3)',
  info:    'var(--cyan)',
  ok:      'var(--green)',
  warn:    'var(--amber)',
  error:   'var(--red)',
  mission: 'var(--accent)',
}

const LEVEL_LABEL: Record<LogEntry['level'], string> = {
  system:  'SYS',
  info:    'INF',
  ok:      'OK ',
  warn:    'WRN',
  error:   'ERR',
  mission: 'MSN',
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
  { level: 'info'    as const, source: 'copy-engine', msg: 'COPY_PATTERN_04 aplicado — Desejo antes da Solução' },
  { level: 'ok'      as const, source: 'copy-engine', msg: 'Headline gerada: 34 tokens — específica ao nicho' },
  { level: 'info'    as const, source: 'references',  msg: 'Ref selecionada: ref-linear (layout) + ref-basement (visual)' },
  { level: 'mission' as const, source: 'arq-santos',  msg: 'Etapa Copy Strategy → DONE (1847ms)' },
  { level: 'info'    as const, source: 'arq-santos',  msg: 'Iniciando Page Structure...' },
  { level: 'warn'    as const, source: 'qa',          msg: 'Nenhuma animação de hero definida — motion pending' },
  { level: 'ok'      as const, source: 'motion',      msg: 'MOTION_01 (Hero Split Reveal) aplicado ao build' },
  { level: 'ok'      as const, source: 'build',       msg: 'index.html gerado — 1 arquivo, 34KB' },
  { level: 'ok'      as const, source: 'qa',          msg: 'Hero check: atenção em 2.1s — aprovado' },
  { level: 'ok'      as const, source: 'qa',          msg: 'Copy check: sem frases genéricas — aprovado' },
  { level: 'mission' as const, source: 'arq-santos',  msg: 'MISSÃO CONCLUÍDA — preview disponível' },
  { level: 'info'    as const, source: 'sinais',      msg: 'Novo sinal detectado: Studio Bloom (score 8)' },
]

export default function Logs() {
  const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS)
  const [autoPlay, setAutoPlay] = useState(false)
  const [blink, setBlink] = useState(true)
  const ref = useRef<HTMLDivElement>(null)

  const ts = () => {
    const d = new Date()
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}.${String(d.getMilliseconds()).padStart(3, '0')}`
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

  const stats = {
    ok: logs.filter(log => log.level === 'ok').length,
    warn: logs.filter(log => log.level === 'warn').length,
    error: logs.filter(log => log.level === 'error').length,
    mission: logs.filter(log => log.level === 'mission').length,
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', padding: '28px 30px 90px', maxWidth: 1180, width: '100%' }}>
      <header style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20, marginBottom: 24, flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'var(--text-3)', font: '10px var(--f-mono)', letterSpacing: '0.1em', marginBottom: 8 }}>
            <Activity size={12} /> MONITOR · STDOUT
          </div>
          <h1 style={{ fontFamily: 'var(--f-display)', fontSize: 34, color: 'var(--text)', lineHeight: 1, marginBottom: 6, letterSpacing: '0.01em' }}>SYSTEM LOGS</h1>
          <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.06em' }}>MONITOR LOCAL — SIMULAÇÃO DE EXECUÇÃO</div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            onClick={() => setAutoPlay(p => !p)}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.05em',
              padding: '9px 14px', borderRadius: 9, cursor: 'pointer',
              background: autoPlay ? 'var(--accent)' : 'var(--bg-card)',
              color: autoPlay ? '#070907' : 'var(--text-2)',
              border: `1px solid ${autoPlay ? 'var(--accent)' : 'var(--border-bright)'}`,
              fontWeight: autoPlay ? 700 : 400, transition: 'all 0.15s',
            }}
          >
            <Play size={12} />
            {autoPlay ? 'SIMULANDO…' : 'SIMULAR RUN'}
          </button>
          <button
            onClick={() => setLogs(INITIAL_LOGS)}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              fontFamily: 'var(--f-mono)', fontSize: 11,
              padding: '9px 12px', borderRadius: 9, cursor: 'pointer',
              border: '1px solid var(--border-bright)',
              background: 'transparent', color: 'var(--text-3)',
            }}
          >
            <Trash2 size={12} /> LIMPAR
          </button>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 14 }}>
        <MiniStat value={String(logs.length)} label="Linhas no buffer" color="var(--text)" />
        <MiniStat value={String(stats.ok)} label="OK" color="var(--green)" />
        <MiniStat value={String(stats.warn)} label="AVISOS" color="var(--amber)" />
        <MiniStat value={String(stats.error)} label="ERROS" color={stats.error ? 'var(--red)' : 'var(--text-3)'} />
      </div>

      <div style={{ display: 'flex', gap: 4, marginBottom: 10, flexWrap: 'wrap' }}>
        {(Object.keys(LEVEL_COLOR) as LogEntry['level'][]).map(level => (
          <span key={level} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', border: '1px solid var(--border)', borderRadius: 999, background: 'var(--bg-card)', fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.06em' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: LEVEL_COLOR[level] }} />
            {level.toUpperCase()}
          </span>
        ))}
      </div>

      <div
        ref={ref}
        style={{
          flex: 1,
          minHeight: 420,
          background: '#040406',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: '16px 20px',
          overflowY: 'auto',
          fontFamily: 'var(--f-mono)',
          fontSize: 11.5,
          lineHeight: 1.9,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 10, borderBottom: '1px solid var(--border)', marginBottom: 8, position: 'sticky', top: 0, background: '#040406' }}>
          <Terminal size={12} style={{ color: 'var(--accent)' }} />
          <span style={{ color: 'var(--text-3)', letterSpacing: '0.08em', fontSize: 10 }}>MARKETINGOS — EXECUTOR STDOUT</span>
        </div>
        {logs.map(log => (
          <div key={log.id} className="log-line" style={{ display: 'flex', gap: 12 }}>
            <span style={{ color: '#2C2C40', flexShrink: 0 }}>{log.ts}</span>
            <span style={{ color: LEVEL_COLOR[log.level], flexShrink: 0, minWidth: 36, fontWeight: 500 }}>[{LEVEL_LABEL[log.level]}]</span>
            <span style={{ color: '#44445A', flexShrink: 0, minWidth: 100 }}>{log.source}</span>
            <span style={{ color: log.level === 'mission' ? 'var(--accent)' : log.level === 'error' ? 'var(--red)' : 'var(--text-2)' }}>{log.msg}</span>
          </div>
        ))}
        <div style={{ display: 'flex', gap: 12 }}>
          <span style={{ color: '#2C2C40' }}>{ts()}</span>
          <span style={{ color: 'var(--accent)', opacity: blink ? 1 : 0, transition: 'opacity 0.1s' }}>█</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 10, color: 'var(--text-3)', fontFamily: 'var(--f-mono)', fontSize: 10 }}>
        <Info size={12} /> Monitor local de demonstração. Logs reais por job ficam no detalhe da operação (eventos/timeline).
      </div>
    </div>
  )
}

function MiniStat({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 11, padding: '14px 16px' }}>
      <div style={{ fontFamily: 'var(--f-display)', fontSize: 26, lineHeight: 1, marginBottom: 4, color }}>{value}</div>
      <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.06em' }}>{label}</div>
    </div>
  )
}
