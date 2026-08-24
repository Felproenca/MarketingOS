import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Crosshair, FileCheck2, GitBranch, Loader2, Plus, RefreshCw, Zap } from 'lucide-react'
import { getMissions, type Job } from '../lib/api'
import { dateTime, num, statusMeta } from '../lib/formatters'

const s = {
  page: { flex: 1, overflowY: 'auto' as const, padding: '28px 30px 90px', maxWidth: 1180, width: '100%' },
  head: { display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20, marginBottom: 24, flexWrap: 'wrap' as const },
  h1: { fontFamily: 'var(--f-display)', fontSize: 34, color: 'var(--text)', lineHeight: 1, marginBottom: 6, letterSpacing: '0.01em' },
  date: { fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.06em' },
  cta: { display: 'flex', alignItems: 'center', gap: 8, background: 'var(--accent)', color: '#070907', fontWeight: 800, fontSize: 13, padding: '11px 18px', borderRadius: 9, textDecoration: 'none', fontFamily: 'var(--f-display)', letterSpacing: '0.04em' },
  refresh: { display: 'flex', alignItems: 'center', gap: 7, padding: '10px 13px', border: '1px solid var(--border-bright)', borderRadius: 9, color: 'var(--text-2)', background: 'var(--bg-card)', cursor: 'pointer', fontSize: 12 },
  grid4: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 14 },
  stat: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 11, padding: '15px 17px' },
  statV: { fontFamily: 'var(--f-display)', fontSize: 30, lineHeight: 1, marginBottom: 4 },
  statL: { fontSize: 12, color: 'var(--text)', fontWeight: 600, marginBottom: 2 },
  statS: { fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--text-3)', textTransform: 'uppercase' as const },
  panel: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 13, padding: 20, marginBottom: 14 },
  label: { fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 7 },
  row: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderTop: '1px solid var(--border)', textDecoration: 'none', flexWrap: 'wrap' as const },
  empty: { color: 'var(--text-3)', fontSize: 12, padding: '26px 0', textAlign: 'center' as const },
}

function isRunning(j: Job) { return ['queued', 'routed', 'referenced', 'running'].includes(j.status) }
function isDone(j: Job) { return ['approved', 'published', 'done'].includes(j.status) }

export default function Missoes() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [clientFilter, setClientFilter] = useState(() => localStorage.getItem('mkos.client') || '')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const d = await getMissions()
      setJobs(d.jobs)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao carregar missões.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [])

  const filtered = jobs.filter(j => !clientFilter || j.client_id === clientFilter)
  const running = filtered.filter(isRunning)
  const review = filtered.filter(j => j.status === 'review')
  const done = filtered.filter(isDone)
  const problems = filtered.filter(j => ['blocked', 'error', 'stale'].includes(j.status))

  return (
    <div style={s.page}>
      <header style={s.head}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'var(--text-3)', font: '10px var(--f-mono)', letterSpacing: '0.1em', marginBottom: 8 }}>
            <Crosshair size={12} /> EXECUÇÃO · JOBS
          </div>
          <h1 style={s.h1}>MISSÕES</h1>
          <div style={s.date}>{num(jobs.length)} NO TOTAL · O BACKEND É A AUTORIDADE DO STATUS</div>
        </div>
        <div style={{ display: 'flex', gap: 9, alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            value={clientFilter}
            onChange={e => { setClientFilter(e.target.value); localStorage.setItem('mkos.client', e.target.value) }}
            style={{ padding: '10px 13px', border: '1px solid var(--border-bright)', borderRadius: 9, background: 'var(--bg-card)', color: 'var(--text-2)', fontSize: 12, fontFamily: 'var(--f-mono)', outline: 'none' }}
          >
            <option value="">Todos os clientes</option>
            {[...new Set(jobs.map(j => j.client_id))].filter(Boolean).map(id => <option key={id} value={id}>{id}</option>)}
          </select>
          <button style={s.refresh} onClick={() => void load()} disabled={loading}><RefreshCw size={14} className={loading ? 'spin' : ''} /> Atualizar</button>
          <Link to="/missoes/nova" style={s.cta}><Plus size={15} strokeWidth={2.5} /> NOVA SOLICITAÇÃO</Link>
        </div>
      </header>

      {error && <div style={{ ...s.panel, borderColor: 'rgba(255,45,85,.4)', color: '#ff9ab0', fontSize: 13 }}>{error}</div>}

      {!error && (
        <div style={s.grid4}>
          <Stat value={num(filtered.length)} label="Jobs no sistema" color="var(--text)" sub={clientFilter ? `filtro: ${clientFilter}` : 'todos os clientes'} />
          <Stat value={num(running.length)} label="Em execução" color="var(--accent)" sub={running.length ? 'queued · routed · running' : 'fila vazia'} />
          <Stat value={num(review.length)} label="Em revisão" color="var(--amber)" sub={review.length ? 'aprovação pendente' : 'sem pendências'} />
          <Stat value={num(done.length)} label="Concluídas" color="var(--green)" sub={problems.length ? `${num(problems.length)} com bloqueio/erro` : 'nenhum problema'} />
        </div>
      )}

      <div style={s.panel}>
        <div style={s.label}><GitBranch size={12} /> LISTA DE JOBS</div>
        {loading && <div style={{ ...s.empty, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}><Loader2 size={15} className="spin" /> Carregando missões…</div>}
        {!loading && !error && filtered.length === 0 && <div style={s.empty}>Nenhuma missão aqui. Crie a primeira solicitação.</div>}
        {filtered.map(job => {
          const meta = statusMeta(job.status)
          const title = String((job.result as { title?: string } | null)?.title || job.job_type || job.id.slice(0, 8))
          return (
            <Link key={job.id} to={`/missoes/${job.id}`} style={s.row}>
              <div style={{ display: 'grid', placeItems: 'center', width: 30, height: 30, flexShrink: 0, borderRadius: 8, background: 'var(--accent-glow)', color: 'var(--accent)' }}>
                {isRunning(job) ? <Zap size={13} /> : <Crosshair size={13} />}
              </div>
              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{title}</div>
                <div style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: 'var(--f-mono)', marginTop: 2 }}>
                  {job.capability || '—'} · {job.client_id || 'sem cliente'} · {dateTime(job.created_at)}
                </div>
              </div>
              {job.error && <span style={{ color: 'var(--text-3)', fontFamily: 'var(--f-mono)', fontSize: 10, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.error}</span>}
              <span style={{ padding: '3px 9px', borderRadius: 999, border: `1px solid ${meta.color}55`, color: meta.color, font: '9px var(--f-mono)', textTransform: 'uppercase' }}>{meta.label}</span>
              <ChevronRight size={14} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
            </Link>
          )
        })}
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8, color: 'var(--text-3)', fontFamily: 'var(--f-mono)', fontSize: 10 }}>
        <FileCheck2 size={12} /> Fonte: GET /api/missions — estados honestos (bloqueado ≠ concluído).
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
