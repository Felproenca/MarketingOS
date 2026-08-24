// Worker local — ponte entre o Cockpit (Vercel) e os OSs (mailbox local).
//
// Fluxo:
//   1. Lê media_jobs com status=routed e executor=ecosystem:<OS> no Supabase.
//   2. Escreve request-*.json no mailbox do OS dono (EcosystemCore/runtime/mailbox).
//   3. Marca o job como running.
//   4. Espera o retorno (execution-<correlation>.json) no mesmo folder.
//   5. Ingesta: execution_results + media_jobs (review/error) + artifact.
//
// Uso:
//   node scripts/worker.mjs --once    # processa uma rodada e sai
//   node scripts/worker.mjs           # fica em loop (watch)
//
// Env: SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (lê de MarketingOS/.env).
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { runCodeAgent } from './lib/code-agent.mjs'
import { extractVideoTranscript } from './lib/video-extract.mjs'
import { deductQuota } from '../api/_lib/quota.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const mktRoot = path.join(root, '..')
const MAILBOX = path.join(mktRoot, '..', 'EcosystemCore', 'runtime', 'mailbox')
const ONCE = process.argv.includes('--once')

function loadEnv() {
  const env = { ...process.env }
  const file = path.join(mktRoot, '.env')
  if (fs.existsSync(file)) {
    for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
      const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line)
      if (m && !env[m[1]]) env[m[1]] = m[2].replace(/^["']|["']$/g, '')
    }
  }
  return env
}

const env = loadEnv()
Object.assign(process.env, env)
const SUPABASE_URL = (env.SUPABASE_URL || '').replace(/\/$/, '').replace(/\/rest\/v1$/, '')
const KEY = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SECRET_KEY
const COCKPIT_URL = env.MARKETINGOS_COCKPIT_URL || 'https://app.mkos.online'
const SYNC_SECRET = env.MEDIAOS_EXECUTION_INGEST_SECRET || ''
if (!SUPABASE_URL || !KEY) {
  console.error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY ausentes.')
  process.exit(1)
}

async function db(pathname, options = {}) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${pathname}`, {
    ...options,
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json', ...(options.headers || {}) },
  })
  const text = await response.text()
  if (!response.ok) throw new Error(`Supabase HTTP ${response.status}: ${text.slice(0, 240)}`)
  return text ? JSON.parse(text) : null
}

function now() { return new Date().toISOString() }

function writeRequest(job, target, correlationId) {
  const dispatch = job.result?.dispatch || {}
  const input = dispatch.input || job.input || {}
  const folder = path.join(MAILBOX, target, correlationId)
  fs.mkdirSync(folder, { recursive: true })
  const request = {
    schema_version: '1.0',
    contract_type: 'production_request',
    contract_id: `request-marketingos-${correlationId}`,
    correlation_id: correlationId,
    source_system: 'marketingos',
    target_system: target,
    client_id: job.client_id,
    job_id: job.id,
    capability: job.capability,
    objective: input.title || input.objective || job.job_type,
    format: { kind: job.job_type },
    deliverables: [],
    input,
    created_at: now(),
  }
  const file = path.join(folder, `request-marketingos-${correlationId}.json`)
  fs.writeFileSync(file, JSON.stringify(request, null, 2))
  return { folder, file }
}

function findReturn(folder, correlationId) {
  if (!fs.existsSync(folder)) return null
  for (const name of fs.readdirSync(folder)) {
    if (!name.endsWith('.json')) continue
    const file = path.join(folder, name)
    try {
      const data = JSON.parse(fs.readFileSync(file, 'utf8'))
      if (data.correlation_id !== correlationId) continue
      if (data.contract_type === 'execution_result' && ['completed', 'failed', 'blocked'].includes(data.result)) return data
      if (data.contract_type === 'content_package' && ['review', 'completed', 'failed', 'blocked'].includes(data.status)) {
        return { contract_type: 'execution_result', result: data.status === 'review' || data.status === 'completed' ? 'completed' : data.status, executor: data.source_system || 'ecosystem', artifact_refs: data.artifact_refs || [], quality_refs: [], blockers: data.blockers || [], next_action: data.next_action || null, manifest: data }
      }
    } catch { /* ignore */ }
  }
  return null
}

async function ingest(job, target, correlationId, ret) {
  const completed = ret.result === 'completed'
  await db('execution_results', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({
      correlation_id: correlationId,
      executor: ret.executor || `ecosystem:${target}`,
      result: completed ? 'completed' : 'failed',
      job_id: job.id,
      client_id: job.client_id,
      artifact_refs: ret.artifact_refs || [],
      quality_refs: ret.quality_refs || [],
      blockers: ret.blockers || [],
      next_action: ret.next_action || null,
      payload: { manifest: ret.manifest || null },
    }),
  })
  await db(`media_jobs?id=eq.${encodeURIComponent(job.id)}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({
      status: completed ? 'review' : 'error',
      result: { ecosystem: ret },
      error: completed ? null : (ret.blockers || []).join(', '),
      completed_at: completed ? now() : null,
      updated_at: now(),
    }),
  })
  if (completed) {
    await db('artifacts', {
      method: 'POST',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({
        client_id: job.client_id,
        job_id: job.id,
        artifact_type: job.job_type,
        title: job.input?.title || job.job_type,
        status: 'draft',
        metadata: { capability: job.capability, ecosystem: ret },
      }),
    }).catch(() => null)
    // custo real: deduz cota + registra uso (outputs dispatchados/code-agent)
    try { await deductQuota(job.client_id, job.capability) } catch { /* ignore */ }
    try {
      await db('ai_usage_events', {
        method: 'POST',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({
          client_id: job.client_id, provider: String(ret.executor || 'ecosystem'), model: null,
          event_type: 'inference', input_units: null, output_units: String(ret.manifest?.output || '').length || 0,
          estimated_cost: 0, metadata: { capability: job.capability, job_id: job.id },
        }),
      }).catch(() => null)
    } catch { /* ignore */ }
  }
}

const COLETOR_SYSTEM = 'Você é um curador de referências. Recebe a TRANSCRIÇÃO REAL de um vídeo e devolve a análise reversa: o que faz aquela peça funcionar e o que o sistema deve aprender (skill nova, skill aprimorada ou benchmark). Responda SOMENTE um JSON válido no formato {"reference_type":"video","source":"...","breakdown":{"hook":"...","narrative":[],"visual_patterns":[],"cta":"...","rhythm":"..."},"winning_patterns":[],"audience_trigger":"...","proposed_skill":{"name":"...","label":"...","category":"...","capability":"...","description":"...","rules":[]},"benchmark_updates":[{"metric":"...","value":"...","evidence":"..."}]}. Baseie-se APENAS na transcrição fornecida; não invente.'

async function runColetorWithTranscript(task, transcript, clientTruth) {
  const key = process.env.DEEPSEEK_API_KEY
  const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
    body: JSON.stringify({ model: 'deepseek-chat', max_tokens: 2500, messages: [{ role: 'system', content: COLETOR_SYSTEM }, { role: 'user', content: `Tarefa/contexto: ${task}\n\nTRANSCRIÇÃO REAL DO VÍDEO:\n${transcript.slice(0, 12000)}` }] }),
  })
  const body = await res.json().catch(() => ({}))
  const text = body?.choices?.[0]?.message?.content || ''
  let structured = null
  try { structured = JSON.parse(text) } catch {
    const m = /```(?:json)?\s*([\s\S]*?)```/i.exec(text)
    if (m) { try { structured = JSON.parse(m[1]) } catch { /* ignore */ } }
  }
  return { ok: Boolean(structured), text, structured }
}

async function processVideoCollector(job, correlationId) {
  const input = job.input || {}
  const url = input.reference_url || String(input.prompt || input.objective || '').match(/https?:\/\/[^\s]+/)?.[0] || ''
  const task = input.title || input.objective || 'Analisar o vídeo'
  await db(`media_jobs?id=eq.${encodeURIComponent(job.id)}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ status: 'running', started_at: now(), updated_at: now() }) }).catch(() => null)
  console.log(`→ video-collector: baixando/transcrevendo ${String(url).slice(0, 70)}`)
  try {
    const transcript = await extractVideoTranscript(url)
    console.log(`→ transcrição: ${transcript.length} chars`)
    const result = await runColetorWithTranscript(task, transcript, input.client_truth)
    await ingest(job, 'local-video-collector', correlationId, {
      result: result.ok ? 'completed' : 'failed',
      executor: 'local-video-collector',
      artifact_refs: [],
      blockers: result.ok ? [] : ['coletor_falhou_analise'],
      next_action: result.ok ? 'Análise pronta para revisão.' : 'Revisar transcrição.',
      manifest: { kind: 'video_analysis', transcript: transcript.slice(0, 12000), analysis: result.structured, task },
    })
    console.log(`✓ video-collector ${result.ok ? 'ok' : 'fail'} (${transcript.length} chars de transcrição)`)
    return true
  } catch (e) {
    const message = String(e?.message || e)
    console.log(`✗ video-collector erro: ${message}`)
    await ingest(job, 'local-video-collector', correlationId, {
      result: 'failed', executor: 'local-video-collector', artifact_refs: [], blockers: [message], next_action: 'Verificar URL/áudio.', manifest: { kind: 'video_analysis', error: message },
    })
    return true
  }
}

async function processCodeAgent(job, correlationId) {
  const input = job.input || {}
  const task = String(input.title || input.objective || input.prompt || job.job_type)
  const context = JSON.stringify(input.client_truth || {}).slice(0, 2000)
  await db(`media_jobs?id=eq.${encodeURIComponent(job.id)}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ status: 'running', started_at: now(), updated_at: now() }) }).catch(() => null)
  console.log(`→ code-agent: ${task.slice(0, 90)}`)
  const result = await runCodeAgent({ task, context })
  await ingest(job, 'local-code-agent', correlationId, {
    result: result.ok ? 'completed' : 'failed',
    executor: 'local-code-agent',
    artifact_refs: [],
    blockers: result.ok ? [] : [result.error || 'code_agent_failed'],
    next_action: result.ok ? 'Resultado no artifact.' : 'Revisar o erro e reprocessar.',
    manifest: { kind: 'code', output: result.output, code: result.code, attempts: result.attempts, lastError: result.lastError },
  })
  console.log(`✓ code-agent ${result.ok ? 'ok' : 'fail'} (${result.attempts} tentativas)`)
  return true
}

async function processJob(job) {
  const target = String(job.executor || '').replace(/^ecosystem:/, '')
  if (!target) return false
  const correlationId = `ops-${job.client_id}-${job.id.slice(0, 8)}`
  if (target === 'local-code-agent') return processCodeAgent(job, correlationId)
  if (target === 'local-video-collector') return processVideoCollector(job, correlationId)
  const { folder } = writeRequest(job, target, correlationId)
  await db(`media_jobs?id=eq.${encodeURIComponent(job.id)}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({ status: 'running', started_at: now(), updated_at: now() }),
  }).catch(() => null)
  console.log(`→ dispatch ${job.job_type} p/ ${target} (${correlationId})`)

  const deadline = Date.now() + 120000
  while (Date.now() < deadline) {
    const ret = findReturn(folder, correlationId)
    if (ret) {
      await ingest(job, target, correlationId, ret)
      console.log(`✓ ${job.job_type} concluído por ${target} (${ret.result})`)
      return true
    }
    await new Promise(r => setTimeout(r, 5000))
  }
  console.log(`✗ timeout ${job.job_type} p/ ${target}`)
  return false
}

async function run() {
  const jobs = await db(`media_jobs?status=eq.routed&executor=like.ecosystem:*&order=created_at.asc&limit=10`).catch(e => { console.error('poll error:', e.message); return [] })
  for (const job of jobs || []) {
    try { await processJob(job) } catch (e) { console.error('job error:', e.message) }
  }
  return (jobs || []).length
}

async function runScheduler() {
  // Lê sync_schedules (007). Se a tabela não existir, ignora silenciosamente.
  const due = await db(`sync_schedules?enabled=eq.true&next_run_at=lte.${encodeURIComponent(now())}&order=next_run_at.asc&limit=20`).catch(() => [])
  for (const s of due || []) {
    console.log(`↻ sync devido: ${s.client_id}/${s.source}`)
    try {
      if (SYNC_SECRET) {
        const res = await fetch(`${COCKPIT_URL}/api/admin/operations`, {
          method: 'POST',
          headers: { 'content-type': 'application/json', 'x-mediaos-execution-secret': SYNC_SECRET },
          body: JSON.stringify({ action: 'run_sync', clientId: s.client_id, source: s.source }),
        })
        const body = await res.json().catch(() => ({}))
        console.log(`   → run_sync HTTP ${res.status} ${JSON.stringify(body).slice(0, 140)}`)
      } else {
        console.log('   → SEM SYNC_SECRET — apenas agendando (pull desativado).')
      }
    } catch (e) {
      console.log(`   → erro run_sync: ${e.message}`)
    }
    await db(`sync_schedules?client_id=eq.${encodeURIComponent(s.client_id)}&source=eq.${encodeURIComponent(s.source)}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ last_run_at: now(), next_run_at: new Date(Date.now() + Number(s.interval_hours || 24) * 3600000).toISOString(), updated_at: now() }),
    }).catch(() => null)
  }
  return (due || []).length
}

async function main() {
  console.log(`Worker iniciado (${ONCE ? 'once' : 'watch'}). Mailbox: ${MAILBOX}`)
  do {
    await run()
    try { await runScheduler() } catch (e) { console.error('scheduler error:', e.message) }
    if (ONCE) break
    await new Promise(r => setTimeout(r, 10000))
  } while (true)
}

main()
