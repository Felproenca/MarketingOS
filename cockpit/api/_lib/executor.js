import crypto from 'node:crypto'
import { db, decrypt } from './config.js'
import { capabilityForJob, resolveAI } from './ai-router.js'
import { deductQuota } from './quota.js'
import { buildCarouselSVGs, buildPostSVG } from './render.js'
import { skillForCapability } from './skill-registry.js'
import { SKILLS_CONTENT } from './skills-content.js'

// deepseek-chat é remapeado pela API DeepSeek para v4-flash em modo NÃO-thinking
// (retorna `content` direto, sem reasoning_content). Testado e estável.
const TEXT_MODEL = 'deepseek-chat'

const SYSTEM = {
  strategy: 'Você é um estrategista de marca sênior. Responda em português do Brasil, direto ao ponto, com decisões claras, hipóteses e um plano de ação.',
  research: 'Você é um pesquisador de mercado. Responda em português com fontes explícitas, evidências e recomendações práticas.',
  analysis: 'Você é um analista de dados de marketing. Responda em português com diagnóstico, métricas e recomendações.',
  funnel: 'Você é um estrategista de funil. Responda em português com mapa de funil, mensagens por etapa e métricas de sucesso.',
  ads: 'Você é um especialista em aquisição paga e prospecção. Responda em português com plano de campanha, público e qualificação de leads.',
  automation: 'Você é um especialista em automação e relacionamento. Responda em português com gatilhos, filas e fluxos de retenção.',
  copy: 'Você é um redator publicitário premium. Responda em português.',
  carousel: 'Você é um diretor de criação de carrosséis para Instagram. Responda SOMENTE um JSON válido, sem comentários, no formato {"slides":[{"headline":"...","body":"...","cta":"..."}]} com 5 a 7 slides.',
  post: 'Você é um redator de posts para Instagram. Responda SOMENTE um JSON válido, sem comentários, no formato {"caption":"...","body":"...","cta":"...","hashtags":["..."]}.',
  default: 'Você é um assistente de marketing. Responda em português, direto e útil.',
}

async function callDeepSeek({ model, system, prompt, maxTokens = 2500, apiKey }) {
  const key = apiKey || process.env.DEEPSEEK_API_KEY
  if (!key) throw Object.assign(new Error('DEEPSEEK_API_KEY não configurado.'), { statusCode: 503 })
  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
    body: JSON.stringify({ model, max_tokens: maxTokens, messages: [{ role: 'system', content: system }, { role: 'user', content: prompt }] }),
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw Object.assign(new Error(body?.error?.message || body?.message || `DeepSeek HTTP ${response.status}`), { statusCode: 502 })
  const message = body?.choices?.[0]?.message
  return { provider: 'deepseek', model: body.model || model, text: message?.content || '', usage: body.usage || null }
}

async function callFal({ model, prompt }) {
  const key = process.env.FAL_KEY
  if (!key) throw Object.assign(new Error('FAL_KEY não configurado. Conecte um provider de imagem/vídeo (fal) no cliente.'), { statusCode: 503 })
  const response = await fetch(`https://queue.fal.run/${model}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Key ${key}` },
    body: JSON.stringify({ prompt }),
  })
  const body = await response.json().catch(() => ({}))
  return { provider: 'fal', model, requestId: body.request_id || body.requestId || null, status: body.status || 'queued', raw: body }
}

async function callAnthropic({ model, system, prompt, maxTokens = 2500, apiKey }) {
  const key = apiKey || process.env.ANTHROPIC_API_KEY
  if (!key) throw Object.assign(new Error('ANTHROPIC_API_KEY não configurado.'), { statusCode: 503 })
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: model || 'claude-3-5-sonnet-latest', max_tokens: maxTokens, system, messages: [{ role: 'user', content: prompt }] }),
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw Object.assign(new Error(body?.error?.message || `Anthropic HTTP ${response.status}`), { statusCode: 502 })
  return { provider: 'anthropic', model: body.model || model, text: (body.content || []).filter(item => item.type === 'text').map(item => item.text).join('\n'), usage: body.usage || null }
}

async function callOpenAICompatible({ baseUrl, apiKey, model, system, prompt, maxTokens = 2500 }) {
  const key = apiKey || process.env.OPENAI_API_KEY
  const base = (baseUrl || 'https://api.openai.com/v1').replace(/\/$/, '')
  if (!key) throw Object.assign(new Error('OPENAI_API_KEY não configurado.'), { statusCode: 503 })
  const response = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
    body: JSON.stringify({ model, max_tokens: maxTokens, messages: [{ role: 'system', content: system }, { role: 'user', content: prompt }] }),
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw Object.assign(new Error(body?.error?.message || body?.message || `LLM HTTP ${response.status}`), { statusCode: 502 })
  return { provider: 'openai-compatible', model: body.model || model, text: body.choices?.[0]?.message?.content || '', usage: body.usage || null }
}

async function callLLM(provider, { model, system, prompt, maxTokens, apiKey }) {
  if (provider === 'anthropic') return callAnthropic({ model, system, prompt, maxTokens, apiKey })
  if (provider === 'openai' || provider === 'openai-compatible') return callOpenAICompatible({ model, system, prompt, maxTokens, apiKey })
  return callDeepSeek({ model: model && model !== 'pipeline' ? model : TEXT_MODEL, system, prompt, maxTokens, apiKey })
}

const MODEL_BY_PROVIDER = { deepseek: 'deepseek-chat', anthropic: 'claude-3-5-sonnet-latest', 'openai-compatible': 'gpt-4o-mini', openai: 'gpt-4o-mini' }

// Seleção de modelo por capability — barato para repetitivo, forte para raciocínio.
// Sobrescrevível por env (AI_<CAP>_MODEL), sem mudar código.
const MODEL_BY_CAPABILITY = {
  strategy: process.env.AI_STRATEGY_MODEL || 'deepseek-chat',
  audit: process.env.AI_AUDIT_MODEL || 'deepseek-chat',
  funnel_strategy: process.env.AI_FUNNEL_MODEL || 'deepseek-chat',
  research: process.env.AI_RESEARCH_MODEL || 'deepseek-chat',
  coletar_referencia: process.env.AI_COLETOR_MODEL || 'deepseek-chat',
  traffic: process.env.AI_TRAFFIC_MODEL || 'deepseek-chat',
  design: process.env.AI_DESIGN_MODEL || 'deepseek-chat',
  carousel: process.env.AI_CAROUSEL_MODEL || 'deepseek-chat',
  post: process.env.AI_POST_MODEL || 'deepseek-chat',
  analysis: process.env.AI_ANALYSIS_MODEL || 'deepseek-chat',
  default: process.env.AI_DEFAULT_MODEL || 'deepseek-chat',
}

// Fallback de providers: tenta o provider preferido e, em falha, os seguintes
// (deepseek → anthropic → openai). Só falha se TODOS falharem.
// Token da conexão do cliente é usado APENAS no provider primário; os demais
// caem nas chaves da agência (fallback).
async function callLLMWithFallback(capability, system, prompt, maxTokens, preferredProvider, token) {
  const primary = preferredProvider || 'deepseek'
  const candidates = [...new Set([primary, 'deepseek', 'anthropic', 'openai-compatible'])]
  let lastError = null
  for (let i = 0; i < candidates.length; i++) {
    const provider = candidates[i]
    try {
      const apiKey = i === 0 ? token : undefined
      const model = MODEL_BY_CAPABILITY[capability] || MODEL_BY_PROVIDER[provider] || TEXT_MODEL
      const result = await callLLM(provider, { model, system, prompt, maxTokens, apiKey })
      return { ...result, provider, model }
    } catch (e) {
      lastError = e.message
    }
  }
  throw Object.assign(new Error(lastError || 'Nenhum provider disponível'), { statusCode: 502 })
}

// Upload no storage 'media' do Supabase; retorna URL pública.
async function uploadMedia(clientId, filename, body, contentType = 'image/svg+xml') {
  try {
    const base = (process.env.SUPABASE_URL || '').replace(/\/$/, '').replace(/\/rest\/v1$/, '')
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY
    if (!base || !key) return null
    const res = await fetch(`${base}/storage/v1/object/media/${encodeURIComponent(clientId)}/${filename}`, {
      method: 'POST',
      headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': contentType },
      body,
    })
    if (!res.ok) return null
    return `${base}/storage/v1/object/public/media/${encodeURIComponent(clientId)}/${filename}`
  } catch { return null }
}

// Chave de geração de imagem por cliente: usa a CONEXÃO DO CLIENTE (provider_connections
// provider=fal); a chave do operador (env) é SÓ fallback para clientes próprios em
// implementação. Outros clientes precisam da própria conexão.
async function getFalKey(clientId) {
  try {
    const rows = await db(`provider_connections?client_id=eq.${encodeURIComponent(clientId)}&provider=eq.fal&status=eq.active&select=secret_ref&limit=1`)
    if (rows?.[0]?.secret_ref) {
      const dec = decrypt(rows[0].secret_ref)
      try { const p = JSON.parse(dec); if (p.apiKey) return p.apiKey } catch { /* string pura */ }
      return dec
    }
  } catch { /* ignore */ }
  return process.env.FAL_KEY || null
}

// Geração de imagem via Fal (async queue → poll → baixa → storage → URL).
async function generateImageReal(clientId, input, falKey, jobId) {
  const prompt = buildPrompt('image_generate', input)
  const model = process.env.AI_IMAGE_MODEL || 'fal-ai/flux/schnell'
  try {
    const sub = await fetch(`https://queue.fal.run/${model}`, {
      method: 'POST', headers: { 'content-type': 'application/json', authorization: `Key ${falKey}` }, body: JSON.stringify({ prompt }),
    })
    const subBody = await sub.json().catch(() => ({}))
    if (!sub.ok) return { kind: 'error', capability: 'image_generate', error: subBody?.error?.message || `fal_http_${sub.status}` }
    const requestId = subBody.request_id || subBody.requestId
    if (!requestId) return { kind: 'error', capability: 'image_generate', error: 'fal_sem_request_id' }
    for (let i = 0; i < 12; i++) {
      await new Promise(r => setTimeout(r, 5000))
      const status = await fetch(`https://queue.fal.run/requests/${requestId}/status`, { headers: { authorization: `Key ${falKey}` } }).then(r => r.json()).catch(() => ({}))
      if (status.status === 'COMPLETED') {
        const res = await fetch(`https://queue.fal.run/requests/${requestId}`, { headers: { authorization: `Key ${falKey}` } }).then(r => r.json()).catch(() => ({}))
        const imageUrl = res.images?.[0]?.url || res.image_url || null
        if (!imageUrl) return { kind: 'error', capability: 'image_generate', error: 'fal_sem_url' }
        const buf = await fetch(imageUrl).then(r => r.arrayBuffer()).catch(() => null)
        const filename = `${clientId}-${String(jobId || '').slice(0, 8)}-img.png`
        const publicUrl = buf ? await uploadMedia(clientId, filename, Buffer.from(buf), 'image/png') : null
        return { kind: 'image', capability: 'image_generate', title: String(input.title || ''), imageUrl: publicUrl || imageUrl, provider: 'fal', model, prompt }
      }
      if (status.status === 'FAILED') return { kind: 'error', capability: 'image_generate', error: 'fal_falhou' }
    }
    return { kind: 'error', capability: 'image_generate', error: 'fal_timeout' }
  } catch (e) {
    return { kind: 'error', capability: 'image_generate', error: String(e?.message || e) }
  }
}

// Render + upload de carrossel/post → URLs reais no artifact.
async function renderAndUpload(capability, structured, clientId, jobId) {
  const slug = `${clientId}-${String(jobId || '').slice(0, 8)}`
  const urls = []
  try {
    if (capability === 'carousel' && Array.isArray(structured?.slides)) {
      for (const { index, svg } of buildCarouselSVGs(structured.slides)) {
        const url = await uploadMedia(clientId, `${slug}-slide-${index + 1}.svg`, svg)
        if (url) urls.push(url)
      }
    } else if (capability === 'post') {
      const svg = buildPostSVG(structured || {})
      const url = await uploadMedia(clientId, `${slug}-post.svg`, svg)
      if (url) urls.push(url)
    }
  } catch { /* render é best-effort */ }
  return urls
}

async function clientHasAssets(clientId) {
  if (!clientId) return false
  try {
    const rows = await db(`client_profiles?client_id=eq.${encodeURIComponent(clientId)}&select=has_assets&limit=1`)
    return rows?.[0]?.has_assets === true
  } catch { return false }
}

async function getConnectionToken(connectionId) {
  if (!connectionId) return null
  try {
    const rows = await db(`provider_connections?id=eq.${encodeURIComponent(connectionId)}&select=provider,secret_ref,status,connection_type&limit=1`)
    const row = rows?.[0]
    if (!row || row.status !== 'active' || !row.secret_ref) return null
    const decrypted = decrypt(row.secret_ref)
    let token = decrypted
    try {
      const parsed = JSON.parse(decrypted)
      if (parsed.apiKey || parsed.accessToken) token = parsed.apiKey || parsed.accessToken
    } catch { /* secret_ref é string pura (api key) */ }
    return { provider: row.provider, token, mode: row.connection_type || 'api_key' }
  } catch { return null }
}

function buildPrompt(capability, input) {
  const parts = []
  if (input.objective) parts.push(`Objetivo: ${input.objective}`)
  if (input.title) parts.push(`Título/tema: ${input.title}`)
  if (input.prompt) parts.push(`Briefing: ${input.prompt}`)
  if (input.brief) parts.push(`Brief: ${input.brief}`)
  if (input.audience) parts.push(`Audiência: ${input.audience}`)
  if (input.headline) parts.push(`Headline: ${input.headline}`)
  if (input.cta) parts.push(`CTA: ${input.cta}`)
  if (Array.isArray(input.channels) && input.channels.length) parts.push(`Canais: ${input.channels.join(', ')}`)
  if (input.budget) parts.push(`Orçamento: ${input.budget}`)
  if (input.orcamento) parts.push(`Orçamento total da campanha: R$ ${input.orcamento} — use EXATAMENTE este valor no campo orcamento.total`)
  if (input.trigger) parts.push(`Gatilho: ${input.trigger}`)
  if (input.routing) parts.push(`Roteamento: ${input.routing}`)
  if (Array.isArray(input.sources) && input.sources.length) parts.push(`Fontes: ${input.sources.join(', ')}`)
  if (Array.isArray(input.findings) && input.findings.length) parts.push(`Achados: ${input.findings.join('\n')}`)
  if (Array.isArray(input.messages) && input.messages.length) parts.push(`Mensagens: ${input.messages.join('\n')}`)
  if (input.has_assets) parts.push('Cliente possui assets próprios (fotos/vídeos/brand kit) — compor o conteúdo ao redor DELES; NÃO solicitar geração de imagem/vídeo.')
  if (input.site_url) parts.push(`Site auditado: ${input.site_url}`)
  if (input.site_content) parts.push(`Conteúdo extraído do site (audite com base nisto, não invente dados):\n${input.site_content}`)
  const truth = input.client_truth
  if (truth && typeof truth === 'object') {
    if (truth.client) parts.push(`Cliente: ${truth.client.display_name || truth.client.company_name || truth.client.client_id || ''}`)
    if (truth.brand_profile && Object.keys(truth.brand_profile).length) parts.push(`Perfil de marca: ${JSON.stringify(truth.brand_profile)}`)
    if (truth.voice_profile && Object.keys(truth.voice_profile).length) parts.push(`Voz e tom: ${JSON.stringify(truth.voice_profile)}`)
    if (Array.isArray(truth.offers) && truth.offers.length) parts.push(`Ofertas: ${JSON.stringify(truth.offers)}`)
    if (Array.isArray(truth.constraints) && truth.constraints.length) parts.push(`Restrições: ${truth.constraints.join('\n')}`)
    if (Array.isArray(truth.approved_examples) && truth.approved_examples.length) parts.push(`Exemplos aprovados: ${JSON.stringify(truth.approved_examples)}`)
    if (truth.notes) parts.push(`Notas: ${truth.notes}`)
  }
  if (input.skill_knowledge) parts.push(`Conhecimento da skill (siga-o, mas respeite o formato de saída pedido):\n${input.skill_knowledge}`)
  const calibration = input.calibration
  if (calibration && typeof calibration === 'object') {
    if (Array.isArray(calibration.benchmarks) && calibration.benchmarks.length) parts.push(`Benchmarks do coletor (calibre a peça por estes dados): ${JSON.stringify(calibration.benchmarks)}`)
    if (Array.isArray(calibration.patterns) && calibration.patterns.length) parts.push(`Padrões vencedores já coletados (aplique-os na peça): ${calibration.patterns.join(' · ')}`)
    if (Array.isArray(calibration.avoid) && calibration.avoid.length) parts.push(`EVITAR (outputs rejeitados pelo cliente — não repita): ${calibration.avoid.join(' · ')}`)
  }
  return parts.join('\n') || String(input.title || input.objective || 'Tarefa de marketing')
}

function parseJson(text) {
  const t = String(text || '').trim()
  try { return JSON.parse(t) } catch { /* fall through */ }
  const fenced = /```(?:json|javascript)?\s*([\s\S]*?)```/i.exec(t)
  let candidate = fenced ? fenced[1] : t
  if (!fenced) {
    const start = candidate.indexOf('{')
    const end = candidate.lastIndexOf('}')
    if (start >= 0 && end > start) candidate = candidate.slice(start, end + 1)
  }
  // remove trailing commas (erro comum de LLM antes de } e ])
  candidate = candidate.replace(/,\s*([}\]])/g, '$1')
  try { return JSON.parse(candidate) } catch { /* fall through */ }
  return null
}

function playbookFor(capability) {
  try {
    const skill = skillForCapability(capability)
    if (skill?.path && SKILLS_CONTENT[skill.path]) return SKILLS_CONTENT[skill.path]
  } catch { /* ignore */ }
  return null
}

function referencedContext(playbook) {
  if (!playbook) return ''
  const refs = [...new Set((playbook.match(/(?:skills|intelligence|funnel-strategy)\/[a-zA-Z0-9_\-./]+\.(?:md|json)/g) || []))]
  const chunks = []
  for (const ref of refs.slice(0, 6)) {
    const content = SKILLS_CONTENT[ref]
    if (content && content.length < 12000) chunks.push(`--- ${ref} ---\n${content}`)
  }
  const joined = chunks.join('\n\n')
  return joined.length < 30000 ? joined : ''
}

async function fetchSiteContent(url) {
  if (!url || !/^https?:\/\//i.test(String(url))) return ''
  try {
    const res = await fetch(String(url), { headers: { 'user-agent': 'Mozilla/5.0 (MarketingOS-audit)' } })
    if (!res.ok) return ''
    const html = await res.text()
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&[a-z]+;/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    return text.slice(0, 14000)
  } catch { return '' }
}

async function loadCalibration(clientId) {
  if (!clientId) return null
  try {
    const rows = await db(`artifacts?client_id=eq.${encodeURIComponent(clientId)}&select=id,metadata&order=created_at.desc&limit=20`)
    const benchmarks = []
    const patterns = []
    const avoid = []
    const ids = (rows || []).map(r => r.id)
    let approvals = []
    if (ids.length) {
      approvals = (await db(`artifact_approvals?artifact_id=in.(${encodeURIComponent(ids.join(','))})&select=artifact_id,decision,feedback&order=created_at.desc&limit=100`).catch(() => [])) || []
    }
    const rejectedIds = new Set(approvals.filter(a => a.decision === 'rejected').map(a => a.artifact_id))
    for (const row of rows || []) {
      const structured = row.metadata?.result?.structured
      if (!structured) continue
      if (rejectedIds.has(row.id)) {
        const feedback = approvals.find(a => a.artifact_id === row.id && a.decision === 'rejected')?.feedback
        if (feedback) avoid.push(feedback)
        continue
      }
      if (Array.isArray(structured.benchmark_updates)) benchmarks.push(...structured.benchmark_updates)
      if (Array.isArray(structured.winning_patterns)) patterns.push(...structured.winning_patterns)
    }
    const result = {}
    if (benchmarks.length) result.benchmarks = benchmarks.slice(0, 10)
    if (patterns.length) result.patterns = [...new Set(patterns)].slice(0, 10)
    if (avoid.length) result.avoid = [...new Set(avoid)].slice(0, 6)
    return Object.keys(result).length ? result : null
  } catch { return null }
}

const QA_SYSTEM = {
  carousel: 'Você é um crítico independente de carrosséis para Instagram. Avalie: força do gancho, narrativa/tensão, especificidade, CTA e hierarquia visual. Responda SOMENTE JSON válido: {"score":0-10,"strengths":[],"improvements":[],"passed":true|false}.',
  post: 'Você é um crítico independente de posts de alta conversão com SEO/AEO. Avalie: gancho, clareza, conversão, e SEO para Google/IAs (estrutura, entidades, pergunta respondida, CTA). Responda SOMENTE JSON válido: {"score":0-10,"strengths":[],"improvements":[],"passed":true|false}.',
  traffic: 'Você é um diretor de mídia crítico. Avalie: coerência matemática (verbas somam o orçamento, projeções batem), segmentação, hooks/ângulos e testabilidade. Responda SOMENTE JSON válido: {"score":0-10,"strengths":[],"improvements":[],"passed":true|false}.',
  design: 'Você é um diretor de arte crítico. Avalie: diferenciação premium, coerência do design system, motion com propósito e uso de dados como lentes. Responda SOMENTE JSON válido: {"score":0-10,"strengths":[],"improvements":[],"passed":true|false}.',
}

function fixTrafficMath(structured) {
  if (!structured) return structured
  const total = Number(structured.orcamento?.total) || 0
  const dist = Array.isArray(structured.distribuicao) ? structured.distribuicao : []
  if (dist.length && total > 0) {
    const sumPct = dist.reduce((a, d) => a + (Number(d.percentual) || 0), 0)
    if (sumPct > 0) {
      for (const d of dist) {
        d.percentual = Math.round((Number(d.percentual || 0) / sumPct) * 1000) / 10
        d.verba = Math.round((d.percentual / 100) * total)
      }
      const diff = 100 - dist.reduce((a, d) => a + d.percentual, 0)
      if (Math.abs(diff) >= 0.1) {
        dist[0].percentual = Math.round((dist[0].percentual + diff) * 10) / 10
        dist[0].verba = Math.round((dist[0].percentual / 100) * total)
      }
    }
  }
  const cpa = Number(structured.metricas_alvo?.cpa) || 0
  const ctr = Number(structured.metricas_alvo?.ctr) || 0
  const ctrPct = ctr > 1 ? ctr / 100 : ctr
  const conversoes = cpa > 0 ? Math.round(total / cpa) : 0
  const cliques = ctrPct > 0 ? Math.round(conversoes / 0.05) : 0
  const alcance = ctrPct > 0 ? Math.round(cliques / ctrPct) : 0
  structured.projecao = { alcance, cliques, conversoes, custo_total: total }
  return structured
}

async function qualityCheck(capability, generatedText, structured, input) {
  const system = QA_SYSTEM[capability]
  if (!system || !generatedText) return null
  const piece = JSON.stringify(structured || generatedText).slice(0, 4000)
  const brief = buildPrompt(capability, input).slice(0, 1500)
  try {
    const qa = await callLLM('deepseek', { model: TEXT_MODEL, system, prompt: `Peça gerada:\n${piece}\n\nBriefing:\n${brief}`, maxTokens: 800 })
    return parseJson(qa.text) || { raw: qa.text }
  } catch { return null }
}

const JSON_CONTRACT = ['carousel', 'post', 'coletar_referencia', 'audit', 'funnel_strategy', 'traffic', 'design']

async function executeText(capability, input, route, clientId, jobId) {
  const calibration = await loadCalibration(clientId)
  const hasAssets = await clientHasAssets(clientId)
  const enriched = capability === 'audit' ? { ...input, site_content: await fetchSiteContent(input.site_url) } : input
  if (hasAssets) enriched.has_assets = true
  const playbook = playbookFor(capability)
  const context = referencedContext(playbook)
  const isContract = JSON_CONTRACT.includes(capability)
  const system = isContract
    ? (SYSTEM[capability] || SYSTEM.default)
    : (playbook
      ? `Execute a skill abaixo com rigor, seguindo o processo e os critérios dela. Use o briefing do usuário como input.\n\n--- INÍCIO DA SKILL ---\n${playbook}\n--- FIM DA SKILL ---${context ? `\n\n--- CONTEXTO REFERENCIADO ---\n${context}` : ''}`
      : (SYSTEM[capability] || SYSTEM.default))
  const skillKnowledge = isContract && playbook
    ? `${playbook.slice(0, 3000)}${context ? '\n\n--- CONTEXTO ---\n' + context : ''}`.trim()
    : ''
  const prompt = buildPrompt(capability, { ...enriched, calibration, skill_knowledge: skillKnowledge })
  const preferredProvider = route?.provider && route.provider !== 'pipeline' ? route.provider : 'deepseek'
  const connectionToken = await getConnectionToken(enriched.route?.connectionId || input.route?.connectionId)
  const maxTokens = ['audit', 'funnel_strategy', 'traffic', 'design'].includes(capability) ? 4000 : 2500
  let result = await callLLMWithFallback(capability, system, prompt, maxTokens, preferredProvider, connectionToken?.token)
  let structured = isContract ? parseJson(result.text) : null
  if (isContract && !structured) {
    const fixPrompt = `Sua resposta anterior não era JSON válido. Responda SOMENTE um JSON válido, sem markdown, sem comentários, fechando todas as chaves e colchetes.\n\nTarefa:\n${prompt}\n\nResposta anterior:\n${result.text.slice(0, 2500)}`
    result = await callLLMWithFallback(capability, system, fixPrompt, maxTokens, preferredProvider, connectionToken?.token)
    structured = parseJson(result.text)
  }
  if (capability === 'traffic' && structured) {
    const budget = Number(input.orcamento || enriched.orcamento) || 0
    if (budget) structured.orcamento = { ...(structured.orcamento || {}), total: budget }
    structured = fixTrafficMath(structured)
  }
  const renderedUrls = ['carousel', 'post'].includes(capability) ? await renderAndUpload(capability, structured, clientId, jobId) : []
  if (renderedUrls.length) structured.rendered_urls = renderedUrls
  const qa = ['carousel', 'post', 'design', 'traffic'].includes(capability) ? await qualityCheck(capability, result.text, structured, input) : null
  return {
    kind: structured ? 'structured' : 'text',
    capability,
    title: String(enriched.title || enriched.objective || ''),
    text: result.text,
    structured,
    qa,
    provider: result.provider,
    model: result.model,
  }
}

async function executeImage(input) {
  const prompt = buildPrompt('image_generate', input)
  const result = await callFal({ model: process.env.AI_IMAGE_MODEL || 'fal-ai/flux/schnell', prompt })
  return { kind: 'image', capability: 'image_generate', title: String(input.title || ''), prompt, provider: result.provider, model: result.model, requestId: result.requestId, status: result.status }
}

async function executeVideo(input) {
  const prompt = buildPrompt('video_generate', input)
  const result = await callFal({ model: process.env.AI_VIDEO_GENERATION_MODEL || 'fal-ai/veo3', prompt })
  return { kind: 'video', capability: 'video_generate', title: String(input.title || ''), prompt, provider: result.provider, model: result.model, requestId: result.requestId, status: result.status }
}

// Famílias de execução. Tudo que NÃO está aqui cai em 'text' (LLM via registry),
// então uma capability nova de texto funciona sem mudar código.
const EXECUTION_FAMILIES = {
  image_generate: 'generate_image',
  video_generate: 'generate_video',
  publish: 'publish',
  data_sync: 'data_sync',
  video_edit: 'video_edit',
  agentic_code: 'agentic_code',
}

// Dispatcher: capabilities de OS não são executadas inline no Cockpit.
// Elas viram um dispatch para o mailbox do OS dono; o worker local recolhe.
// ⚠️ video_edit NÃO vai para o mailbox EditorOS (ninguém consome → job preso):
//    vai para o mediaos-worker local (que roda o EditorOS nesta máquina, com ffmpeg+venvs).
const OS_TARGET = {
  generate_image: 'DesingOS',
  generate_video: 'EditorOS',
  video_edit: 'EditorOS',
  publish: 'MediaOS',
  data_sync: 'GrowthOS',
  agentic_code: 'local-code-agent',
}

// OSs cuja execução acontece no worker local (mediaos-worker), não via mailbox.
const LOCAL_EXECUTOR_TARGETS = new Set(['EditorOS'])

export async function executeCapability(capability, input, route, clientId, jobId) {
  const family = EXECUTION_FAMILIES[capability] || 'text'
  // Cliente com assets próprios: não gasta geração de mídia
  if ((capability === 'image_generate' || capability === 'video_generate') && (await clientHasAssets(clientId))) {
    return { kind: 'assets', capability, title: String(input.title || input.objective || ''), text: 'Cliente possui assets próprios — não gerar mídia com provider. Usar os assets do cliente e compor o conteúdo/copy ao redor deles.', provider: 'client-assets', model: null }
  }
  // Imagem: gera via Fal com a chave DO CLIENTE (ou fallback do operador). Sem chave → honesto.
  if (capability === 'image_generate') {
    const falKey = await getFalKey(clientId)
    if (!falKey) {
      return { kind: 'blocked', capability, reason: 'needs_fal_connection', text: 'Cliente sem conexão de geração de imagem (Fal). Configure a conexão do cliente (provider_connections fal) ou forneça assets próprios.', provider: null, model: null }
    }
    return generateImageReal(clientId, input, falKey, jobId)
  }
  // Coletor com link de vídeo → extração REAL (worker baixa + transcreve + analisa)
  if (capability === 'coletar_referencia' && /(youtube\.com|youtu\.be|instagram\.com\/reel|instagram\.com\/p|tiktok\.com|vimeo\.com)/i.test(String(input.reference_url || input.prompt || input.objective || ''))) {
    return { kind: 'dispatch', capability, targetSystem: 'local-video-collector', input }
  }
  const target = OS_TARGET[family]
  if (target) return { kind: 'dispatch', capability, targetSystem: target, input }
  return executeText(capability, input, route, clientId, jobId)
}

async function patchJob(id, patch) {
  return db(`media_jobs?id=eq.${encodeURIComponent(id)}`, { method: 'PATCH', headers: { Prefer: 'return=representation' }, body: JSON.stringify({ ...patch, updated_at: new Date().toISOString() }) }).catch(() => null)
}

async function saveArtifact(job, capability, result) {
  const artifactType = {
    strategy: 'strategy', research: 'report', analysis: 'report', funnel: 'funnel', ads: 'ads_plan',
    automation: 'automation', carousel: 'carousel', post: 'post', image_generate: 'image',
    video_generate: 'video', publish: 'publication', data_sync: 'sync_report', video_edit: 'video',
  }[capability] || 'text'
  // O artifact só existe se o job produziu conteúdo real (texto ou mídia renderizada).
  // Com conteúdo: vai direto para REVIEW (aparece na fila de aprovação do front).
  // Sem conteúdo (ex.: job apenas despachado): fica draft, sem enganar ninguém.
  const structured = result?.structured || null
  const renderedUrls = structured && Array.isArray(structured.rendered_urls) ? structured.rendered_urls.map(String).filter(Boolean) : []
  const hasContent = Boolean(renderedUrls.length || result?.text)
  const previewUrl = renderedUrls[0] || null
  const metadata = {
    capability,
    result,
    ...(previewUrl ? { preview_url: previewUrl } : {}),
    ...(renderedUrls.length ? { assets: renderedUrls.map(url => ({ kind: 'image', url })) } : {}),
  }
  const created = await db('artifacts', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({ client_id: job.client_id, job_id: job.id, artifact_type: artifactType, title: result.title || job.job_type, status: hasContent ? 'review' : 'draft', metadata }),
  }).catch(() => null)
  const artifact = created?.[0]
  if (artifact?.id) {
    await db('artifact_versions', {
      method: 'POST',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ artifact_id: artifact.id, version: 1, kind: artifactType, preview_url: previewUrl, manifest: { capability, text: result.text || null, structured, prompt: result.prompt || null, provider: result.provider, model: result.model, assets: metadata.assets || [] } }),
    }).catch(() => null)
  }
  return artifact
}

async function recordAiRunUsage(job, capability, result) {
  if (!job?.id) return
  try {
    const rows = await db(`ai_runs?job_id=eq.${encodeURIComponent(job.id)}&order=created_at.desc&limit=1&select=id`)
    const run = rows?.[0]
    const usage = result?.usage || {}
    const inputTokens = Number(usage.prompt_tokens || 0)
    const outputTokens = Number(usage.completion_tokens || 0)
    const estimatedCost = inputTokens * 0.00000027 + outputTokens * 0.0000011
    if (run?.id) {
      await db(`ai_runs?id=eq.${encodeURIComponent(run.id)}`, {
        method: 'PATCH',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({ input_tokens: inputTokens, output_tokens: outputTokens, estimated_cost: Math.round(estimatedCost * 1000000) / 1000000, status: 'completed', completed_at: new Date().toISOString(), metadata: { provider: result?.provider || null, model: result?.model || null } }),
      }).catch(() => null)
    }
    // evento real de uso (alimenta o relatório de custo por cliente)
    await db('ai_usage_events', {
      method: 'POST',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ client_id: job.client_id, provider: result?.provider || 'deepseek', model: result?.model || null, event_type: 'inference', input_units: inputTokens, output_units: outputTokens, estimated_cost: Math.round(estimatedCost * 1000000) / 1000000, metadata: { capability, job_id: job.id } }),
    }).catch(() => null)
  } catch { /* ignore */ }
}

async function saveExecutionResult(job, capability, blockers = []) {
  await db('execution_results', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({
      correlation_id: crypto.randomUUID(),
      executor: 'marketingos-local-executor',
      result: blockers.length ? 'failed' : 'completed',
      job_id: job.id,
      client_id: job.client_id,
      artifact_refs: [],
      quality_refs: [],
      blockers,
      next_action: blockers.length ? 'Revisar o erro e reprocessar o job.' : 'Aguardando aprovação do artifact.',
      payload: { capability },
    }),
  }).catch(() => null)
}

export async function executeJob(job, route) {
  const capability = job.capability || capabilityForJob(job.job_type)
  const r = route || resolveAI({ capability, connection: null, policy: {}, estimatedCost: 0 })
  const now = new Date().toISOString()
  await patchJob(job.id, { status: 'running', started_at: now })
  try {
    const result = await executeCapability(capability, job.input || {}, r, job.client_id, job.id)
    if (result.kind === 'dispatch') {
      // OS com executor local (ex.: EditorOS via mediaos-worker): deixa o job queued
      // com executor local:* para o mediaos-worker claimar e processar nesta máquina.
      if (LOCAL_EXECUTOR_TARGETS.has(result.targetSystem)) {
        await patchJob(job.id, { status: 'queued', executor: 'local:editoros', priority: 'high', input: { ...(job.input || {}), ...(result.input || {}) }, result: { dispatch: result } })
        await db('media_job_events', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ job_id: job.id, event_type: 'dispatched_local', from_status: 'running', to_status: 'queued', message: 'Despachado para o executor local (EditorOS via mediaos-worker).', metadata: { capability, target_system: result.targetSystem } }) }).catch(() => null)
        return { ok: true, queued: true, targetSystem: 'local:editoros', dispatch: result }
      }
      await patchJob(job.id, { status: 'routed', executor: `ecosystem:${result.targetSystem}`, result: { dispatch: result } })
      await db('media_job_events', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ job_id: job.id, event_type: 'dispatched', from_status: 'running', to_status: 'routed', message: `Despachado para ${result.targetSystem} via mailbox.`, metadata: { capability, target_system: result.targetSystem } }) }).catch(() => null)
      return { ok: true, queued: true, targetSystem: result.targetSystem, dispatch: result }
    }
    const artifact = await saveArtifact(job, capability, result)
    await patchJob(job.id, { status: 'review', result, executor: r.executor || 'marketingos-local-executor', completed_at: new Date().toISOString() })
    await saveExecutionResult(job, capability)
    await recordAiRunUsage(job, capability, result)
    await deductQuota(job.client_id, capability)
    await db('media_job_events', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ job_id: job.id, event_type: 'execution_completed', from_status: 'running', to_status: 'review', message: 'Executor local concluiu o job.', metadata: { capability } }) }).catch(() => null)
    return { ok: true, capability, artifact: artifact || null, result }
  } catch (error) {
    const message = String(error?.message || error)
    await patchJob(job.id, { status: 'error', error: message })
    await saveExecutionResult(job, capability, [message])
    // loop de otimização: registra o erro para diagnóstico/ação (re-tentar mais barato)
    await db('ai_optimization_loops', {
      method: 'POST',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ client_id: job.client_id, job_id: job.id, iteration: 1, issue: message.slice(0, 500), action: 'retry_cheaper_or_fix', status: 'planned', estimated_cost: 0, metadata: { capability } }),
    }).catch(() => null)
    await db('media_job_events', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ job_id: job.id, event_type: 'execution_failed', from_status: 'running', to_status: 'error', message, metadata: { capability } }) }).catch(() => null)
    return { ok: false, capability, error: message }
  }
}
