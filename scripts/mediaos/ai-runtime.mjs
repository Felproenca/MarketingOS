import crypto from 'node:crypto'
import { decrypt } from '../../cockpit/api/_lib/config.js'

const base = String(process.env.SUPABASE_URL || '').replace(/\/$/, '').replace(/\/rest\/v1$/, '')
const serviceKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
const headers = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json' }

async function db(path, options = {}) {
  const response = await fetch(`${base}/rest/v1/${path}`, { ...options, headers: { ...headers, ...(options.headers || {}) } })
  const text = await response.text()
  if (!response.ok) throw new Error(`AI runtime Supabase ${response.status}: ${text.slice(0, 300)}`)
  return text ? JSON.parse(text) : null
}

function platformKey(provider) {
  const keys = {
    anthropic: process.env.ANTHROPIC_API_KEY,
    openai: process.env.OPENAI_API_KEY,
    deepseek: process.env.DEEPSEEK_API_KEY,
    qwen: process.env.QWEN_API_KEY,
    fal: process.env.FAL_KEY,
    kie: process.env.KIE_API_KEY,
  }
  return keys[provider] || null
}

export async function loadTenantAI({ clientId, connectionId, capability }) {
  const filter = connectionId ? `id=eq.${encodeURIComponent(connectionId)}&client_id=eq.${encodeURIComponent(clientId)}` : `client_id=eq.${encodeURIComponent(clientId)}`
  const rows = await db(`provider_connections?${filter}&status=eq.active&select=id,client_id,provider,connection_type,execution_mode,secret_ref,metadata,capabilities,monthly_budget,monthly_spend&order=updated_at.desc&limit=20`).catch(() => [])
  const connection = connectionId ? rows?.[0] : rows?.find(row => !row.capabilities?.length || row.capabilities.includes(capability))
  if (!connection) return { connection: null, policy: await loadPolicy(clientId) }
  const apiKey = connection.execution_mode === 'platform_api' || connection.secret_ref?.startsWith('platform:')
    ? platformKey(connection.provider)
    : connection.secret_ref?.startsWith('oauth:') ? null : decrypt(connection.secret_ref)
  return { connection: { ...connection, apiKey }, policy: await loadPolicy(clientId) }
}

async function loadPolicy(clientId) {
  const rows = await db(`ai_client_policies?client_id=eq.${encodeURIComponent(clientId)}&select=*&limit=1`).catch(() => [])
  return rows?.[0] || { mode: 'balanced', max_attempts: 3, allow_external_fallback: true }
}

export function externalPrompt(input = {}) {
  return [
    'Gere uma imagem profissional para o seguinte objetivo de marketing.',
    `Objetivo: ${input.objective || input.title || 'não informado'}`,
    `Brief: ${input.brief || input.prompt || input.title || 'não informado'}`,
    `Público: ${input.audience || 'público definido no briefing'}`,
    `Formato: ${input.format || 'definir conforme canal'}`,
    'Direção: composição clara, hierarquia visual forte, sem texto ilegível, sem logos inventados e respeitando a identidade visual enviada.',
    'Entregue uma imagem limpa, comercial e pronta para revisão no MarketingOS.',
  ].join('\n')
}

export async function generateImage({ clientId, job }) {
  const { connection, policy } = await loadTenantAI({ clientId, connectionId: job.input?.connection_id || job.input?.connectionId, capability: 'image_generate' })
  const prompt = externalPrompt(job.input)
  if (!connection) {
    const error = Object.assign(new Error('Cliente sem conexão visual ativa. Gere a imagem externamente e envie o arquivo para concluir o job.'), { blocked: true, retryable: false, externalPrompt: prompt })
    throw error
  }
  if (policy.monthly_budget != null && Number(policy.monthly_spend || 0) >= Number(policy.monthly_budget)) {
    const error = Object.assign(new Error('Orçamento de IA visual do cliente esgotado. Gere externamente ou ajuste o limite.'), { blocked: true, retryable: false, externalPrompt: prompt })
    throw error
  }
  if (connection.provider === 'fal') return generateFal(connection, prompt, job)
  if (connection.provider === 'kie') return generateKie(connection, prompt, job)
  throw Object.assign(new Error(`Provider visual ${connection.provider} não possui executor configurado.`), { blocked: true, retryable: false, externalPrompt: prompt })
}

export async function generateVideo({ clientId, job }) {
  const { connection } = await loadTenantAI({ clientId, connectionId: job.input?.connection_id || job.input?.connectionId, capability: 'video_generate' })
  const prompt = externalPrompt({ ...job.input, format: job.input?.format || 'vídeo vertical 9:16, 6 a 10 segundos' })
  if (!connection) throw Object.assign(new Error('Cliente sem conexão de vídeo generativo. Gere o vídeo externamente e envie o arquivo para concluir o job.'), { blocked: true, retryable: false, externalPrompt: prompt })
  if (connection.provider !== 'fal') throw Object.assign(new Error(`Provider de vídeo ${connection.provider} ainda não possui executor configurado.`), { blocked: true, retryable: false, externalPrompt: prompt })
  const model = connection.metadata?.default_model
  if (!model) throw Object.assign(new Error('Configure o model_id de vídeo generativo na conexão fal.ai.'), { blocked: true, retryable: false, externalPrompt: prompt })
  const queuedResponse = await fetch(`https://queue.fal.run/${model}`, { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Key ${connection.apiKey}` }, body: JSON.stringify({ prompt, aspect_ratio: '9:16' }) })
  const queued = await queuedResponse.json().catch(() => ({}))
  if (!queuedResponse.ok || !queued.request_id) throw new Error(queued.detail || queued.message || `fal recusou o vídeo (${queuedResponse.status})`)
  const deadline = Date.now() + Number(process.env.AI_MEDIA_TIMEOUT_MS || 300000)
  while (Date.now() < deadline) {
    const statusResponse = await fetch(`https://queue.fal.run/${model}/requests/${queued.request_id}/status`, { headers: { authorization: `Key ${connection.apiKey}` } })
    const status = await statusResponse.json().catch(() => ({}))
    if (status.status === 'COMPLETED') {
      const resultResponse = await fetch(`https://queue.fal.run/${model}/requests/${queued.request_id}`, { headers: { authorization: `Key ${connection.apiKey}` } })
      const result = await resultResponse.json()
      const sourceUrl = result.video?.url || result.videos?.[0]?.url
      if (!sourceUrl) throw new Error('fal concluiu o vídeo sem URL.')
      return { provider: 'fal', model, connectionId: connection.id, requestId: queued.request_id, prompt, sourceUrl, raw: result }
    }
    if (status.status === 'FAILED' || status.status === 'ERROR') throw new Error(status.error || 'fal falhou na geração de vídeo.')
    await new Promise(resolve => setTimeout(resolve, 3000))
  }
  throw Object.assign(new Error('fal excedeu o timeout de vídeo generativo.'), { retryable: true })
}

async function generateFal(connection, prompt, job) {
  const model = connection.metadata?.default_model || 'fal-ai/flux/schnell'
  const response = await fetch(`https://queue.fal.run/${model}`, { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Key ${connection.apiKey}` }, body: JSON.stringify({ prompt }) })
  const queued = await response.json().catch(() => ({}))
  if (!response.ok || !queued.request_id) throw new Error(queued.detail || queued.message || `fal recusou a geração (${response.status})`)
  const deadline = Date.now() + Number(process.env.AI_MEDIA_TIMEOUT_MS || 180000)
  while (Date.now() < deadline) {
    const statusResponse = await fetch(`https://queue.fal.run/${model}/requests/${queued.request_id}/status`, { headers: { authorization: `Key ${connection.apiKey}` } })
    const status = await statusResponse.json().catch(() => ({}))
    if (status.status === 'COMPLETED') {
      const resultResponse = await fetch(`https://queue.fal.run/${model}/requests/${queued.request_id}`, { headers: { authorization: `Key ${connection.apiKey}` } })
      const result = await resultResponse.json()
      const url = result.images?.[0]?.url || result.image?.url
      if (!url) throw new Error('fal concluiu sem URL de imagem.')
      return { provider: 'fal', model, connectionId: connection.id, requestId: queued.request_id, prompt, sourceUrl: url, raw: result, estimatedCost: 0 }
    }
    if (status.status === 'FAILED' || status.status === 'ERROR') throw new Error(status.error || 'fal falhou na geração.')
    await new Promise(resolve => setTimeout(resolve, 2000))
  }
  throw Object.assign(new Error('fal excedeu o timeout de geração.'), { retryable: true })
}

async function generateKie(connection, prompt, job) {
  const endpoint = connection.metadata?.endpoint
  if (!endpoint) throw Object.assign(new Error('KIE sem endpoint de modelo configurado.'), { blocked: true, retryable: false, externalPrompt: prompt })
  const response = await fetch(endpoint, { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${connection.apiKey}` }, body: JSON.stringify({ prompt, job_id: job.id }) })
  const result = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(result.message || `KIE recusou a geração (${response.status})`)
  const sourceUrl = result.data?.url || result.url || result.image_url
  if (!sourceUrl) throw new Error('KIE não retornou URL de imagem.')
  return { provider: 'kie', model: connection.metadata?.default_model || null, prompt, sourceUrl, raw: result, estimatedCost: 0 }
}

export function hashPrompt(prompt) { return crypto.createHash('sha256').update(String(prompt)).digest('hex') }
