#!/usr/bin/env node
// Orquestração multi-agente — runner que faz cada agente consumir os jobs das
// suas capabilities da fila compartilhada (media_jobs) e os processa pelo pipeline
// real (mediaos worker), respeitando a política de cota do cliente.
//
// Uso:
//   node scripts/agents/run-agent.mjs --agent agente-conteudo [--once] [--limit N]
//   node scripts/agents/run-agent.mjs --list
//   node scripts/agents/run-agent.mjs --setup-mcp          # imprime comandos hermes mcp configure
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const marketingRoot = path.resolve(__dirname, '..', '..')
const agents = JSON.parse(fs.readFileSync(path.join(__dirname, 'agents.json'), 'utf8'))

const env = { ...process.env }
try {
  for (const line of fs.readFileSync(path.join(marketingRoot, '.env'), 'utf8').split('\n')) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line)
    if (m && !env[m[1]]) env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
} catch { /* sem .env */ }
const SUPABASE_URL = (env.SUPABASE_URL || '').replace(/\/rest\/v1$/, '').replace(/\/$/, '')
const KEY = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SECRET_KEY

async function db(resource, options = {}) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${resource}`, { ...options, headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json', ...(options.headers || {}) } })
  const text = await r.text()
  if (!r.ok) throw new Error(`Supabase ${r.status}: ${text.slice(0, 240)}`)
  return text ? JSON.parse(text) : null
}

function jobsQuery(capabilities) {
  const list = capabilities.map(c => encodeURIComponent(c)).join(',')
  return `media_jobs?status=eq.queued&capability=in.(${list})&select=id,client_id,capability,job_type,priority&order=created_at.asc&limit=5`
}

async function quotaOk(clientId) {
  try {
    const rows = await db(`client_quotas?client_id=eq.${encodeURIComponent(clientId)}&select=monthly_token_quota,used_tokens,max_monthly_cost_brl,used_cost_brl&limit=1`)
    const q = rows?.[0]
    if (!q) return { ok: false, reason: 'sem quota cadastrada' }
    const tokensOk = !q.monthly_token_quota || Number(q.used_tokens || 0) < Number(q.monthly_token_quota)
    const costOk = !q.max_monthly_cost_brl || Number(q.used_cost_brl || 0) < Number(q.max_monthly_cost_brl)
    return { ok: tokensOk && costOk, reason: !tokensOk ? 'cota de tokens excedida' : !costOk ? 'teto de custo excedido' : 'ok' }
  } catch (error) {
    return { ok: false, reason: error.message }
  }
}

async function runAgent(agent, once, limit) {
  console.log(JSON.stringify({ agent: agent.id, capabilities: agent.capabilities, policy: agent.quota_policy }))
  const jobs = await db(jobsQuery(agent.capabilities)).catch(e => { console.error('poll error:', e.message); return [] })
  const work = (jobs || []).slice(0, limit)
  if (!work.length) { console.log(JSON.stringify({ processed: 0, message: 'Nenhum job queued nas capabilities do agente.' })); return 0 }
  let processed = 0
  for (const job of work) {
    const quota = await quotaOk(job.client_id)
    if (!quota.ok) {
      console.log(JSON.stringify({ skipped: job.id.slice(0, 8), client: job.client_id, reason: quota.reason }))
      continue
    }
    console.log(`→ ${agent.id} processa ${job.capability} (${job.id.slice(0, 8)}) — ${job.client_id}`)
    const worker = path.join(marketingRoot, 'scripts', 'mediaos', 'worker.mjs')
    const result = spawnSync(process.execPath, [worker, '--id', job.id], { cwd: marketingRoot, encoding: 'utf8', timeout: 300000, windowsHide: true })
    const output = `${result.stdout || ''}\n${result.stderr || ''}`.trim()
    const summary = output.split(/\r?\n/).reverse().find(line => line.trim().startsWith('{'))
    processed++
    console.log(summary || `job ${job.id.slice(0, 8)} concluído (exit ${result.status})`)
    if (once) break
  }
  return processed
}

async function main() {
  const args = process.argv.slice(2)
  if (args.includes('--list')) {
    for (const agent of agents.agents) console.log(`- ${agent.id} :: ${agent.capabilities.join(', ')}`)
    return
  }
  if (args.includes('--setup-mcp')) {
    for (const agent of agents.agents) {
      console.log(`# ${agent.label} (${agent.id})`)
      console.log(`hermes mcp configure marketingos --tools ${agent.mcp_tools.join(',')} # perfil do agente`)
    }
    return
  }
  const name = args.includes('--agent') ? args[args.indexOf('--agent') + 1] : ''
  const agent = agents.agents.find(item => item.id === name)
  if (!agent) { console.error('Agente não encontrado. Use --list ou --agent <id>.'); process.exit(1) }
  const once = args.includes('--once')
  const limit = Number(args.includes('--limit') ? args[args.indexOf('--limit') + 1] : 5)
  do {
    const n = await runAgent(agent, once, limit)
    if (once || n === 0) break
    await new Promise(res => setTimeout(res, 15000))
  } while (true)
}

main().catch(error => { console.error(error.message); process.exit(1) })
