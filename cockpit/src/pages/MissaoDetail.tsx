import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { AlertCircle, ArrowLeft, Calendar, Clock, Layers, Loader2, Play, Route } from 'lucide-react'
import { getMission, executeMission, type Job, type Artifact } from '../lib/api'
import { dateTime, nextStepFor, statusMeta } from '../lib/formatters'

const s = {
  page: { flex: 1, overflowY: 'auto' as const, padding: '28px 30px 90px', maxWidth: 980, width: '100%' },
  back: { display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-3)', textDecoration: 'none', fontSize: 12, marginBottom: 16, fontFamily: 'var(--f-mono)', letterSpacing: '0.04em' },
  h1: { fontFamily: 'var(--f-display)', fontSize: 30, color: 'var(--text)', lineHeight: 1.05, margin: '10px 0 8px', letterSpacing: '0.01em' },
  meta: { fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.06em', marginBottom: 22 },
  panel: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 13, padding: 20, marginBottom: 14 },
  label: { fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 7 },
  pre: { whiteSpace: 'pre-wrap' as const, fontSize: 12.5, lineHeight: 1.65, color: 'var(--text-2)', margin: 0, fontFamily: 'var(--f-body)' },
  btn: { display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--accent)', color: '#070907', border: 'none', borderRadius: 9, padding: '11px 16px', fontSize: 12.5, fontWeight: 800, cursor: 'pointer' },
  btnGhost: { display: 'inline-flex', alignItems: 'center', gap: 7, background: 'transparent', color: 'var(--text-2)', border: '1px solid var(--border-bright)', borderRadius: 9, padding: '10px 14px', fontSize: 12, cursor: 'pointer' },
}

function MetaRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
      <span style={{ color: 'var(--text-3)', display: 'flex', alignItems: 'center' }}>{icon}</span>
      <span style={{ color: 'var(--text-3)', fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.06em', textTransform: 'uppercase', minWidth: 78 }}>{label}</span>
      <span style={{ color: 'var(--text-2)' }}>{value}</span>
    </div>
  )
}

export default function MissaoDetail() {
  const { id } = useParams<{ id: string }>()
  const [job, setJob] = useState<Job | null>(null)
  const [artifacts, setArtifacts] = useState<Artifact[]>([])
  const [running, setRunning] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    if (!id) return
    try {
      const d = await getMission(id)
      setJob(d.job)
      setArtifacts(d.artifacts || [])
      setError('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao carregar a missão.')
    }
  }

  useEffect(() => { void load() }, [id])

  async function run() {
    if (!id) return
    setRunning(true)
    setError('')
    try {
      await executeMission(id)
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao reprocessar.')
    } finally {
      setRunning(false)
    }
  }

  const result = job?.result as Record<string, unknown> | null
  const text = (result?.text as string) || ''
  const structured = result?.structured
  const meta = statusMeta(job?.status || '')
  const nextStep = nextStepFor('', job?.status || '', null)

  return (
    <div style={s.page}>
      <Link to="/missoes" style={s.back}><ArrowLeft size={13} /> VOLTAR PARA MISSÕES</Link>
      <h1 style={s.h1}>{String(result?.title || job?.job_type || 'Missão')}</h1>
      <div style={s.meta}>#{id?.slice(0, 8)} · {job?.capability || '—'} · {job?.client_id || 'sem cliente'}</div>

      {error && (
        <div style={{ ...s.panel, borderColor: 'rgba(255,45,85,.4)', display: 'flex', gap: 9, alignItems: 'flex-start', color: '#ff9ab0', fontSize: 12.5 }}>
          <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} /> {error}
        </div>
      )}

      {!job && !error && (
        <div style={{ ...s.panel, display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-2)', fontSize: 13 }}>
          <Loader2 size={15} className="spin" /> Carregando missão…
        </div>
      )}

      {job && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
            <span style={{ padding: '4px 11px', borderRadius: 999, border: `1px solid ${meta.color}55`, color: meta.color, font: '10px var(--f-mono)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {meta.label}
            </span>
            <span style={{ fontSize: 11, color: 'var(--text-2)' }}>Próximo passo: {nextStep}</span>
            <button style={s.btn} onClick={() => void run()} disabled={running}>
              {running ? <Loader2 size={14} className="spin" /> : <Play size={14} />}
              {running ? 'Reprocessando…' : 'Reprocessar'}
            </button>
          </div>

          <div style={s.panel}>
            <div style={s.label}><Route size={12} /> DADOS DA EXECUÇÃO</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px 20px' }}>
              <MetaRow icon={<Calendar size={11} />} label="Criada" value={dateTime(job.created_at)} />
              <MetaRow icon={<Clock size={11} />} label="Iniciada" value={dateTime(job.started_at)} />
              <MetaRow icon={<Clock size={11} />} label="Concluída" value={dateTime(job.completed_at)} />
              <MetaRow icon={<Layers size={11} />} label="Tentativas" value={`${job.attempt_count ?? 0} / ${job.max_attempts ?? 1}`} />
              <MetaRow icon={<Route size={11} />} label="Executor" value={job.executor || '—'} />
              <MetaRow icon={<Route size={11} />} label="Prioridade" value={job.priority || 'normal'} />
            </div>
            {job.error && (
              <div style={{ marginTop: 14, padding: '11px 13px', border: '1px solid rgba(255,45,85,.34)', borderRadius: 9, color: '#ff9ab0', fontSize: 11.5, lineHeight: 1.5, fontFamily: 'var(--f-mono)' }}>
                {job.error}
              </div>
            )}
          </div>

          {structured ? (
            <div style={s.panel}>
              <div style={s.label}><Layers size={12} /> RESULTADO ESTRUTURADO</div>
              <pre style={s.pre}>{JSON.stringify(structured, null, 2)}</pre>
            </div>
          ) : text ? (
            <div style={s.panel}>
              <div style={s.label}><Layers size={12} /> RESULTADO</div>
              <pre style={s.pre}>{text}</pre>
            </div>
          ) : null}

          {artifacts.length > 0 && (
            <div style={s.panel}>
              <div style={s.label}><Layers size={12} /> ARTIFACTS ({artifacts.length})</div>
              {artifacts.map(a => {
                const ameta = statusMeta(a.status)
                return (
                  <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderTop: '1px solid var(--border)', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 180 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{a.title}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: 'var(--f-mono)', marginTop: 2 }}>{a.artifact_type} · v{a.current_version} · {dateTime(a.created_at)}</div>
                    </div>
                    <span style={{ padding: '3px 9px', borderRadius: 999, border: `1px solid ${ameta.color}55`, color: ameta.color, font: '9px var(--f-mono)', textTransform: 'uppercase' }}>{ameta.label}</span>
                    <Link to="/operacao" style={{ color: 'var(--accent)', font: '10px var(--f-mono)', textDecoration: 'none' }}>ABRIR NA OPERAÇÃO →</Link>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
