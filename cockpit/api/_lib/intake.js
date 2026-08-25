import crypto from 'node:crypto'
import { db } from './config.js'
import { capabilityForJob, resolveAI } from './ai-router.js'
import { createMediaJob } from './mediaos.js'
import { getClientTruth } from './client-truth.js'
import { capabilityCatalog } from './capability-catalog.js'
import { skillsForSelection } from './skill-registry.js'
import { executeJob } from './executor.js'
import { canExecute } from './quota.js'

const CAPABILITY_TO_REQUEST_TYPE = {
  strategy: 'strategy',
  research: 'research',
  analysis: 'analysis',
  funnel: 'funnel',
  ads: 'ads',
  automation: 'automation',
  data_sync: 'data_sync',
  carousel: 'carousel',
  post: 'post',
  copy: 'copy',
  image_generate: 'image_generate',
  video_generate: 'generative_video',
  video_edit: 'video',
  publish: 'publish',
}

const CAPABILITIES = new Set(Object.keys(CAPABILITY_TO_REQUEST_TYPE))

function requestTypeForCapability(capability) {
  return CAPABILITY_TO_REQUEST_TYPE[capability] || 'other'
}

function buildReferenceSnapshot(profile, reference) {
  return {
    client: { client_id: profile?.client_id || null, display_name: profile?.display_name || null, company_name: profile?.company_name || null },
    brand_profile: reference?.brand_profile || {},
    voice_profile: reference?.voice_profile || {},
    offers: reference?.offers || [],
    constraints: reference?.constraints || [],
    approved_examples: reference?.approved_examples || [],
    notes: reference?.notes || null,
    captured_at: new Date().toISOString(),
  }
}

export async function listMissions() {
  const [jobs, artifacts, clients, executionResults] = await Promise.all([
    db('media_jobs?select=id,request_id,client_id,job_type,capability,status,priority,executor,result,error,created_at,started_at,completed_at&order=created_at.desc&limit=100'),
    db('artifacts?select=id,client_id,job_id,artifact_type,title,status,current_version,metadata,created_at,updated_at&order=updated_at.desc&limit=100'),
    db('client_profiles?select=client_id,display_name,company_name,status&order=display_name.asc'),
    db('execution_results?select=id,correlation_id,executor,result,job_id,client_id,artifact_refs,blockers,next_action,created_at&order=created_at.desc&limit=100').catch(() => []),
  ])
  return {
    capabilities: capabilityCatalog(),
    skills: skillsForSelection(),
    jobs: jobs || [],
    artifacts: artifacts || [],
    clients: clients || [],
    executionResults: executionResults || [],
  }
}

export async function createMission({ body, user }) {
  const clientId = String(body.clientId || '').trim().toLowerCase()
  const title = String(body.title || '').trim()
  const rawCapability = String(body.capability || body.requestType || 'strategy').trim()
  const capability = CAPABILITIES.has(rawCapability) ? rawCapability : 'strategy'
  const requestType = requestTypeForCapability(capability)
  const objective = String(body.objective || '').trim() || title || null
  const priority = String(body.priority || 'normal').trim()
  const requiresApproval = body.requiresApproval !== false

  if (!clientId || !title) throw Object.assign(new Error('Informe cliente e título da missão.'), { statusCode: 400 })

  const quota = await canExecute(clientId, capability)
  if (!quota.ok) throw Object.assign(new Error(quota.message), { statusCode: 402, quota })

  const profiles = await db(`client_profiles?client_id=eq.${encodeURIComponent(clientId)}&select=client_id,display_name,company_name,status&limit=1`)
  const profile = profiles?.[0]
  if (!profile) throw Object.assign(new Error('Cliente não encontrado.'), { statusCode: 404 })

  const truth = await getClientTruth(clientId)
  if (!truth?.profile) throw Object.assign(new Error('Cliente não encontrado.'), { statusCode: 404 })
  if (!truth.validation.valid) throw Object.assign(new Error('Complete o contexto do cliente antes de produzir.'), { statusCode: 422, onboarding: truth.validation })
  const reference = truth.reference || {}

  const now = new Date().toISOString()
  const referenceSnapshot = buildReferenceSnapshot(profile, reference)

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
      target_system: 'marketingos',
      status: 'routed',
      requires_approval: requiresApproval,
      reference_snapshot: referenceSnapshot,
      payload: { original_prompt: body.prompt || title, capability, requested_via: 'missions' },
      updated_at: now,
    }),
  })

  const request = created?.[0]
  if (!request?.id) throw Object.assign(new Error('Não foi possível criar o pedido.'), { statusCode: 500 })

  const route = resolveAI({ capability, complexity: body.complexity || 'normal', credentialSource: body.credentialSource || 'marketingos', connection: null, policy: {}, estimatedCost: Number(body.estimatedCost || 0) })

  // Cache/idempotência: briefing idêntico já concluído → reutiliza (não gasta cota 2×)
  const cacheKey = crypto.createHash('sha256').update(JSON.stringify({ clientId, capability, title, prompt: body.prompt || '', brief: body.brief || '' })).digest('hex')
  const cached = await db(`media_jobs?client_id=eq.${encodeURIComponent(clientId)}&idempotency_key=eq.${cacheKey}&status=in.(review,approved,published,done)&select=id,status,result&order=created_at.desc&limit=1`).catch(() => [])
  if (cached?.[0]) {
    return { cached: true, request: null, job: cached[0], route: null, execution: { ok: true, cached: true, jobId: cached[0].id, status: cached[0].status } }
  }

  const job = await createMediaJob({
    requestId: request.id,
    clientId,
    jobType: capability,
    capability,
    skillId: route.skillId,
    idempotencyKey: cacheKey,
    input: {
      title, objective, prompt: body.prompt || title, brief: body.brief || body.prompt || title,
      headline: body.headline || null, body: body.body || null, cta: body.cta || null,
      audience: body.audience || null, budget: body.budget || null, channels: Array.isArray(body.channels) ? body.channels : [],
      sources: Array.isArray(body.sources) ? body.sources : [], findings: Array.isArray(body.findings) ? body.findings : [],
      trigger: body.trigger || null, routing: body.routing || null, consent: body.consent === true,
      client_truth: referenceSnapshot,
      route: { provider: route.provider, model: route.model, executor: route.executor, executionMode: route.executionMode, connectionId: route.connectionId || null },
    },
    createdBy: user?.id || null,
    requiresApproval,
  })

  await db('ai_runs', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({
      job_id: job.id, client_id: clientId, capability, provider: route.provider, model: route.model,
      credential_source: route.credentialSource, status: 'started', skill_id: route.skillId || null,
      metadata: { executor: route.executor, execution_mode: route.executionMode, skill_id: route.skillId || null },
    }),
  }).catch(() => null)

  const execution = await executeJob(job, route)

  return { request, job: { ...job, status: execution.ok ? 'review' : 'error', result: execution.result || null, error: execution.error || null }, route, execution }
}
