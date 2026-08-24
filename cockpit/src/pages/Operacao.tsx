import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, ArrowRight, BookMarked, CheckCircle2, ClipboardList, FileCheck2, FileText, GitBranch, Image, Plus, RefreshCw, Route, Save, Send, Video, XCircle } from 'lucide-react'
import { apiFetch } from '../lib/auth'

type Client = { client_id: string; display_name: string; company_name?: string }
type Reference = {
  client_id: string
  brand_profile?: { positioning?: string; audience?: string; visual_direction?: string }
  voice_profile?: { tone?: string; vocabulary?: string[] }
  offers?: string[]
  constraints?: string[]
  approved_examples?: string[]
  notes?: string
  updated_at?: string
}
type WorkRequest = {
  id: string
  client_id: string
  title: string
  request_type: string
  objective?: string
  priority: string
  target_system: string
  status: string
  payload?: {
    requested_route?: string[]
    original_prompt?: string
    ecosystem_dispatch?: {
      correlation_id?: string
      summary_file?: string
      contracts?: string[]
      work_root?: string
      dispatched_at?: string
    }
    flux?: {
      content_package?: string
      marketing_copy?: string
      slides?: number
    }
    execution?: {
      carousel_job_dir?: string
      slides_input?: string
      render_error?: string | null
      preview?: {
        copy_md?: string
        caption?: string
        slide_count?: number
        slide_files?: string[]
        html_file?: string
        draft_quality?: string
        commercial_renderer_required?: boolean
        slides_input?: {
          theme?: string
          objective?: string
          slides?: { number?: number; title?: string; body?: string; role?: string; type?: string }[]
        }
      }
    }
    last_worker_error?: string
  }
  created_at: string
  route?: string[]
  events?: { event_type: string; to_status?: string; message?: string; created_at: string }[]
}
type MediaJob = { id: string; request_id?: string; client_id: string; job_type: string; capability?: string; status: string; created_at: string; started_at?: string; completed_at?: string; error?: string }
type Artifact = { id: string; job_id?: string; client_id: string; artifact_type: string; title: string; status: string; current_version: number; metadata?: { preview_url?: string; assets?: { kind?: string; url?: string }[] }; updated_at: string }
type SystemStatus = { mediaos?: { hardening?: boolean; claim?: boolean }; aiRouter?: { status?: string; connections?: number | null; connectedProviders?: string[] } }
type Capability = { id: string; label: string; description?: string; category?: string; requestTypes: string[]; owner: string; executor: string | null; input: string; output: string; qa: string[]; approval: boolean; status: string; provider?: string; model?: string; skill?: string | null; providers?: string[]; fallback?: string | null }

const REQUEST_TYPES = [
  { value: 'carousel', label: 'Carrossel' },
  { value: 'mass_publish', label: 'Publicacao em massa' },
  { value: 'video', label: 'Video' },
  { value: 'generative_video', label: 'Video generativo (adapter pendente)' },
  { value: 'post', label: 'Post visual' },
  { value: 'research', label: 'Pesquisa com fontes' },
  { value: 'market_research', label: 'Pesquisa de mercado' },
  { value: 'ads', label: 'Plano de Ads' },
  { value: 'automation', label: 'Automação / fila' },
  { value: 'analysis', label: 'Analise' },
  { value: 'data_sync', label: 'Sincronizar dados' },
  { value: 'strategy', label: 'Estratégia' },
  { value: 'funnel', label: 'Funil' },
  { value: 'prospecting', label: 'Prospecção' },
  { value: 'acquisition', label: 'Aquisição / leads' },
  { value: 'relationship', label: 'Relacionamento' },
  { value: 'publish', label: 'Publicar artifact aprovado' },
]

function listToText(value?: string[]) {
  return (value || []).join('\n')
}

async function readApiBody(response: Response) {
  const text = await response.text()
  if (!text) return {}
  try {
    return JSON.parse(text)
  } catch {
    return { error: text.slice(0, 240) }
  }
}

export default function Operacao() {
  const [clients, setClients] = useState<Client[]>([])
  const [references, setReferences] = useState<Reference[]>([])
  const [requests, setRequests] = useState<WorkRequest[]>([])
  const [jobs, setJobs] = useState<MediaJob[]>([])
  const [artifacts, setArtifacts] = useState<Artifact[]>([])
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null)
  const [capabilities, setCapabilities] = useState<Capability[]>([])
  const [selectedClient, setSelectedClient] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [savingReference, setSavingReference] = useState(false)
  const [creatingRequest, setCreatingRequest] = useState(false)
  const [requestIdempotencyKey, setRequestIdempotencyKey] = useState(() => crypto.randomUUID())
  const [error, setError] = useState('')
  const [referenceForm, setReferenceForm] = useState({
    positioning: '',
    audience: '',
    visualDirection: '',
    tone: '',
    vocabulary: '',
    offers: '',
    constraints: '',
    approvedExamples: '',
    notes: '',
  })
  const [requestForm, setRequestForm] = useState({
    title: 'Um carrossel para ',
    requestType: 'carousel',
    objective: '',
    sources: '',
    artifactId: '',
    sourcePath: '',
    videoMode: 'edit',
    priority: 'normal',
  })

  async function load() {
    setLoading(true)
    setError('')
    try {
      const response = await apiFetch('/api/admin/operations')
      const body = await readApiBody(response)
      if (!response.ok) throw new Error(body.error || 'Falha ao carregar operacao.')
      setClients(body.clients || [])
      setReferences(body.references || [])
      setRequests(body.requests || [])
      setJobs(body.jobs || [])
      setArtifacts(body.artifacts || [])
      setSystemStatus(body.systemStatus || null)
      setCapabilities(body.capabilities || [])
      const firstClient = selectedClient || body.clients?.[0]?.client_id || ''
      setSelectedClient(firstClient)
      hydrateReference(firstClient, body.references || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao carregar operacao.')
    } finally {
      setLoading(false)
    }
  }

  function hydrateReference(clientId: string, source = references) {
    const found = source.find(item => item.client_id === clientId)
    setReferenceForm({
      positioning: found?.brand_profile?.positioning || '',
      audience: found?.brand_profile?.audience || '',
      visualDirection: found?.brand_profile?.visual_direction || '',
      tone: found?.voice_profile?.tone || '',
      vocabulary: listToText(found?.voice_profile?.vocabulary),
      offers: listToText(found?.offers),
      constraints: listToText(found?.constraints),
      approvedExamples: listToText(found?.approved_examples),
      notes: found?.notes || '',
    })
  }

  useEffect(() => { void load() }, [])

  function changeClient(clientId: string) {
    setSelectedClient(clientId)
    hydrateReference(clientId)
    const client = clients.find(item => item.client_id === clientId)
    setRequestForm(current => ({ ...current, title: current.title === 'Um carrossel para ' ? `Um carrossel para ${client?.display_name || ''}` : current.title }))
  }

  async function saveReference(event: FormEvent) {
    event.preventDefault()
    if (!selectedClient) return
    setSavingReference(true)
    setError('')
    try {
      const response = await apiFetch(`/api/admin/references/${encodeURIComponent(selectedClient)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(referenceForm),
      })
      const body = await readApiBody(response)
      if (!response.ok) throw new Error(body.error || 'Falha ao salvar referencia.')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao salvar referencia.')
    } finally {
      setSavingReference(false)
    }
  }

  async function createRequest(event: FormEvent) {
    event.preventDefault()
    if (!selectedClient) return
    setCreatingRequest(true)
    setError('')
    try {
      const response = await apiFetch('/api/admin/operations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': requestIdempotencyKey },
        body: JSON.stringify({ ...requestForm, clientId: selectedClient, prompt: requestForm.title, sources: requestForm.sources.split(/\r?\n|,/).map(item => item.trim()).filter(Boolean) }),
      })
      const body = await readApiBody(response)
      if (!response.ok) throw new Error(body.error || 'Falha ao criar pedido.')
      setRequestForm({ title: 'Um carrossel para ', requestType: 'carousel', objective: '', sources: '', artifactId: '', sourcePath: '', videoMode: 'edit', priority: 'normal' })
      setRequestIdempotencyKey(crypto.randomUUID())
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao criar pedido.')
    } finally {
      setCreatingRequest(false)
    }
  }

  async function reviewArtifactForRequest(requestId: string, decision: 'approved' | 'changes_requested') {
    const job = jobs.find(item => item.request_id === requestId)
    const artifact = activeArtifacts.find(item => item.job_id === job?.id)
    if (!artifact) { setError('Este pedido ainda não possui artifact registrável para aprovação.'); return }
    const feedback = decision === 'changes_requested' ? window.prompt('Descreva o ajuste necessário:') : null
    if (decision === 'changes_requested' && !feedback?.trim()) return
    setError('')
    try {
      const response = await apiFetch('/api/admin/artifacts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ artifactId: artifact.id, decision, feedback }) })
      const body = await readApiBody(response)
      if (!response.ok) throw new Error(body.error || 'Falha ao registrar aprovação.')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao registrar aprovação.')
    }
  }

  async function retryJob(jobId: string) {
    setError('')
    try {
      const response = await apiFetch('/api/admin/operations', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'retry', jobId }) })
      const body = await readApiBody(response)
      if (!response.ok) throw new Error(body.error || 'Falha ao reprocessar job.')
      await load()
    } catch (err) { setError(err instanceof Error ? err.message : 'Falha ao reprocessar job.') }
  }

  const selectedReference = references.find(item => item.client_id === selectedClient)
  const selectedClientName = clients.find(item => item.client_id === selectedClient)?.display_name || selectedClient
  const activeRequests = requests.filter(item => (!selectedClient || item.client_id === selectedClient) && (!statusFilter || item.status === statusFilter))
  const activeJobs = jobs.filter(item => !selectedClient || item.client_id === selectedClient)
  const activeArtifacts = artifacts.filter(item => !selectedClient || item.client_id === selectedClient)

  const REQUEST_STATUSES = ['', 'queued', 'referenced', 'routed', 'running', 'review', 'approved', 'published', 'done', 'blocked', 'error', 'awaiting_input', 'changes_requested']

  return (
    <div className="ops-page">
      <header className="ops-header">
        <div>
          <div className="portal-kicker"><GitBranch size={13} /> ROTEADOR OPERACIONAL</div>
          <h1>Operacao</h1>
          <p>Entrada unica para pedido, referencia, roteamento e execucao entre os OS.</p>
        </div>
        <div className="admin-actions" style={{ display: 'flex', gap: 9 }}>
          <Link to="/missoes/nova" className="admin-new-button" style={{ textDecoration: 'none' }}><Plus size={15} /> Nova solicitação</Link>
          <button className="portal-refresh" onClick={() => void load()} disabled={loading}>
            <RefreshCw size={15} className={loading ? 'spin' : ''} /> Atualizar
          </button>
        </div>
      </header>

      {error && <div className="portal-error"><AlertCircle size={15} /> {error}</div>}

      <section className="ops-map">
        {['Entrada', 'Referencia', 'Roteamento', 'Execucao', 'Memoria'].map((step, index) => (
          <div key={step} className="ops-map-step">
            <span>{String(index + 1).padStart(2, '0')}</span>
            <b>{step}</b>
            {index < 4 && <ArrowRight size={14} />}
          </div>
        ))}
      </section>

      <section className="ops-live-strip">
        <div><Video size={16} /><b>{activeJobs.filter(item => ['queued', 'running'].includes(item.status)).length}</b><span>jobs em execução</span></div>
        <div><FileCheck2 size={16} /><b>{activeArtifacts.length}</b><span>artifacts registrados</span></div>
        <div><CheckCircle2 size={16} /><b>{activeArtifacts.filter(item => item.status === 'approved').length}</b><span>entregas aprovadas</span></div>
        <div><AlertCircle size={16} /><b>{activeJobs.filter(item => ['blocked', 'error'].includes(item.status)).length}</b><span>bloqueios para ação</span></div>
      </section>

      <div className="ops-layout">
        <section className="ops-panel">
          <div className="ops-panel-head">
            <div>
              <div className="panel-eyebrow"><BookMarked size={13} /> REFERENCIA DO CLIENTE</div>
              <h2>{selectedClientName || 'Cliente'}</h2>
            </div>
            <select value={selectedClient} onChange={event => changeClient(event.target.value)}>
              {clients.map(client => <option key={client.client_id} value={client.client_id}>{client.display_name}</option>)}
            </select>
          </div>

          <form className="ops-reference-form" onSubmit={saveReference}>
            <label>Posicionamento<textarea value={referenceForm.positioning} onChange={event => setReferenceForm({ ...referenceForm, positioning: event.target.value })} placeholder="Ex: autoridade simples, direta e orientada a resultado." /></label>
            <label>Publico<textarea value={referenceForm.audience} onChange={event => setReferenceForm({ ...referenceForm, audience: event.target.value })} placeholder="Quem compra, quem consome, dores e desejos." /></label>
            <label>Tom de voz<textarea value={referenceForm.tone} onChange={event => setReferenceForm({ ...referenceForm, tone: event.target.value })} placeholder="Como a marca deve soar." /></label>
            <label>Ofertas<textarea value={referenceForm.offers} onChange={event => setReferenceForm({ ...referenceForm, offers: event.target.value })} placeholder="Uma oferta por linha." /></label>
            <label>Restricoes<textarea value={referenceForm.constraints} onChange={event => setReferenceForm({ ...referenceForm, constraints: event.target.value })} placeholder="O que nao pode prometer, dizer ou usar." /></label>
            <label>Exemplos aprovados<textarea value={referenceForm.approvedExamples} onChange={event => setReferenceForm({ ...referenceForm, approvedExamples: event.target.value })} placeholder="Links, IDs ou descricao de pecas boas." /></label>
            <label className="wide">Direcao visual<textarea value={referenceForm.visualDirection} onChange={event => setReferenceForm({ ...referenceForm, visualDirection: event.target.value })} placeholder="Cores, densidade, ritmo visual, referencias." /></label>
            <label className="wide">Notas<textarea value={referenceForm.notes} onChange={event => setReferenceForm({ ...referenceForm, notes: event.target.value })} placeholder="Contexto operacional que ajuda o time e os agentes." /></label>
            <button className="ops-primary" disabled={savingReference || !selectedClient}><Save size={15} /> {savingReference ? 'Salvando...' : 'Salvar referencia'}</button>
          </form>
        </section>

        <aside className="ops-side">
          <form className="ops-request-card" onSubmit={createRequest}>
            <div className="panel-eyebrow"><ClipboardList size={13} /> NOVO PEDIDO</div>
            <h2>Criar job</h2>
            <label>Pedido<input value={requestForm.title} onChange={event => setRequestForm({ ...requestForm, title: event.target.value })} /></label>
            <label>Tipo<select value={requestForm.requestType} onChange={event => setRequestForm({ ...requestForm, requestType: event.target.value })}>{REQUEST_TYPES.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
            <label>Objetivo<textarea value={requestForm.objective} onChange={event => setRequestForm({ ...requestForm, objective: event.target.value })} placeholder="Objetivo, canal ou orientacao especifica." /></label>
            {requestForm.requestType === 'publish' && <label>Artifact aprovado<input value={requestForm.artifactId} onChange={event => setRequestForm({ ...requestForm, artifactId: event.target.value })} placeholder="UUID do artifact aprovado" required /></label>}
            {requestForm.requestType === 'video' && <><label>Arquivo de origem<input value={requestForm.sourcePath} onChange={event => setRequestForm({ ...requestForm, sourcePath: event.target.value })} placeholder="Caminho local do vídeo" required /></label><label>Modo<select value={requestForm.videoMode} onChange={event => setRequestForm({ ...requestForm, videoMode: event.target.value })}><option value="edit">Edição / cortes</option><option value="generate">Generativo (bloqueado até adapter)</option></select></label></>}
            <label className="wide">Fontes da pesquisa<textarea value={requestForm.sources} onChange={event => setRequestForm({ ...requestForm, sources: event.target.value })} placeholder="Para Pesquisa: uma URL HTTPS ou caminho de arquivo por linha. O executor bloqueia pesquisa sem fontes." /></label>
            <button className="ops-primary" disabled={creatingRequest || !selectedClient}><Send size={15} /> {creatingRequest ? 'Criando...' : 'Enviar para rota'}</button>
          </form>

          <div className="ops-readiness">
            <CheckCircle2 size={18} />
            <div>
              <b>{selectedReference ? 'Referencia ativa' : 'Referencia pendente'}</b>
              <span>{selectedReference ? 'Pedidos ja carregam memoria do cliente.' : 'Cadastre a memoria antes dos jobs criativos.'}</span>
            </div>
          </div>
          <div className="ops-readiness">
            <Route size={18} />
            <div>
              <b>{systemStatus?.aiRouter?.status === 'connected' ? 'AI Router conectado' : 'AI Router aguardando conexao'}</b>
              <span>{systemStatus?.aiRouter?.connections ?? 0} conexao(oes) ativa(s). Rotas locais continuam disponiveis; adapters externos exigem credencial.</span>
            </div>
          </div>
        </aside>
      </div>

      <section className="ops-queue">
        <div className="ops-panel-head">
          <div>
            <div className="panel-eyebrow"><GitBranch size={13} /> CATÁLOGO OPERACIONAL</div>
            <h2>Capacidades conectadas</h2>
          </div>
          <span className="ops-catalog-note">Provider/modelo: definido depois pelo AI Router</span>
        </div>
        <div className="ops-capability-grid">
          {capabilities.map(capability => (
            <article className="ops-capability-card" key={capability.id}>
              <div className="ops-capability-head"><b>{capability.label}</b><span className={`ops-capability-status ${capability.status}`}>{capability.status}</span></div>
              <small>{capability.category} · {capability.owner} · {capability.executor || 'sem executor conectado'}</small>
              {capability.description && <p>{capability.description}</p>}
              <p><strong>Entrada:</strong> {capability.input}</p>
              <p><strong>Output:</strong> {capability.output}</p>
              <p><strong>QA:</strong> {Array.isArray(capability.qa) ? capability.qa.join(', ') : capability.qa} {capability.approval ? '· aprovação humana' : ''}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="ops-queue">
        <div className="ops-panel-head">
          <div>
            <div className="panel-eyebrow"><Route size={13} /> FILA E CAMINHOS</div>
            <h2>Pedidos roteados</h2>
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: '9px 11px', border: '1px solid var(--border-bright)', borderRadius: 8, background: 'var(--bg-card)', color: 'var(--text-2)', fontSize: 11, fontFamily: 'var(--f-mono)' }}>
            {REQUEST_STATUSES.map(st => <option key={st} value={st}>{st ? st : 'todos os status'}</option>)}
          </select>
        </div>
        {!activeRequests.length && <div className="admin-empty">{loading ? 'Carregando pedidos...' : 'Nenhum pedido criado para este cliente.'}</div>}
        {activeRequests.map(item => (
          <article className={`ops-request-row ${item.payload?.execution ? 'has-output' : ''}`} key={item.id}>
            <div className="ops-request-main">
              <div>
                <Link to={`/operacao/${item.id}`} style={{ color: 'var(--text)', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>{item.title} <ArrowRight size={12} style={{ verticalAlign: -2, color: 'var(--accent)' }} /></Link>
                <span>{item.request_type} / {item.status} / {new Date(item.created_at).toLocaleString('pt-BR')}</span>
                {item.payload?.ecosystem_dispatch?.correlation_id && <small>{item.payload.ecosystem_dispatch.correlation_id}</small>}
              </div>
              {item.payload?.last_worker_error && <div className="ops-output-error"><AlertCircle size={14} /> {item.payload.last_worker_error}</div>}
            </div>
            <div className="ops-route">
              {(item.route || [item.target_system]).map(system => <span key={system}>{system}</span>)}
            </div>
            {(() => { const job = activeJobs.find(candidate => candidate.request_id === item.id); return job && ['blocked', 'error'].includes(job.status) ? <button className="ops-reject" onClick={() => void retryJob(job.id)}><RefreshCw size={14} /> Reprocessar</button> : null })()}
            <strong>{item.payload?.execution ? 'OUTPUT' : item.target_system}</strong>
            {item.payload?.execution?.preview && (
              <div className="ops-output">
                <div className="ops-output-head">
                  <div>
                    <div className="panel-eyebrow"><FileText size={13} /> OUTPUT PARA REVISAO</div>
                    <h3>{item.payload.execution.preview.slides_input?.theme || item.title}</h3>
                    <p>{item.payload.execution.carousel_job_dir}</p>
                  </div>
                  <div className="ops-output-actions">
                    <button className="ops-approve" onClick={() => void reviewArtifactForRequest(item.id, 'approved')}>
                      <CheckCircle2 size={14} /> Aprovar
                    </button>
                    <button className="ops-reject" onClick={() => void reviewArtifactForRequest(item.id, 'changes_requested')}>
                      <XCircle size={14} /> Ajustar
                    </button>
                  </div>
                </div>

                <div className="ops-output-grid">
                  <div className="ops-output-card">
                    <span><Image size={13} /> Slides</span>
                    <b>{item.payload.execution.preview.slide_count || 0}</b>
                    <small>{item.payload.execution.preview.draft_quality === 'operational_draft' ? 'Rascunho operacional' : 'Render final'}</small>
                  </div>
                  <div className="ops-output-card">
                    <span><Route size={13} /> FluxOS</span>
                    <b>{item.payload.flux?.slides || item.payload.execution.preview.slides_input?.slides?.length || 0}</b>
                    <small>{item.payload.flux?.marketing_copy ? 'Pacote editorial gerado' : 'Sem pacote editorial'}</small>
                  </div>
                  <div className="ops-output-card">
                    <span><AlertCircle size={13} /> Comercial</span>
                    <b>{item.payload.execution.preview.commercial_renderer_required ? 'Pendente' : 'OK'}</b>
                    <small>Canva/Figma/DesignOS premium</small>
                  </div>
                </div>

                {item.payload.execution.render_error && <div className="ops-output-error"><AlertCircle size={14} /> {item.payload.execution.render_error}</div>}

                <div className="ops-preview-columns">
                  <section>
                    <h4>Legenda</h4>
                    <pre>{item.payload.execution.preview.caption || 'Sem legenda.'}</pre>
                  </section>
                  <section>
                    <h4>Copy</h4>
                    <pre>{item.payload.execution.preview.copy_md || 'Sem copy.'}</pre>
                  </section>
                </div>

                <div className="ops-slide-list">
                  {(item.payload.execution.preview.slides_input?.slides || []).map((slide, index) => (
                    <div key={`${item.id}-${index}`}>
                      <span>{String(slide.number || index + 1).padStart(2, '0')} / {slide.type || slide.role || 'slide'}</span>
                      <b>{slide.title}</b>
                      <p>{slide.body}</p>
                    </div>
                  ))}
                </div>

                {!!item.payload.execution.preview.slide_files?.length && (
                  <div className="ops-path-list">
                    <h4>Arquivos renderizados</h4>
                    {item.payload.execution.preview.slide_files.map(file => <code key={file}>{file}</code>)}
                  </div>
                )}
              </div>
            )}
          </article>
        ))}
        <div className="ops-artifacts-head"><div className="panel-eyebrow"><FileCheck2 size={13} /> RESULTADOS REGISTRADOS</div></div>
        {!activeArtifacts.length && <div className="admin-empty">Nenhum artifact registrado para este cliente.</div>}
        {activeArtifacts.slice(0, 12).map(artifact => <article className="ops-artifact-row" key={artifact.id}>
          <div><b>{artifact.title}</b><span>{artifact.artifact_type} · versão {artifact.current_version} · {artifact.status}</span></div>
          <strong>{artifact.metadata?.preview_url ? 'PREVIEW DISPONÍVEL' : 'SEM PREVIEW'}</strong>
          {artifact.metadata?.preview_url && <a href={artifact.metadata.preview_url} target="_blank" rel="noreferrer">Abrir resultado <ArrowRight size={13} /></a>}
          {artifact.metadata?.preview_url && /^(video|reel|short)/i.test(artifact.artifact_type) && <video src={artifact.metadata.preview_url} controls preload="metadata" style={{ width: 180, maxHeight: 220, borderRadius: 8, background: '#111' }} />}
          {artifact.metadata?.preview_url && /^(post|carousel)$/i.test(artifact.artifact_type) && <img src={artifact.metadata.preview_url} alt={`Preview de ${artifact.title}`} style={{ width: 140, maxHeight: 180, objectFit: 'cover', borderRadius: 8, background: '#111' }} />}
        </article>)}
      </section>
    </div>
  )
}
