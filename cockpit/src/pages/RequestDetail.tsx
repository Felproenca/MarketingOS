import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, ClipboardList, FileCheck2, GitBranch, Loader2, Play, RefreshCw, Route, Send, XCircle } from 'lucide-react'
import { getOperations, approveArtifact, retryJob, type WorkRequest, type Job, type Artifact, type Reference, type ClientProfile } from '../lib/api'
import { dateTime, duration, nextStepFor, statusMeta } from '../lib/formatters'

const s = {
  page: { maxWidth: 980, margin: '0 auto', padding: '40px 24px 90px', width: '100%' },
  back: { display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-3)', textDecoration: 'none', fontSize: 13, marginBottom: 16 },
  h1: { fontFamily: 'var(--f-display)', fontSize: 26, color: 'var(--text)', margin: '10px 0 4px', letterSpacing: '0.01em' },
  meta: { color: 'var(--text-3)', fontSize: 12, fontFamily: 'var(--f-mono)', marginBottom: 20, lineHeight: 1.7 },
  box: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 13, padding: 18, marginBottom: 14 },
  label: { fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--text-2)', letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 7 },
  btn: { display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 14px', borderRadius: 9, fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: 'var(--f-body)' },
  approve: { border: 0, background: 'var(--green)', color: '#061006' },
  reject: { border: '1px solid rgba(255,45,85,.4)', background: 'rgba(255,45,85,.08)', color: '#ff9ab0' },
  retry: { border: '1px solid var(--border-bright)', background: 'var(--bg-hover)', color: 'var(--text-2)' },
}

export default function RequestDetail() {
  const { id } = useParams<{ id: string }>()
  const [ops, setOps] = useState<Awaited<ReturnType<typeof getOperations>> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [busy, setBusy] = useState(false)

  async function load() {
    setLoading(true)
    setError('')
    try {
      setOps(await getOperations())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao carregar operação.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [id])

  const request: WorkRequest | undefined = useMemo(() => ops?.requests.find(r => r.id === id), [ops, id])
  const client: ClientProfile | undefined = useMemo(() => ops?.clients.find(c => c.client_id === request?.client_id), [ops, request])
  const reference: Reference | undefined = useMemo(() => ops?.references.find(r => r.client_id === request?.client_id), [ops, request])
  const job: Job | undefined = useMemo(() => ops?.jobs.find(j => j.request_id === request?.id), [ops, request])
  const artifacts: Artifact[] = useMemo(() => (ops?.artifacts || []).filter(a => a.job_id === job?.id || (job && a.client_id === job.client_id)), [ops, job])
  const artifact = artifacts[0]
  const meta = statusMeta(artifact?.status || job?.status || request?.status || 'queued')

  async function decide(decision: 'approved' | 'changes_requested') {
    if (!artifact) return
    if (decision === 'changes_requested') {
      setFeedbackOpen(true)
      return
    }
    await sendDecision(decision, null)
  }

  async function sendDecision(decision: 'approved' | 'changes_requested', feedbackText: string | null) {
    if (!artifact) return
    setBusy(true)
    setError('')
    try {
      await approveArtifact(artifact.id, decision, feedbackText)
      setFeedbackOpen(false)
      setFeedback('')
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao registrar decisão.')
    } finally {
      setBusy(false)
    }
  }

  async function retry() {
    if (!job) return
    setBusy(true)
    setError('')
    try {
      await retryJob(job.id)
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao reprocessar.')
    } finally {
      setBusy(false)
    }
  }

  const result = job?.result as Record<string, unknown> | null
  const outputText = typeof result?.text === 'string' ? result.text : result?.structured ? JSON.stringify(result.structured, null, 2) : job?.error || null
  const previewUrl = artifact?.metadata && typeof artifact.metadata.preview_url === 'string' ? artifact.metadata.preview_url : null
  const route: string[] = request?.route?.length ? request.route : (request?.target_system ? [request.target_system] : [])

  if (loading) {
    return <div style={s.page}><div style={{ ...s.box, display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-2)' }}><Loader2 size={16} className="spin" /> Carregando solicitação…</div></div>
  }

  if (!request) {
    return (
      <div style={s.page}>
        <Link to="/operacao" style={s.back}><ArrowLeft size={14} /> Operação</Link>
        <h1 style={s.h1}>Solicitação não encontrada</h1>
        <p style={{ color: 'var(--text-3)', fontSize: 13 }}>Ela pode ter sido removida ou você não tem acesso. {error}</p>
      </div>
    )
  }

  const steps = [
    { icon: <ClipboardList size={14} />, title: 'Contexto', desc: client?.display_name || request.client_id, detail: reference ? 'Client Truth / referência ativa' : 'Sem referência cadastrada', ok: !!reference },
    { icon: <Send size={14} />, title: 'Intenção', desc: request.title, detail: `${request.request_type} · ${request.objective || 'sem objetivo'}` },
    { icon: <Route size={14} />, title: 'Rota', desc: route.join(' → ') || 'a decidir pelo backend', detail: `pedido ${request.status}` },
    { icon: <GitBranch size={14} />, title: 'Job', desc: job ? `${job.job_type || job.capability || 'job'} · ${job.status}` : 'ainda não criado', detail: job ? `executor: ${job.executor || '—'} · criado ${dateTime(job.created_at)}` : 'aguardando roteamento' },
    { icon: <FileCheck2 size={14} />, title: 'Output', desc: artifact ? `${artifact.title} · v${artifact.current_version}` : 'sem artifact', detail: artifact ? `${artifact.artifact_type} · ${artifact.status}` : 'o output aparece quando o job terminar' },
    { icon: <CheckCircle2 size={14} />, title: 'QA / Decisão', desc: meta.label, detail: artifact?.status === 'review' ? 'revisão pendente — aprovar ou pedir ajuste' : 'decisão registrada no backend', ok: artifact?.status === 'approved' },
  ]

  return (
    <div style={s.page}>
      <Link to="/operacao" style={s.back}><ArrowLeft size={14} /> Fila operacional</Link>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={s.h1}>{request.title}</h1>
          <div style={s.meta}>
            {request.client_id} · #{request.id.slice(0, 8)} · criada {dateTime(request.created_at)} ({duration(request.created_at)})
          </div>
        </div>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '6px 12px', borderRadius: 999, border: `1px solid ${meta.color}55`, color: meta.color, background: 'var(--bg-card)', font: '10px var(--f-mono)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: meta.color }} /> {meta.label}
        </span>
      </div>

      <div style={{ ...s.box, borderColor: meta.color === 'var(--accent)' ? 'rgba(212,255,0,.35)' : 'var(--border)' }}>
        <div style={s.label}><ArrowRight size={12} /> PRÓXIMO PASSO</div>
        <div style={{ color: 'var(--text)', fontSize: 14, fontWeight: 600 }}>{nextStepFor(request.status, job?.status || null, artifact?.status || null)}</div>
        {request.status === 'awaiting_input' && <div style={{ marginTop: 8, color: 'var(--amber)', fontSize: 12 }}>Envie o input necessário ou aguarde o operador regularizar.</div>}
        {request.status === 'contract_only' && <div style={{ marginTop: 8, color: 'var(--amber)', fontSize: 12 }}>O contrato existe, mas ainda não há executor validado — nada foi executado.</div>}
      </div>

      {error && (
        <div style={{ ...s.box, borderColor: 'rgba(255,45,85,.4)', color: '#ff9ab0', fontSize: 12, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <AlertCircle size={15} style={{ flexShrink: 0 }} /> {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <Link to="/missoes/nova" style={{ ...s.btn, background: 'var(--accent)', color: '#070907', textDecoration: 'none' }}><Play size={13} /> Nova solicitação</Link>
        {job && ['blocked', 'error', 'stale'].includes(job.status) && (
          <button style={{ ...s.btn, ...s.retry }} onClick={retry} disabled={busy}><RefreshCw size={13} className={busy ? 'spin' : ''} /> Reprocessar job</button>
        )}
        {artifact?.status === 'review' && (
          <>
            <button style={{ ...s.btn, ...s.approve }} onClick={() => decide('approved')} disabled={busy}><CheckCircle2 size={13} /> Aprovar</button>
            <button style={{ ...s.btn, ...s.reject }} onClick={() => decide('changes_requested')} disabled={busy}><XCircle size={13} /> Pedir ajuste</button>
          </>
        )}
      </div>

      {feedbackOpen && (
        <div style={{ ...s.box, borderColor: 'rgba(255,184,0,.4)' }}>
          <div style={s.label}>O QUE PRECISA SER AJUSTADO?</div>
          <textarea
            style={{ width: '100%', background: 'var(--bg-base)', border: '1px solid var(--border-bright)', borderRadius: 9, padding: '11px 13px', color: 'var(--text)', fontSize: 13, minHeight: 70, resize: 'vertical', outline: 'none', fontFamily: 'var(--f-body)' }}
            value={feedback}
            onChange={e => setFeedback(e.target.value)}
            placeholder="Descreva o ajuste — o feedback fica registrado no artifact e no histórico."
            autoFocus
          />
          <div style={{ display: 'flex', gap: 9, marginTop: 12 }}>
            <button style={{ ...s.btn, ...s.reject }} disabled={busy || !feedback.trim()} onClick={() => void sendDecision('changes_requested', feedback.trim())}>
              {busy ? <Loader2 size={13} className="spin" /> : <Send size={13} />} Enviar pedido de ajuste
            </button>
            <button style={{ ...s.btn, ...s.retry }} onClick={() => { setFeedbackOpen(false); setFeedback('') }}>Cancelar</button>
          </div>
        </div>
      )}

      <div style={s.box}>
        <div style={s.label}>LINHA DO TEMPO DA EXECUÇÃO</div>
        <div style={{ display: 'grid', gap: 0 }}>
          {steps.map((st, i) => (
            <div key={st.title} style={{ display: 'grid', gridTemplateColumns: '34px 1fr', gap: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ display: 'grid', placeItems: 'center', width: 26, height: 26, borderRadius: '50%', border: `1px solid ${st.ok ? 'var(--green)' : 'var(--border-bright)'}`, color: st.ok ? 'var(--green)' : 'var(--text-2)', background: 'var(--bg-base)' }}>{st.icon}</div>
                {i < steps.length - 1 && <div style={{ width: 1, flex: 1, background: 'var(--border)' }} />}
              </div>
              <div style={{ paddingBottom: i < steps.length - 1 ? 18 : 0 }}>
                <div style={{ font: '9px var(--f-mono)', color: 'var(--text-3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 3 }}>{st.title}</div>
                <div style={{ color: 'var(--text)', fontSize: 13, fontWeight: 600 }}>{st.desc}</div>
                <div style={{ color: 'var(--text-3)', fontSize: 11, marginTop: 2, fontFamily: 'var(--f-mono)' }}>{st.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {request.events && request.events.length > 0 && (
        <div style={s.box}>
          <div style={s.label}>EVENTOS</div>
          <div style={{ display: 'grid', gap: 8 }}>
            {request.events.slice(0, 12).map((ev, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, fontSize: 12, alignItems: 'baseline' }}>
                <span style={{ color: 'var(--accent)', font: '9px var(--f-mono)', whiteSpace: 'nowrap' }}>{dateTime(ev.created_at)}</span>
                <span style={{ color: 'var(--text-2)' }}>{ev.event_type}{ev.to_status ? ` → ${ev.to_status}` : ''}</span>
                {ev.message && <span style={{ color: 'var(--text-3)' }}>· {ev.message}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {job?.error && (
        <div style={{ ...s.box, borderColor: 'rgba(255,45,85,.4)' }}>
          <div style={{ ...s.label, color: '#ff9ab0' }}><AlertCircle size={12} /> ERRO DO JOB</div>
          <pre style={{ whiteSpace: 'pre-wrap', font: '12px/1.6 var(--f-mono)', color: '#ff9ab0', margin: 0 }}>{job.error}</pre>
        </div>
      )}

      {artifact && (
        <div style={s.box}>
          <div style={s.label}>ARTIFACT · {artifact.artifact_type} · v{artifact.current_version}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <span style={{ color: 'var(--text)', fontSize: 14, fontWeight: 600 }}>{artifact.title}</span>
            <span style={{ padding: '3px 8px', borderRadius: 999, border: `1px solid ${meta.color}55`, color: meta.color, font: '9px var(--f-mono)' }}>{meta.label}</span>
          </div>
          {previewUrl && /^(video|reel|short)/i.test(artifact.artifact_type) && <video src={previewUrl} controls preload="metadata" style={{ width: '100%', maxWidth: 460, borderRadius: 10, background: '#000' }} />}
          {previewUrl && /^(post|carousel)$/i.test(artifact.artifact_type) && <img src={previewUrl} alt={`Preview de ${artifact.title}`} style={{ maxWidth: 320, borderRadius: 10, border: '1px solid var(--border)' }} />}
          {previewUrl && !/^(video|reel|short|post|carousel)$/i.test(artifact.artifact_type) && <a href={previewUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--cyan)', fontSize: 12 }}>Abrir resultado ↗</a>}
          {!previewUrl && <div style={{ color: 'var(--text-3)', fontSize: 12 }}>Sem preview disponível neste tipo de output.</div>}
        </div>
      )}

      {outputText && (
        <div style={s.box}>
          <div style={s.label}>RESULTADO</div>
          <pre style={{ whiteSpace: 'pre-wrap', font: '12px/1.6 var(--f-body)', color: 'var(--text-2)', margin: 0, maxHeight: 360, overflow: 'auto' }}>{outputText}</pre>
        </div>
      )}
    </div>
  )
}
