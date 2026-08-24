import { withRetry } from '../../../scripts/lib/retry.mjs'

function required(name) {
  if (!process.env[name]) throw Object.assign(new Error(`Adapter AI sem credencial: ${name}`), { statusCode: 503 })
  return process.env[name]
}

async function jsonFetch(url, options, timeoutMs = 120000) {
  return withRetry(async ({ signal }) => {
    const response = await fetch(url, { ...options, signal })
    const text = await response.text()
    let body
    try { body = text ? JSON.parse(text) : {} } catch { body = { raw: text } }
    if (!response.ok) throw Object.assign(new Error(body?.error?.message || body?.message || `AI provider HTTP ${response.status}`), { status: response.status, retryable: response.status === 429 || response.status >= 500 })
    return body
  }, { attempts: Number(process.env.AI_RETRY_ATTEMPTS || 3), timeoutMs })
}

export async function runAnthropic({ model, system, prompt, maxTokens = 3000 }) {
  const body = await jsonFetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': required('ANTHROPIC_API_KEY'), 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: model || process.env.AI_STRATEGY_MODEL || 'claude-3-5-sonnet-latest', max_tokens: maxTokens, system, messages: [{ role: 'user', content: prompt }] }),
  })
  return { provider: 'anthropic', model: body.model || model, text: (body.content || []).filter(item => item.type === 'text').map(item => item.text).join('\n'), usage: body.usage || null, raw: body }
}

export async function runOpenAICompatible({ model, system, prompt, maxTokens = 3000, apiKey, baseUrl }) {
  const base = (baseUrl || process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '')
  const body = await jsonFetch(`${base}/chat/completions`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${apiKey || required('OPENAI_API_KEY')}` },
    body: JSON.stringify({ model: model || process.env.AI_COPY_MODEL || 'gpt-4o-mini', max_tokens: maxTokens, messages: [{ role: 'system', content: system }, { role: 'user', content: prompt }] }),
  })
  return { provider: 'openai-compatible', model: body.model || model, text: body.choices?.[0]?.message?.content || '', usage: body.usage || null, raw: body }
}

export async function runDeepSeek(input) { return runOpenAICompatible({ ...input, apiKey: input.apiKey || required('DEEPSEEK_API_KEY'), baseUrl: input.baseUrl || 'https://api.deepseek.com' }) }
export async function runQwen(input) { return runOpenAICompatible({ ...input, apiKey: input.apiKey || required('DASHSCOPE_API_KEY'), baseUrl: input.baseUrl || process.env.QWEN_BASE_URL }) }

export async function runFal({ model = 'fal-ai/flux/schnell', prompt, apiKey, webhookUrl }) {
  const key = apiKey || required('FAL_KEY')
  const body = await jsonFetch(`https://queue.fal.run/${model}${webhookUrl ? `?fal_webhook=${encodeURIComponent(webhookUrl)}` : ''}`, { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Key ${key}` }, body: JSON.stringify({ prompt }) })
  return { provider: 'fal', model, requestId: body.request_id || null, status: 'queued', raw: body }
}

export async function runKie({ endpoint, prompt, apiKey }) {
  if (!endpoint) throw Object.assign(new Error('KIE exige endpoint de modelo configurado.'), { statusCode: 400 })
  const body = await jsonFetch(endpoint, { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${apiKey || required('KIE_API_KEY')}` }, body: JSON.stringify({ prompt }) })
  return { provider: 'kie', status: 'queued', raw: body }
}

export async function runAI({ provider, ...input }) {
  if (provider === 'anthropic') return runAnthropic(input)
  if (provider === 'openai' || provider === 'openai-compatible') return runOpenAICompatible(input)
  if (provider === 'deepseek') return runDeepSeek(input)
  if (provider === 'qwen') return runQwen(input)
  if (provider === 'fal') return runFal(input)
  if (provider === 'kie') return runKie(input)
  throw Object.assign(new Error(`Nenhum adapter AI configurado para provider=${provider}`), { statusCode: 503 })
}
