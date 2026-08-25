// state.mjs — coleta o estado REAL do sistema (Supabase + workers + frontends).
// Nada de mocks: cada leitura é uma verificação verdadeira.
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const marketingRoot = path.resolve(__dirname, '..', '..')

export function loadEnv() {
  const env = { ...process.env }
  try {
    for (const line of fs.readFileSync(path.join(marketingRoot, '.env'), 'utf8').split('\n')) {
      const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line)
      if (m && !env[m[1]]) env[m[1]] = m[2].replace(/^["']|["']$/g, '')
    }
  } catch { /* sem .env local */ }
  return env
}

export async function supabase(env, resource, options = {}) {
  const base = (env.SUPABASE_URL || '').replace(/\/rest\/v1$/, '').replace(/\/$/, '')
  const key = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SECRET_KEY
  if (!base || !key) throw new Error('SUPABASE_URL/KEY ausentes')
  const r = await fetch(`${base}/rest/v1/${resource}`, { ...options, headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', ...(options.headers || {}) } })
  const text = await r.text()
  if (!r.ok) throw new Error(`Supabase ${r.status}: ${text.slice(0, 200)}`)
  return text ? JSON.parse(text) : null
}

export async function collectState() {
  const env = loadEnv()
  const out = { gerado_em: new Date().toISOString(), clientes: 0, jobs: {}, requests: {}, problemas: [], verificacoes: {} }
  const safe = async (name, fn) => { try { return await fn() } catch (e) { out.verificacoes[name] = { ok: false, erro: e.message }; return null } }

  // Jobs por status
  const jobs = await safe('jobs', () => supabase(env, 'media_jobs?select=id,client_id,status,capability,executor,error,updated_at&limit=300'))
  if (jobs) {
    out.jobs = jobs.reduce((acc, j) => { acc[j.status] = (acc[j.status] || 0) + 1; return acc }, {})
    const presos = jobs.filter(j => ['queued', 'running', 'routed'].includes(j.status) && Date.now() - new Date(j.updated_at || j.created_at || 0).getTime() > 60 * 60 * 1000)
    if (presos.length) out.problemas.push({ tipo: 'job_preso', severidade: 'alta', detalhe: `${presos.length} job(s) ${presos[0].status} sem progresso há >1h`, jobs: presos.slice(0, 5).map(j => j.id.slice(0, 8)) })
    const errados = jobs.filter(j => ['error', 'blocked'].includes(j.status))
    if (errados.length) out.problemas.push({ tipo: 'jobs_com_erro', severidade: 'media', detalhe: `${errados.length} job(s) error/blocked (último: ${(errados[0]?.error || '').slice(0, 120)})`, jobs: errados.slice(0, 5).map(j => j.id.slice(0, 8)) })
  }
  out.verificacoes.jobs = { ok: Boolean(jobs) }

  // Requests por status
  const requests = await safe('requests', () => supabase(env, 'work_requests?select=id,status,request_type&limit=300'))
  if (requests) out.requests = requests.reduce((acc, r) => { acc[r.status] = (acc[r.status] || 0) + 1; return acc }, {})

  // Artifacts: draft com conteúdo (bug histórico) e review sem preview
  const artifacts = await safe('artifacts', () => supabase(env, 'artifacts?select=id,client_id,status,metadata,artifact_type&limit=300'))
  if (artifacts) {
    const draftsComConteudo = artifacts.filter(a => a.status === 'draft' && a.metadata?.result?.text)
    if (draftsComConteudo.length) out.problemas.push({ tipo: 'artifact_draft_com_conteudo', severidade: 'media', detalhe: `${draftsComConteudo.length} artifact(s) draft com conteúdo — deveriam estar em review`, ids: draftsComConteudo.slice(0, 5).map(a => a.id.slice(0, 8)) })
    const reviewSemPreview = artifacts.filter(a => a.status === 'review' && !a.metadata?.preview_url)
    if (reviewSemPreview.length) out.problemas.push({ tipo: 'review_sem_preview', severidade: 'baixa', detalhe: `${reviewSemPreview.length} artifact(s) review sem preview_url` })
  }

  // Conexões x schedules (schedules sem conexão = falsos)
  const conns = await safe('connections', () => supabase(env, 'connections?select=client_id,source&limit=200'))
  const schedules = await safe('schedules', () => supabase(env, 'sync_schedules?select=client_id,source,enabled&limit=200'))
  if (conns && schedules) {
    const has = (c, s) => (conns || []).some(x => x.client_id === c && (x.source === s || (s === 'instagram' && x.source === 'meta') || (s === 'meta_ads' && x.source === 'meta')))
    const falsos = (schedules || []).filter(s => s.enabled && !has(s.client_id, s.source))
    if (falsos.length) out.problemas.push({ tipo: 'sync_sem_conexao', severidade: 'media', detalhe: `${falsos.length} schedule(s) habilitados sem conexão real (ex.: ${falsos[0].client_id}/${falsos[0].source})` })
  }

  // Clientes ativos
  const clients = await safe('clients', () => supabase(env, 'client_profiles?select=client_id&limit=200'))
  if (clients) out.clientes = clients.length

  // Workers pm2
  out.workers = await safe('workers', () => new Promise(resolve => {
    const r = spawnSync('pm2', ['jlist'], { encoding: 'utf8' })
    let list = []
    try { list = JSON.parse(r.stdout || '[]') } catch { /* pm2 indisponivel */ }
    const workers = list.filter(p => /worker/.test(p.name))
    resolve(workers.map(p => ({ nome: p.name, status: p.pm2_env.status, restarts: p.pm2_env.restart_time, uptime: Math.round((Date.now() - (p.pm2_env.pm_uptime || 0)) / 60000) + 'min' })))
  }))
  if (out.workers) {
    for (const w of out.workers) if (w.status !== 'online') out.problemas.push({ tipo: 'worker_offline', severidade: 'alta', detalhe: `${w.nome} está ${w.status}` })
  }

  // Frontends + backend (health real)
  const health = async (name, url) => { try { const r = await fetch(url, { signal: AbortSignal.timeout(8000) }); out.verificacoes[name] = { ok: r.ok, status: r.status }; if (!r.ok) out.problemas.push({ tipo: 'servico_fora', severidade: 'alta', detalhe: `${name} retornou HTTP ${r.status}` }) } catch (e) { out.verificacoes[name] = { ok: false, erro: e.message }; out.problemas.push({ tipo: 'servico_fora', severidade: 'alta', detalhe: `${name}: ${e.message}` }) } }
  await health('backend', env.MARKETINGOS_COCKPIT_URL || 'https://app.mkos.online/api/health')
  await health('frontend_operador', 'https://marketingos-frontend.vercel.app/')
  await health('frontend_cockpit', 'https://app.mkos.online/')

  return out
}
