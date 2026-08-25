#!/usr/bin/env node
// Análise real dos dados coletados de um cliente → insights + pautas de conteúdo.
//
// O sistema coleta (data_now_normalized) mas nunca analisou. Este pipeline faz o que
// importa: transforma os dados coletados em leitura — o que funciona, o que não,
// recomendações e PAUTAS de conteúdo. As pautas viram itens de agenda (proposta)
// que o operador/cliente aprovam e que alimentam a produção.
//
// Uso:
//   node scripts/insights/analyze-client.mjs --client <slug> [--agenda] [--force]
//
// Saída:
//   - artifact 'analysis' (review) com relatório .md + dados .json no Supabase Storage
//   - (--agenda) itens de agenda 'proposta' criados a partir das pautas
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const marketingRoot = path.resolve(__dirname, '..', '..')
const args = process.argv.slice(2)
const clientId = args.includes('--client') ? args[args.indexOf('--client') + 1] : ''
const createAgenda = args.includes('--agenda')
if (!clientId) { console.error('Uso: node scripts/insights/analyze-client.mjs --client <slug> [--agenda]'); process.exit(1) }

// ── env ──
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

async function storage(pathname, options = {}) {
  const r = await fetch(`${SUPABASE_URL}/storage/v1/${pathname}`, { ...options, headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json', ...(options.headers || {}) } })
  const text = await r.text()
  if (!r.ok) throw new Error(`Storage ${r.status}: ${text.slice(0, 200)}`)
  return text ? JSON.parse(text) : null
}

const num = v => (v == null || !Number.isFinite(Number(v)) ? 0 : Number(v))
const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0)
const fmt = v => Number(v || 0).toLocaleString('pt-BR')

// ── coleta + agregação ──
async function collectData(clientId) {
  const rows = await db(`data_now_normalized?client_id=eq.${encodeURIComponent(clientId)}&select=source,entity_type,entity_id,metrics,metadata,observed_at&order=observed_at.desc&limit=300`).catch(() => [])
  const contents = (rows || []).filter(r => r.entity_type === 'instagram_media')
  const profile = (rows || []).filter(r => r.entity_type === 'instagram_insights')
  const youtube = (rows || []).filter(r => r.entity_type === 'youtube_video')
  const ads = (rows || []).filter(r => r.source === 'meta_ads' || r.source === 'google_ads')
  return { rows: rows || [], contents, profile, youtube, ads }
}

function aggregate(contents) {
  const items = contents.map(c => ({
    id: c.entity_id,
    caption: c.metadata?.caption || c.metadata?.permalink || c.entity_id || '',
    permalink: c.metadata?.permalink || null,
    media_type: c.metadata?.media_type || c.metadata?.product_type || 'post',
    observed_at: c.observed_at,
    reach: num(c.metrics?.reach),
    interactions: num(c.metrics?.total_interactions),
    saves: num(c.metrics?.saved),
    shares: num(c.metrics?.shares),
    likes: num(c.metrics?.likeCount || c.metrics?.likes),
    comments: num(c.metrics?.commentsCount || c.metrics?.comments),
    follows: num(c.metrics?.follows),
  }))
  const byType = {}
  for (const item of items) byType[item.media_type] = (byType[item.media_type] || 0) + 1
  const totalReach = items.reduce((s, i) => s + i.reach, 0)
  const totalInteractions = items.reduce((s, i) => s + i.interactions, 0)
  const engRate = pct(totalInteractions, totalReach)
  const sorted = [...items].sort((a, b) => b.reach - a.reach)
  const sortedEng = [...items].sort((a, b) => (a.reach ? b.interactions / b.reach - a.interactions / a.reach : 1))
  return {
    amostra: items.length,
    total_reach: totalReach,
    media_reach: items.length ? Math.round(totalReach / items.length) : 0,
    total_interactions: totalInteractions,
    taxa_engajamento: engRate,
    por_formato: byType,
    melhores: sorted.slice(0, 3).map(i => ({ caption: i.caption.slice(0, 90), reach: i.reach, interactions: i.interactions, media_type: i.media_type, permalink: i.permalink })),
    piores: sorted.slice(-3).reverse().map(i => ({ caption: i.caption.slice(0, 90), reach: i.reach, interactions: i.interactions, media_type: i.media_type, permalink: i.permalink })),
    mais_engajamento: sortedEng.slice(0, 3).map(i => ({ caption: i.caption.slice(0, 90), reach: i.reach, interactions: i.interactions, media_type: i.media_type, permalink: i.permalink })),
    recente: items.slice(0, 5),
  }
}

// ── LLM (DeepSeek) ──
async function analyzeWithLLM(clientId, aggregate) {
  const key = env.DEEPSEEK_API_KEY
  if (!key) return { ok: false, error: 'DEEPSEEK_API_KEY ausente.' }
  const dataForLLM = {
    cliente: clientId,
    amostra: aggregate.amostra,
    alcance_total: aggregate.total_reach,
    alcance_medio: aggregate.media_reach,
    interacoes: aggregate.total_interactions,
    taxa_engajamento: aggregate.taxa_engajamento,
    por_formato: aggregate.por_formato,
    melhores: aggregate.melhores,
    piores: aggregate.piores,
    mais_engajamento: aggregate.mais_engajamento,
    recentes: aggregate.recente,
  }
  const system = `Você é o analista de dados do MarketingOS. Recebe métricas reais coletadas do Instagram/YouTube/Ads de um cliente e devolve leitura acionável. Regras: 1) Só conclua com base nos dados fornecidos; sem amostra suficiente, diga isso. 2) Separe evidência de hipótese. 3) Toda recomendação vira uma pauta de conteúdo concreta. Responda SOMENTE JSON válido: {"resumo":"2-3 frases", "insights":[{"tipo":"oportunidade|risco|padrao|hipotese","titulo":"...","detalhe":"...","evidencia":"dado real que sustenta"}], "recomendacoes":["..."], "pautas":[{"titulo":"título da peça","tipo":"carousel|post|reel|video|strategy","objetivo":"objetivo da peça"}], "sem_amostra":false}`
  const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
    body: JSON.stringify({ model: 'deepseek-chat', max_tokens: 2500, messages: [{ role: 'system', content: system }, { role: 'user', content: `DADOS COLETADOS (JSON):\n${JSON.stringify(dataForLLM, null, 1)}` }] }),
  })
  const body = await res.json().catch(() => ({}))
  const text = String(body?.choices?.[0]?.message?.content || '')
  let parsed = null
  try { parsed = JSON.parse(text) } catch {
    const m = /```(?:json)?\s*([\s\S]*?)```/i.exec(text)
    if (m) { try { parsed = JSON.parse(m[1]) } catch { /* ignore */ } }
  }
  return parsed ? { ok: true, analysis: parsed } : { ok: false, error: text.slice(0, 300) || 'resposta não-JSON' }
}

// ── salvar artifact + agenda ──
async function saveReport(clientId, aggregate, analysis) {
  const now = new Date().toISOString()
  const md = [
    `# Análise de dados — ${clientId}`,
    ``,
    `> Gerado automaticamente pelo pipeline de análise (${now.slice(0, 16)} UTC). Base: ${aggregate.amostra} conteúdo(s) coletado(s).`,
    ``,
    `## Resumo`,
    `${analysis?.resumo || 'Sem resumo.'}`,
    ``,
    `## Métricas reais`,
    `- Alcance total: ${fmt(aggregate.total_reach)} · médio: ${fmt(aggregate.media_reach)}`,
    `- Interações: ${fmt(aggregate.total_interactions)} · taxa de engajamento: ${aggregate.taxa_engajamento}%`,
    `- Formatos: ${Object.entries(aggregate.por_formato).map(([k, v]) => `${k}: ${v}`).join(', ') || '—'}`,
    ``,
    `## Insights`,
    ...(analysis?.insights || []).map(i => `- **[${i.tipo}]** ${i.titulo}: ${i.detalhe} _(evidência: ${i.evidencia})_`),
    ``,
    `## Recomendações`,
    ...(analysis?.recomendacoes || []).map(r => `- ${r}`),
    ``,
    `## Pautas propostas`,
    ...(analysis?.pautas || []).map(p => `- **${p.titulo}** (${p.tipo}): ${p.objetivo}`),
    ``,
    `> Sem amostra suficiente? ${analysis?.sem_amostra ? 'Sim — conectar mais dados antes de concluir.' : 'Não.'}`,
  ].join('\n')
  const mdFile = path.join(marketingRoot, 'tmp', 'mediaos', `analysis-${clientId}-${Date.now()}.md`)
  const jsonFile = path.join(marketingRoot, 'tmp', 'mediaos', `analysis-${clientId}-${Date.now()}.json`)
  fs.mkdirSync(path.dirname(mdFile), { recursive: true })
  fs.writeFileSync(mdFile, md)
  fs.writeFileSync(jsonFile, JSON.stringify({ client_id: clientId, generated_at: now, aggregate, analysis }, null, 2))
  // storage
  await storage(`bucket/${encodeURIComponent('media')}`).catch(async () => { await storage('bucket', { method: 'POST', body: JSON.stringify({ id: 'media', name: 'media', public: true }) }) })
  const mdUrl = await storage(`object/media/${encodeURIComponent('analise')}/${encodeURIComponent(clientId)}/analise.md`, { method: 'POST', headers: { 'Content-Type': 'text/markdown', 'x-upsert': 'true' }, body: fs.readFileSync(mdFile) }).then(() => `${SUPABASE_URL}/storage/v1/object/public/media/analise/${clientId}/analise.md`).catch(() => null)
  const jsonUrl = await storage(`object/media/${encodeURIComponent('analise')}/${encodeURIComponent(clientId)}/dados.json`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-upsert': 'true' }, body: fs.readFileSync(jsonFile) }).then(() => `${SUPABASE_URL}/storage/v1/object/public/media/analise/${clientId}/dados.json`).catch(() => null)
  // artifact analysis (review)
  const artifact = await db('artifacts', { method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify({ client_id: clientId, artifact_type: 'analysis', title: `Análise de dados — ${clientId}`, status: 'review', current_version: 1, metadata: { preview_url: mdUrl, assets: [{ kind: 'report', url: mdUrl }, { kind: 'json', url: jsonUrl }], analysis: analysis?.analysis || analysis } }) })
  const a = artifact?.[0]
  if (a?.id) await db('artifact_versions', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ artifact_id: a.id, version: 1, kind: 'analysis', preview_url: mdUrl, manifest: { md_url: mdUrl, json_url: jsonUrl }, qa: { status: 'passed', checks: ['data_collected', 'llm_analyzed'] } }) })
  // agenda a partir das pautas
  const pautas = (analysis?.pautas || []).filter(p => p?.titulo).slice(0, 6)
  const agendaCreated = []
  if (createAgenda && pautas.length) {
    for (const p of pautas) {
      const type = ['carousel', 'post', 'reel', 'video', 'strategy', 'design'].includes(String(p.tipo)) ? String(p.tipo) : 'conteudo'
      const row = await db('work_requests', { method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify({ client_id: clientId, title: p.titulo, request_type: 'agenda_item', status: 'proposta', source_system: 'marketingos', target_system: 'marketingos', requires_approval: true, payload: { agenda: { type, objective: String(p.objetivo || ''), due_date: null, origin: 'analise_dados' } }, created_at: new Date().toISOString() }) })
      if (row?.[0]?.id) agendaCreated.push({ id: row[0].id, title: p.titulo, type })
    }
  }
  return { artifact: a, mdUrl, jsonUrl, agendaCreated, pautas }
}

async function main() {
  const { rows, contents } = await collectData(clientId)
  if (!rows.length) { console.log(JSON.stringify({ ok: true, client: clientId, message: 'Sem dados coletados ainda — conecte e sincronize as fontes do cliente primeiro.' })); return }
  const agg = aggregate(contents)
  if (agg.amostra < 3) {
    console.log(JSON.stringify({ ok: true, client: clientId, message: `Amostra pequena (${agg.amostra} conteúdos) — análise real ainda não confiável. Conecte mais dados.` }))
    return
  }
  const llm = await analyzeWithLLM(clientId, agg)
  if (!llm.ok) { console.log(JSON.stringify({ ok: false, client: clientId, error: llm.error })); process.exit(1) }
  const saved = await saveReport(clientId, agg, llm.analysis)
  console.log(JSON.stringify({ ok: true, client: clientId, amostra: agg.amostra, insights: (llm.analysis.insights || []).length, pautas: saved.pautas.length, agenda_criada: saved.agendaCreated.length, artifact: saved.artifact?.id ? saved.artifact.id.slice(0, 8) : null, report_url: saved.mdUrl }))
}

main().catch(e => { console.error(e.message); process.exit(1) })
