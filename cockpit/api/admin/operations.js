import crypto from 'node:crypto'
import { db } from '../_lib/config.js'
import { authError, requireAdmin, requireClientAccess, requireUser } from '../_lib/auth.js'
import { capabilityForJob, resolveAI } from '../_lib/ai-router.js'
import { createMediaJob } from '../_lib/mediaos.js'
import { getClientTruth, validateClientTruth } from '../_lib/client-truth.js'
import { capabilityCatalog } from '../_lib/capability-catalog.js'
import { skillsForSelection } from '../_lib/skill-registry.js'
import { runSync } from '../_lib/sync.js'
import { clientReport } from '../_lib/reporting.js'
import { createMission } from '../_lib/intake.js'
import { handleCors } from '../_lib/cors.js'

const REQUEST_TYPES = new Set(['carousel', 'mass_publish', 'video', 'generative_video', 'image', 'image_generate', 'creative', 'post', 'research', 'market_research', 'ads', 'analysis', 'data_sync', 'strategy', 'funnel', 'prospecting', 'acquisition', 'automation', 'relationship', 'publish', 'other'])
const STATUSES = new Set(['queued', 'referenced', 'routed', 'running', 'review', 'approved', 'published', 'done', 'blocked', 'error'])

// These routes have contracts and documentation, but no unattended MediaOS
// executor yet. Rejecting them at intake is intentional: a request must not
// appear operational and fail later in the worker with a generic error.
const NON_OPERATIONAL_REQUESTS = new Set(['creative', 'mass_publish', 'other'])

function routeRequest(type) {
  if (type === 'carousel') return 'fluxos'
  if (type === 'mass_publish') return 'fluxos'
  if (type === 'video' || type === 'creative') return 'editoros'
  if (type === 'image' || type === 'image_generate') return 'desingos'
  if (type === 'generative_video') return 'editoros'
  if (type === 'post') return 'mediaos'
  if (type === 'research' || type === 'market_research') return 'growthos'
  if (type === 'ads') return 'mediaos'
  if (type === 'analysis') return 'growthos'
  if (type === 'data_sync') return 'data_now'
  if (type === 'strategy' || type === 'funnel') return 'marketingos'
  if (type === 'prospecting') return 'marketingos'
  if (type === 'acquisition') return 'marketingos'
  if (type === 'automation') return 'marketingos'
  if (type === 'relationship') return 'marketingos'
  if (type === 'publish' || type === 'mass_publish') return 'mediaos'
  return 'marketingos'
}

function systemsFor(type) {
  if (type === 'carousel') return ['marketingos', 'reference', 'fluxos', 'editoros', 'mediaos', 'data_now']
  if (type === 'mass_publish') return ['marketingos', 'reference', 'fluxos', 'mediaos', 'data_now']
  if (type === 'video') return ['marketingos', 'reference', 'fluxos', 'editoros', 'mediaos', 'data_now']
  if (type === 'image' || type === 'image_generate') return ['marketingos', 'reference', 'desingos', 'mediaos', 'data_now']
  if (type === 'generative_video') return ['marketingos', 'reference', 'editoros', 'mediaos', 'data_now']
  if (type === 'creative' || type === 'post') return ['marketingos', 'reference', 'desingos', 'mediaos']
  if (type === 'research' || type === 'market_research') return ['marketingos', 'reference', 'growthos', 'data_now']
  if (type === 'ads') return ['marketingos', 'reference', 'mediaos', 'data_now']
  if (type === 'analysis') return ['data_now', 'reference', 'growthos', 'marketingos']
  if (type === 'data_sync') return ['data_now', 'marketingos']
  if (type === 'strategy' || type === 'funnel') return ['marketingos', 'reference', 'mediaos', 'data_now']
  if (type === 'prospecting') return ['marketingos', 'data_now']
  if (type === 'acquisition') return ['marketingos', 'data_now']
  if (type === 'automation') return ['marketingos', 'mediaos']
  if (type === 'relationship') return ['marketingos', 'mediaos']
  if (type === 'publish' || type === 'mass_publish') return ['marketingos', 'mediaos', 'data_now']
  return ['marketingos', 'reference']
}

function buildReferenceSnapshot(profile, reference) {
  return {
    client: {
      client_id: profile?.client_id || null,
      display_name: profile?.display_name || null,
      company_name: profile?.company_name || null,
    },
    brand_profile: reference?.brand_profile || {},
    voice_profile: reference?.voice_profile || {},
    offers: reference?.offers || [],
    constraints: reference?.constraints || [],
    approved_examples: reference?.approved_examples || [],
    notes: reference?.notes || null,
    captured_at: new Date().toISOString(),
  }
}

export default async function handler(request, response) {
  if (handleCors(request, response)) return
  if (!['GET', 'POST', 'PATCH'].includes(request.method)) return response.status(405).json({ error: 'method_not_allowed' })
  try {
    if (request.method === 'POST' && request.body?.action === 'hermes') return hermesAction(request, response)
    if (request.method === 'GET' && request.query.health === '1') return response.status(200).json({ ok: true, service: 'marketingos-cockpit', timestamp: new Date().toISOString() })
    if (request.method === 'POST' && request.body?.action === 'ingest_execution_result') return ingestExecutionResult(request, response)
    if (request.method === 'POST' && request.body?.action === 'run_sync') return runSyncAction(request, response)
    if (request.method === 'POST' && request.body?.action === 'create_mission') return createMissionAction(request, response)
    if (request.method === 'POST' && request.body?.action === 'analyze') return analyzeAction(request, response)
    if (request.method === 'POST' && request.body?.action === 'agenda') return agendaAction(request, response)
    const user = await requireAdmin(request)
    if (request.method === 'GET' && String(request.query.report || '').startsWith('client:')) {
      return response.status(200).json(await clientReport(String(request.query.report).slice(7)))
    }
    if (request.method === 'POST') return createWorkRequest(request, response, user)
    if (request.method === 'PATCH') return updateWorkRequest(request, response)
    return listOperations(response)
  } catch (error) {
    return authError(response, error)
  }
}

function hermesAdminEmails() { return String(process.env.ADMIN_EMAILS || '').split(',').map(value => value.trim().toLowerCase()).filter(Boolean) }
function hermesClean(value, max = 500) { return String(value || '').trim().slice(0, max) }
function hermesReply(message, scope, context) {
  const text = message.toLowerCase()
  if (/cliente|clientes|carteira/.test(text) && scope === 'operator') return `Você tem ${context.clients.length} cliente(s) na operação. ${context.clients.slice(0, 5).map(item => `${item.display_name || item.client_id} (${item.status || 'ativo'})`).join(' · ') || 'Nenhum cliente cadastrado.'}`
  if (/erro|bloque|atenção|problema/.test(text)) return context.errors.length ? `Encontrei ${context.errors.length} ponto(s) que precisam de atenção: ${context.errors.slice(0, 5).map(item => item.title || item.error).join(' · ')}` : 'Não encontrei erros ou bloqueios recentes neste espaço.'
  if (/resultado|entrega|artefato|produção/.test(text)) return `Há ${context.artifacts} entrega(s) e ${context.jobs} job(s) no recorte disponível. ${context.review ? `${context.review} aguarda(m) revisão/aprovação.` : 'Nenhuma entrega aguarda revisão.'}`
  if (/conex|instagram|meta|dados/.test(text)) return `Conexões sociais do espaço: ${context.connections}. A chave de IA é configurada no painel de conexões e fica criptografada.`
  if (/status|online|sistema|agora/.test(text)) return `Sistema online. ${context.jobs} job(s), ${context.artifacts} entrega(s) e ${context.errors.length} alerta(s) no recorte atual.`
  return scope === 'operator' ? 'Sou o Hermes da operação. Posso consultar clientes, fila, entregas, erros e conexões.' : 'Sou o Hermes do seu espaço. Posso explicar seus pedidos, entregas, conexões e próximos passos. Não tenho acesso a outros clientes.'
}
async function hermesContext(scope, clientId) {
  const suffix = clientId ? `&client_id=eq.${encodeURIComponent(clientId)}` : ''
  const [clients, jobs, artifacts, requests, connections] = await Promise.all([
    scope === 'operator' ? db('client_profiles?select=client_id,display_name,status&order=display_name.asc&limit=100') : db(`client_profiles?client_id=eq.${encodeURIComponent(clientId)}&select=client_id,display_name,status&limit=1`),
    db(`media_jobs?select=id,job_type,status,error,client_id&order=created_at.desc&limit=50${suffix}`),
    db(`artifacts?select=id,title,status,client_id&order=updated_at.desc&limit=50${suffix}`),
    db(`work_requests?select=id,title,status,client_id&order=created_at.desc&limit=50${suffix}`),
    db(`connections?select=client_id,source&limit=100${suffix}`).catch(() => []),
  ])
  const jobRows = jobs || []; const artifactRows = artifacts || []; const requestRows = requests || []
  return { clients: clients || [], jobs: jobRows.length, artifacts: artifactRows.length, review: artifactRows.filter(item => item.status === 'review').length, connections: (connections || []).length, errors: jobRows.filter(item => ['error', 'blocked'].includes(item.status) || item.error).concat(requestRows.filter(item => ['error', 'blocked'].includes(item.status))) }
}
async function hermesAction(request, response) {
  const body = request.body || {}; const message = hermesClean(body.message, 1200)
  if (!message) return response.status(400).json({ error: 'message_required' })
  const user = await requireUser(request); const isAdmin = Boolean(user.email && hermesAdminEmails().includes(user.email.toLowerCase()))
  const clientId = hermesClean(body.clientId, 100).toLowerCase(); const scope = isAdmin ? 'operator' : 'client'
  if (isAdmin) await requireAdmin(request)
  else { if (!clientId) return response.status(400).json({ error: 'client_id_required' }); await requireClientAccess(request, clientId, db) }
  const context = await hermesContext(scope, clientId)
  return response.status(200).json({ ok: true, assistant: 'hermes', scope, clientId: clientId || null, reply: hermesReply(message, scope, context), context: { jobs: context.jobs, artifacts: context.artifacts, review: context.review, alerts: context.errors.length } })
}

function safeSecret(a, b) {
  const left = Buffer.from(String(a || ''))
  const right = Buffer.from(String(b || ''))
  return left.length > 0 && left.length === right.length && crypto.timingSafeEqual(left, right)
}

async function createMissionAction(request, response) {
  if (!safeSecret(request.headers['x-mediaos-execution-secret'], process.env.MEDIAOS_EXECUTION_INGEST_SECRET)) return response.status(401).json({ error: 'create_unauthorized' })
  try {
    const result = await createMission({ body: request.body || {}, user: { id: '00000000-0000-0000-0000-000000000001', email: String(process.env.ADMIN_EMAILS || '').split(',')[0] || 'operator@mkos.online' } })
    return response.status(201).json(result)
  } catch (e) {
    return response.status(e.statusCode || 500).json({ error: e.message, quota: e.quota || null })
  }
}

async function analyzeAction(request, response) {
  if (!safeSecret(request.headers['x-mediaos-execution-secret'], process.env.MEDIAOS_EXECUTION_INGEST_SECRET)) return response.status(401).json({ error: 'analyze_unauthorized' })
  const clientId = String(request.body?.clientId || '').trim().toLowerCase()
  if (!clientId) return response.status(400).json({ error: 'clientId obrigatorio' })
  try {
    // Cria um job de análise na fila; o mediaos-worker local roda o pipeline de insights
    // (métricas → DeepSeek → artifact analysis + pautas de agenda) e ingesta o resultado.
    const wr = await db('work_requests', { method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify({ client_id: clientId, title: 'Análise de dados', request_type: 'analysis', status: 'queued', source_system: 'marketingos', target_system: 'marketingos', requires_approval: true, payload: {}, created_at: new Date().toISOString() }) })
    const request = wr?.[0]
    const job = await db('media_jobs', { method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify({ client_id: clientId, request_id: request?.id || null, job_type: 'analysis', capability: 'analysis', status: 'queued', priority: 'normal', input: { title: 'Análise de dados coletados', objective: 'Analisar os dados coletados e gerar insights + pautas' }, created_at: new Date().toISOString() }) })
    return response.status(202).json({ ok: true, job: job?.[0]?.id || null, message: 'Análise enfileirada — o worker processa e gera o relatório + pautas da agenda.' })
  } catch (e) {
    return response.status(e.statusCode || 500).json({ error: e.message || 'analyze_failed' })
  }
}

// Agenda editorial por cliente: itens propostos pelo operador, aprovados pelo cliente
// no portal, e convertidos em solicitações reais de produção (action=generate).
// Modelagem: cada item é um work_request com request_type='agenda_item' (não gera job).
// Status: proposta | aprovado | recusado | gerado.
const AGENDA_TYPES = new Set(['carousel', 'post', 'video', 'strategy', 'research', 'analysis', 'funnel', 'design', 'reel', 'image'])
const AGENDA_STAGES = new Set(['topo', 'meio', 'fundo', 'retencao'])
const AGENDA_CHANNELS = new Set(['instagram', 'site', 'google', 'whatsapp', 'multicanal'])

function agendaMetadata(item = {}) {
  const stage = String(item.funnel_stage || '').toLowerCase()
  const channel = String(item.channel || '').toLowerCase()
  return {
    type: AGENDA_TYPES.has(String(item.type)) ? String(item.type) : 'post',
    objective: String(item.objective || '').trim().slice(0, 1200),
    due_date: item.due_date || null,
    funnel_stage: AGENDA_STAGES.has(stage) ? stage : 'topo',
    channel: AGENDA_CHANNELS.has(channel) ? channel : 'instagram',
    format: String(item.format || '').trim().slice(0, 120),
    pillar: String(item.pillar || '').trim().slice(0, 160),
    cta: String(item.cta || '').trim().slice(0, 300),
    kpi: String(item.kpi || '').trim().slice(0, 120),
  }
}

async function agendaAction(request, response) {
  const body = request.body || {}
  const sub = String(body.subAction || '').toLowerCase()
  const clientId = String(body.clientId || '').trim().toLowerCase()
  if (!['list', 'create', 'approve', 'reject', 'generate'].includes(sub)) return response.status(400).json({ error: 'subAction inválido (list|create|approve|reject|generate)' })
  try {
    if (sub === 'list') {
      const suffix = clientId ? `&client_id=eq.${encodeURIComponent(clientId)}` : ''
      const rows = await db(`work_requests?request_type=eq.agenda_item&select=id,client_id,title,status,payload,created_at,updated_at&order=created_at.desc&limit=100${suffix}`)
      return response.status(200).json({ items: (rows || []).map(row => ({ id: row.id, client_id: row.client_id, title: row.title, status: row.status, ...agendaMetadata(row.payload?.agenda), production_request_id: row.payload?.agenda?.production_request_id || null, created_at: row.created_at })) })
    }
    if (sub === 'create') {
      if (!clientId) return response.status(400).json({ error: 'clientId obrigatorio' })
      const items = Array.isArray(body.items) ? body.items : []
      const created = []
      for (const item of items) {
        const title = String(item.title || '').trim()
        if (!title) continue
        const agenda = agendaMetadata(item)
        const row = await db('work_requests', { method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify({ client_id: clientId, title, request_type: 'agenda_item', status: 'proposta', source_system: 'marketingos', target_system: 'marketingos', requires_approval: true, payload: { agenda }, created_at: new Date().toISOString() }) })
        if (row?.[0]?.id) created.push({ id: row[0].id, title, ...agenda, status: 'proposta' })
      }
      return response.status(201).json({ ok: true, created })
    }
    const itemIds = Array.isArray(body.itemIds) ? body.itemIds.map(String) : []
    if (sub === 'approve' || sub === 'reject') {
      if (!itemIds.length) return response.status(400).json({ error: 'itemIds obrigatorio' })
      const next = sub === 'approve' ? 'aprovado' : 'recusado'
      for (const id of itemIds) {
        await db(`work_requests?id=eq.${encodeURIComponent(id)}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ status: next, updated_at: new Date().toISOString() }) })
      }
      return response.status(200).json({ ok: true, updated: itemIds.length })
    }
    // generate: converte itens aprovados em solicitações reais de produção
    if (!clientId) return response.status(400).json({ error: 'clientId obrigatorio para generate' })
    const rows = await db(`work_requests?request_type=eq.agenda_item&client_id=eq.${encodeURIComponent(clientId)}&status=eq.aprovado&select=id,title,payload&order=created_at.asc&limit=30`)
    const approved = (rows || []).filter(row => !itemIds.length || itemIds.includes(row.id))
    const operator = { id: '00000000-0000-0000-0000-000000000001', email: String(process.env.ADMIN_EMAILS || '').split(',')[0] || 'operator@mkos.online' }
    const generated = []
    for (const item of approved) {
      const agenda = agendaMetadata(item.payload?.agenda)
      const context = [`Item da agenda aprovado pelo cliente: ${item.title}.`, `Etapa do funil: ${agenda.funnel_stage}.`, `Canal: ${agenda.channel}.`, agenda.format && `Formato: ${agenda.format}.`, agenda.pillar && `Pilar: ${agenda.pillar}.`, agenda.objective && `Objetivo: ${agenda.objective}.`, agenda.cta && `CTA: ${agenda.cta}.`, agenda.kpi && `KPI principal: ${agenda.kpi}.`].filter(Boolean).join(' ')
      const result = await createMission({ body: { clientId, title: item.title, requestType: agenda.type || 'post', objective: agenda.objective || item.title, prompt: context, priority: 'normal', source: 'agenda' }, user: operator })
      const requestId = result?.request?.id || null
      await db(`work_requests?id=eq.${encodeURIComponent(item.id)}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ status: 'gerado', payload: { ...(item.payload || {}), agenda: { ...agenda, production_request_id: requestId } }, updated_at: new Date().toISOString() }) })
      generated.push({ agenda_item_id: item.id, production_request_id: requestId, title: item.title })
    }
    return response.status(200).json({ ok: true, generated })
  } catch (e) {
    return response.status(e.statusCode || 500).json({ error: e.message || 'agenda_failed' })
  }
}

async function runSyncAction(request, response) {
  if (!safeSecret(request.headers['x-mediaos-execution-secret'], process.env.MEDIAOS_EXECUTION_INGEST_SECRET)) return response.status(401).json({ error: 'sync_unauthorized' })
  const clientId = String(request.body?.clientId || '').trim().toLowerCase()
  const source = String(request.body?.source || '').trim()
  if (!clientId || !['instagram', 'meta_ads', 'youtube', 'google_ads'].includes(source)) return response.status(400).json({ error: 'clientId_e_source_obrigatorios' })
  const result = await runSync(clientId, source)
  return response.status(result.ok ? 200 : 502).json(result)
}

async function ingestExecutionResult(request, response) {
  if (!safeSecret(request.headers['x-mediaos-execution-secret'], process.env.MEDIAOS_EXECUTION_INGEST_SECRET)) return response.status(401).json({ error: 'execution_ingest_unauthorized' })
  const body = request.body || {}
  const execution = body.executionResult
  if (!execution?.correlation_id || execution.contract_type !== 'execution_result') return response.status(400).json({ error: 'execution_result_invalid' })
  if (!['completed', 'blocked', 'failed'].includes(execution.result)) return response.status(400).json({ error: 'execution_result_status_invalid' })
  const now = new Date().toISOString()
  const rows = await db('execution_results', {
    method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
    body: JSON.stringify({ correlation_id: execution.correlation_id, executor: execution.executor, result: execution.result, job_id: body.jobId || null, client_id: body.clientId || null, artifact_refs: execution.artifact_refs || [], quality_refs: execution.quality_refs || [], blockers: execution.blockers || [], next_action: execution.next_action || null, payload: { execution, manifest: body.manifest || null, quality: body.quality || null }, updated_at: now }),
  })
  const jobId = body.jobId
  if (jobId) {
    const nextStatus = execution.result === 'completed' ? 'review' : execution.result
    await db(`media_jobs?id=eq.${encodeURIComponent(jobId)}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ status: nextStatus, result: { execution_result: execution, manifest: body.manifest || null, quality: body.quality || null }, error: execution.result === 'completed' ? null : (execution.blockers || []).join(', '), completed_at: execution.result === 'completed' ? now : null, updated_at: now }) })
    await db('media_job_events', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ job_id: jobId, event_type: 'execution_result_ingested', from_status: null, to_status: nextStatus, message: execution.next_action || `Executor ${execution.executor}: ${execution.result}`, metadata: { correlation_id: execution.correlation_id, blockers: execution.blockers || [] } }) }).catch(() => null)
  }
  return response.status(200).json({ ok: true, executionResult: rows?.[0] || null, jobId: jobId || null })
}

async function listOperations(response) {
  const clients = await db('client_profiles?select=client_id,display_name,company_name,status,updated_at&order=display_name.asc')
  const references = await db('client_references?select=client_id,brand_profile,voice_profile,offers,constraints,approved_examples,notes,updated_at')
  const requests = await db('work_requests?select=id,client_id,title,request_type,objective,priority,source_system,target_system,status,requires_approval,reference_snapshot,payload,created_at,updated_at&order=created_at.desc&limit=50')
  const events = await db('work_request_events?select=request_id,event_type,to_status,message,created_at&order=created_at.desc&limit=120')
  const jobs = await db('media_jobs?select=id,request_id,client_id,job_type,capability,status,priority,executor,input,result,created_at,started_at,completed_at,error&order=created_at.desc&limit=100')
  const artifacts = await db('artifacts?select=id,client_id,job_id,artifact_type,title,status,current_version,metadata,created_at,updated_at&order=updated_at.desc&limit=100')
  const artifactVersions = await db('artifact_versions?select=artifact_id,version,preview_url,manifest,qa&order=version.desc&limit=300').catch(() => [])
  const executionResults = await db('execution_results?select=id,correlation_id,executor,result,job_id,client_id,artifact_refs,quality_refs,blockers,next_action,created_at,updated_at&order=created_at.desc&limit=100').catch(() => [])
  const systemStatus = await getSystemStatus()

  return response.status(200).json({
    clients: (clients || []).map(client => {
      const reference = (references || []).find(item => item.client_id === client.client_id)
      const validation = validateClientTruth({ client, client_id: client.client_id, ...(reference || {}) })
      return { ...client, onboarding: validation }
    }),
    references: references || [],
    jobs: jobs || [],
    artifacts: (artifacts || []).map(artifact => ({ ...artifact, qa: (artifactVersions || []).find(version => version.artifact_id === artifact.id && Number(version.version) === Number(artifact.current_version))?.qa || null, preview_url: (artifactVersions || []).find(version => version.artifact_id === artifact.id && Number(version.version) === Number(artifact.current_version))?.preview_url || artifact.metadata?.preview_url || null })),
    executionResults: executionResults || [],
    capabilities: capabilityCatalog(),
    skills: skillsForSelection(),
    systemStatus,
    requests: (requests || []).map(item => ({
      ...item,
      route: systemsFor(item.request_type),
      events: (events || []).filter(event => event.request_id === item.id),
    })),
  })
}

async function safeSystemCheck(path, options) {
  try { const data = await db(path, options); return { ok: true, data } } catch (error) {
    const message = String(error.message || error)
    return { ok: false, status: /Supabase HTTP (\d+)/.exec(message)?.[1] || null, reason: message.replace(/Supabase HTTP \d+: /, '').slice(0, 180) }
  }
}

async function getSystemStatus() {
  const [core, clientProfiles, hardenedJobs, claim, aiConnections, syncRuns] = await Promise.all([
    safeSystemCheck('media_jobs?select=id&limit=1'),
    safeSystemCheck('client_profiles?select=client_id,onboarding_status,truth_version,truth_hash&limit=1'),
    safeSystemCheck('media_jobs?select=id,context_hash,context_status,attempt_count,max_attempts,next_attempt_at,locked_at,locked_by,lease_expires_at,heartbeat_at&limit=1'),
    safeSystemCheck('rpc/claim_media_job', { method: 'POST', body: JSON.stringify({ p_worker_id: 'status-check', p_job_id: '00000000-0000-0000-0000-000000000000', p_lease_seconds: 60 }) }),
    safeSystemCheck('provider_connections?select=provider,connection_type,status,billing_owner&limit=100'),
    safeSystemCheck('data_now_sync_runs?select=client_id,source,status,raw_records,normalized_records,last_error,started_at,finished_at&order=started_at.desc&limit=50'),
  ])
  const hardening = clientProfiles.ok && hardenedJobs.ok && claim.ok
  const activeConnections = aiConnections.ok ? (aiConnections.data || []).filter(row => row.status === 'active') : []
  const connectedProviders = [...new Set(activeConnections.map(row => row.provider))]
  return {
    ok: core.ok && hardening,
    mediaos: { core: core.ok, hardening, claim: claim.ok },
    aiRouter: {
      connections: aiConnections.ok ? (aiConnections.data || []).length : null,
      connectedProviders,
      externalAdapters: { anthropic: Boolean(process.env.ANTHROPIC_API_KEY), openaiCompatible: Boolean(process.env.OPENAI_API_KEY) },
      status: aiConnections.ok && (aiConnections.data || []).some(row => row.status === 'active') ? 'connected' : 'awaiting_connection',
    },
    serviceReadiness: {
      generativeVideo: { ready: connectedProviders.includes('fal'), reason: connectedProviders.includes('fal') ? null : 'Conexão Fal ativa e modelo padrão são necessários.' },
      instagramPublishing: { ready: connectedProviders.includes('meta'), reason: connectedProviders.includes('meta') ? null : 'Conexão Meta ativa e token válido são necessários.' },
      insights: { ready: true, reason: null },
      editedVideo: { ready: true, reason: null },
    },
    dataSync: {
      ok: syncRuns.ok,
      recentRuns: syncRuns.ok ? (syncRuns.data || []).slice(0, 10) : [],
      failures: syncRuns.ok ? (syncRuns.data || []).filter(row => row.status === 'error').length : null,
      status: !syncRuns.ok ? 'unavailable' : (syncRuns.data || []).some(row => row.status === 'success') ? 'connected_or_partial' : 'awaiting_connection',
    },
    checks: { core, client_profiles: clientProfiles, media_jobs_hardening: hardenedJobs, claim_media_job: claim, provider_connections: aiConnections, data_now_sync_runs: syncRuns },
  }
}

async function createWorkRequest(request, response, user) {
  const body = request.body || {}
  const clientId = String(body.clientId || '').trim().toLowerCase()
  const title = String(body.title || '').trim()
  const requestType = String(body.requestType || 'other').trim()
  const objective = String(body.objective || '').trim() || null
  const priority = String(body.priority || 'normal').trim()
  const requiresApproval = body.requiresApproval !== false
  const idempotencyKey = String(request.headers['idempotency-key'] || body.idempotencyKey || '').trim().slice(0, 200) || null

  if (!clientId || !title) return response.status(400).json({ error: 'Informe cliente e titulo do pedido.' })
  if (!REQUEST_TYPES.has(requestType)) return response.status(400).json({ error: 'Tipo de pedido invalido.' })
  if (idempotencyKey) {
    const existing = await db(`work_requests?payload->>idempotency_key=eq.${encodeURIComponent(idempotencyKey)}&select=*&limit=1`).catch(() => [])
    if (existing?.[0]) {
      const jobs = await db(`media_jobs?request_id=eq.${encodeURIComponent(existing[0].id)}&select=*&order=created_at.desc&limit=1`).catch(() => [])
      return response.status(200).json({ request: existing[0], mediaJob: jobs?.[0] || null, route: systemsFor(existing[0].request_type), idempotent: true })
    }
  }
  if (NON_OPERATIONAL_REQUESTS.has(requestType)) {
    return response.status(422).json({
      error: 'capability_not_operational',
      requestType,
      message: 'Este servico ainda possui contrato, mas nao possui executor MediaOS autonomo validado. O pedido nao foi gravado nem colocado na fila.',
      next_step: requestType === 'creative' || requestType === 'post'
        ? 'Conectar o executor de producao do DesingOS, incluindo aprovacao de experiencia e retorno de artifact_manifest/quality_report.'
        : requestType === 'mass_publish'
          ? 'Validar o executor de publicacao em lote com uma fila de artifacts aprovados e recibos por canal.'
          : 'Escolha um tipo de pedido operacional validado; pedidos genericos nao sao executados automaticamente.',
    })
  }

  const profiles = await db(`client_profiles?client_id=eq.${encodeURIComponent(clientId)}&select=client_id,display_name,company_name,status&limit=1`)
  const profile = profiles?.[0]
  if (!profile) return response.status(404).json({ error: 'Cliente nao encontrado.' })

  const clientTruth = await getClientTruth(clientId)
  if (!clientTruth.validation.valid) {
    return response.status(422).json({ error: 'Client Truth incompleta. Complete o onboarding antes de criar um job.', clientId, onboarding: clientTruth.validation })
  }
  const reference = clientTruth.reference
  const targetSystem = routeRequest(requestType)
  const referenceSnapshot = buildReferenceSnapshot(profile, reference)
  const now = new Date().toISOString()

  const created = await db('work_requests', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({
      client_id: clientId,
      title,
      request_type: requestType,
      objective,
      priority,
      source_system: 'marketingos',
      target_system: targetSystem,
      status: 'routed',
      requires_approval: requiresApproval,
      reference_snapshot: referenceSnapshot,
      payload: {
        requested_route: systemsFor(requestType),
        original_prompt: body.prompt || title,
        idempotency_key: idempotencyKey,
      },
      updated_at: now,
    }),
  })

  const item = created?.[0]
  let mediaJob = null
  let mediaJobError = null
  if (item?.id) {
    try {
      await db('work_request_events', {
        method: 'POST',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify([
          {
            request_id: item.id,
            event_type: 'reference_loaded',
            from_status: null,
            to_status: 'referenced',
            message: reference ? 'Referencia do cliente anexada ao pedido.' : 'Pedido criado sem referencia dedicada do cliente.',
            metadata: { has_reference: Boolean(reference) },
          },
          {
            request_id: item.id,
            event_type: 'route_selected',
            from_status: 'referenced',
            to_status: 'routed',
            message: `Roteado para ${targetSystem}.`,
            metadata: { route: systemsFor(requestType) },
          },
        ]),
      })
    } catch (eventError) {
      console.warn('work_request_events_insert_failed', eventError?.message || eventError)
    }
    try {
      const jobType = requestType === 'generative_video' ? 'generative_video' : requestType === 'video' && body.videoMode === 'generate' ? 'generative_video' : requestType === 'video' ? 'video' : ['research', 'market_research'].includes(requestType) ? 'research' : requestType === 'acquisition' ? 'prospecting' : requestType === 'relationship' ? 'automation' : requestType
      const capability = capabilityForJob(jobType)
      const requestedConnectionId = String(body.connectionId || body.connection_id || '').trim()
      const selectedConnections = requestedConnectionId
        ? await db(`provider_connections?id=eq.${encodeURIComponent(requestedConnectionId)}&client_id=eq.${encodeURIComponent(clientId)}&status=eq.active&select=id,client_id,provider,connection_type,execution_mode,metadata,status&limit=1`)
        : []
      if (requestedConnectionId && !selectedConnections?.[0]) throw Object.assign(new Error('Conexão de IA não encontrada, inativa ou pertencente a outro cliente.'), { statusCode: 409 })
      const policies = await db(`ai_client_policies?client_id=eq.${encodeURIComponent(clientId)}&select=*&limit=1`).catch(() => [])
      const connection = selectedConnections?.[0] || null
      const policy = policies?.[0] || { mode: body.aiMode || 'balanced', allow_external_fallback: true }
      const route = resolveAI({ capability, complexity: body.complexity || 'normal', credentialSource: body.credentialSource || 'marketingos', connection, policy, estimatedCost: Number(body.estimatedCost || body.estimated_cost || 0) })
      mediaJob = await createMediaJob({ requestId: item.id, clientId, jobType, capability, skillId: route.skillId, input: { title, objective, prompt: body.prompt || title, brief: body.brief || body.prompt || objective || title, headline: body.headline || null, body: body.body || null, cta: body.cta || null, caption: body.caption || null, sources: Array.isArray(body.sources) ? body.sources : [], findings: Array.isArray(body.findings) ? body.findings : [], recommendations: Array.isArray(body.recommendations) ? body.recommendations : [], audience: body.audience || null, budget: body.budget || null, channels: Array.isArray(body.channels) ? body.channels : [], trigger: body.trigger || null, routing: body.routing || null, consent: body.consent === true, messages: Array.isArray(body.messages) ? body.messages : [], source_path: body.sourcePath || null, video_mode: body.videoMode || 'edit', artifact_id: body.artifactId || body.artifact_id || null, channel: body.channel || null, format: body.format || null, connection_id: requestedConnectionId || null, dry_run: body.dryRun !== false, external_confirmation: body.externalConfirmation === true, route }, createdBy: user.id, requiresApproval })
      const aiRunBody = { job_id: mediaJob.id, client_id: clientId, capability, provider: route.provider, model: route.model, credential_source: route.credentialSource, status: route.executable ? 'planned' : 'blocked', skill_id: route.skillId || null, metadata: { executor: route.executor, route_version: route.routeVersion, connection_id: route.connectionId, execution_mode: route.executionMode, fallback: route.fallback, policy: route.policy, route_status: route.status, skill_id: route.skillId || null } }
      try {
        await db('ai_runs', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify(aiRunBody) })
      } catch (aiRunError) {
        if (!/column .*skill_id|schema cache/i.test(String(aiRunError.message))) throw aiRunError
        const compatBody = { ...aiRunBody }
        delete compatBody.skill_id
        await db('ai_runs', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify(compatBody) })
      }
    } catch (mediaError) {
      mediaJobError = String(mediaError?.message || mediaError)
      console.warn('mediaos_job_creation_skipped', mediaError?.message || mediaError)
    }
  }

  if (item?.id && !mediaJob) {
    return response.status(502).json({ request: item, mediaJob: null, route: systemsFor(requestType), error: 'Pedido criado, mas o MediaOS não conseguiu criar o job.', mediaJobError })
  }
  return response.status(201).json({ request: item, mediaJob, route: systemsFor(requestType) })
}

async function updateWorkRequest(request, response) {
  const body = request.body || {}
  if (body.action === 'retry') return retryMediaJob(request, response, body)
  const id = String(body.id || '').trim()
  const status = String(body.status || '').trim()
  const message = String(body.message || '').trim() || null
  if (!id || !STATUSES.has(status)) return response.status(400).json({ error: 'Informe id e status valido.' })

  const existing = await db(`work_requests?id=eq.${encodeURIComponent(id)}&select=id,status,request_type,payload&limit=1`)
  if (!existing?.[0]) return response.status(404).json({ error: 'Pedido nao encontrado.' })

  // Approval is an artifact decision, never a free-form request status edit.
  // This prevents the operator UI or a forged client request from bypassing
  // QA, artifact_approvals and the publication gate.
  if (['approved', 'published', 'done'].includes(status)) {
    return response.status(409).json({
      error: 'approval_gate_required',
      message: 'Aprovacao, publicacao e conclusao devem ocorrer pelo artifact e pelo executor de distribuicao.',
      next_step: 'Use /api/admin/artifacts para aprovar a versao corrente; publicacao exige um artifact aprovado.',
    })
  }

  const now = new Date().toISOString()
  const updated = await db(`work_requests?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({ status, updated_at: now }),
  })

  await db('work_request_events', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({
      request_id: id,
      event_type: 'status_changed',
      from_status: existing[0].status,
      to_status: status,
      message,
      metadata: {},
    }),
  })

  return response.status(200).json({ request: updated?.[0] || null })
}

async function retryMediaJob(request, response, body) {
  const jobId = String(body.jobId || body.job_id || '').trim()
  if (!jobId) return response.status(400).json({ error: 'job_id_obrigatorio' })
  const rows = await db(`media_jobs?id=eq.${encodeURIComponent(jobId)}&select=id,request_id,job_type,status&limit=1`)
  const job = rows?.[0]
  if (!job) return response.status(404).json({ error: 'Job nao encontrado.' })
  if (!['blocked', 'error'].includes(job.status)) return response.status(409).json({ error: 'Somente jobs blocked/error podem ser reprocessados.' })
  if (job.job_type === 'generative_video') return response.status(409).json({ error: 'Video generativo continua bloqueado: nenhum adapter esta configurado.' })
  const now = new Date().toISOString()
  let updated
  try {
    updated = await db(`media_jobs?id=eq.${encodeURIComponent(jobId)}`, { method: 'PATCH', headers: { Prefer: 'return=representation' }, body: JSON.stringify({ status: 'queued', error: null, last_error: null, attempt_count: 0, next_attempt_at: now, locked_at: null, locked_by: null, lease_expires_at: null, heartbeat_at: null, updated_at: now }) })
  } catch (error) {
    if (!/column .*?(last_error|attempt_count|next_attempt_at|locked_at|locked_by|lease_expires_at|heartbeat_at)|schema cache/i.test(String(error.message))) throw error
    updated = await db(`media_jobs?id=eq.${encodeURIComponent(jobId)}`, { method: 'PATCH', headers: { Prefer: 'return=representation' }, body: JSON.stringify({ status: 'queued', error: null, updated_at: now }) })
  }
  if (job.request_id) {
    await db(`work_requests?id=eq.${encodeURIComponent(job.request_id)}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ status: 'routed', updated_at: now }) })
    await db('work_request_events', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ request_id: job.request_id, event_type: 'job_requeued', from_status: job.status, to_status: 'queued', message: 'Job reprocessado pelo operador.', metadata: { job_id: jobId } }) }).catch(() => null)
  }
  await db('media_job_events', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ job_id: jobId, event_type: 'job_requeued', from_status: job.status, to_status: 'queued', message: 'Job reprocessado pelo operador.', metadata: {} }) }).catch(() => null)
  return response.status(200).json({ job: updated?.[0] || null, requeued: true })
}
