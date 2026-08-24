#!/usr/bin/env node
// Garante o contexto local mínimo de um cliente antes da execução de jobs.
//
// O backend (Vercel) cria clientes no Supabase (client_references), mas o Context Gate
// e os executors leem arquivos LOCAIS (clients/<slug>/client.md, brand-kit.json,
// outputs/strategy/strategy-decision.json). Este módulo materializa o contexto local a
// partir do client_references quando faltar — sem exigir intervenção manual.
//
// Uso (módulo):
//   import { ensureClientContext } from './ensure-client-context.mjs'
//   const result = await ensureClientContext({ marketingRoot, clientId })
//
// Uso (CLI, teste):
//   node scripts/context/ensure-client-context.mjs --slug <slug>
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// ── Supabase (client_references) ────────────────────────────────────────────
function loadEnv(marketingRoot) {
  const env = { ...process.env }
  try {
    for (const line of fs.readFileSync(path.join(marketingRoot, '.env'), 'utf8').split('\n')) {
      const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line)
      if (m && !env[m[1]]) env[m[1]] = m[2].replace(/^["']|["']$/g, '')
    }
  } catch { /* sem .env local */ }
  return env
}

async function fetchReference(env, clientId) {
  const url = String(env.SUPABASE_URL || '').replace(/\/rest\/v1$/, '').replace(/\/$/, '')
  const key = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SECRET_KEY
  if (!url || !key) return null
  try {
    const r = await fetch(`${url}/rest/v1/client_references?client_id=eq.${encodeURIComponent(clientId)}&select=client_id,brand_profile,voice_profile,offers,constraints,approved_examples,notes&limit=1`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    })
    if (!r.ok) return null
    const rows = await r.json()
    return rows?.[0] || null
  } catch { return null }
}

// ── Materialização dos arquivos ─────────────────────────────────────────────
function buildClientMd(clientId, reference) {
  const bp = reference?.brand_profile || {}
  const vp = reference?.voice_profile || {}
  const lines = [
    `# ${clientId}`,
    '',
    '> Contexto materializado automaticamente do client_references (Supabase).',
    '',
  ]
  if (bp.positioning) lines.push(`## Posicionamento\n${bp.positioning}\n`)
  if (bp.audience) lines.push(`## Público\n${bp.audience}\n`)
  if (bp.visual_direction) lines.push(`## Direção visual\n${bp.visual_direction}\n`)
  if (vp.tone) lines.push(`## Tom de voz\n${vp.tone}\n`)
  if (Array.isArray(reference?.offers) && reference.offers.length) lines.push(`## Ofertas\n${reference.offers.map(o => `- ${o}`).join('\n')}\n`)
  if (Array.isArray(reference?.constraints) && reference.constraints.length) lines.push(`## Restrições\n${reference.constraints.map(c => `- ${c}`).join('\n')}\n`)
  if (Array.isArray(reference?.approved_examples) && reference.approved_examples.length) lines.push(`## Exemplos aprovados\n${reference.approved_examples.map(e => `- ${e}`).join('\n')}\n`)
  return lines.join('\n')
}

function buildBrandKit(clientId, reference) {
  const bp = reference?.brand_profile || {}
  return {
    client_slug: clientId,
    positioning: bp.positioning || '',
    audience: bp.audience || '',
    visual_direction: bp.visual_direction || '',
    tone: reference?.voice_profile?.tone || '',
    offers: reference?.offers || [],
    constraints: reference?.constraints || [],
    generated_from: 'client_references (auto-bootstrap)',
  }
}

function buildStrategyDecision(clientId, reference) {
  const bp = reference?.brand_profile || {}
  const offers = reference?.offers || []
  const positioning = bp.positioning || 'Posicionamento em definição.'
  const audience = bp.audience || 'Público em definição.'
  const now = new Date().toISOString()
  const evidence = [
    { id: 'EV-REFERENCE', kind: 'first_party', source: 'client_references', source_url: '', observed: positioning, implication: 'Posicionamento registrado pelo operador.', captured_at: now, confidence: 'medium' },
    { id: 'EV-AUDIENCE', kind: 'audience', source: 'client_references', source_url: '', observed: audience, implication: 'Linguagem e público esperado.', captured_at: now, confidence: 'medium' },
    { id: 'EV-OFFERS', kind: 'first_party', source: 'client_references', source_url: '', observed: offers.length ? offers.slice(0, 3).join('; ') : 'Oferta em definição.', implication: 'CTA e funil orientados pela oferta.', captured_at: now, confidence: 'medium' },
    { id: 'EV-PLATFORM', kind: 'platform', source: 'registro operacional', source_url: '', observed: 'Canais e operação do cliente sob gestão do MarketingOS.', implication: 'Produção integrada aos canais conectados.', captured_at: now, confidence: 'low' },
  ]
  const hypotheses = [
    { id: 'H-01', statement: `Educar o público sobre ${positioning.slice(0, 120)}`, lever: 'conteudo', metric: 'engajamento', decision_rule: 'Manter se houver engajamento qualificado.', window: '14 dias', evidence_ids: ['EV-REFERENCE', 'EV-AUDIENCE'] },
    { id: 'H-02', statement: `Converter atenção em venda por meio de CTA claro ligado a ${offers[0] || 'oferta'}.`, lever: 'narrativa', metric: 'conversao', decision_rule: 'Ajustar oferta/CTA se não houver conversão.', window: '30 dias', evidence_ids: ['EV-OFFERS', 'EV-PLATFORM'] },
  ]
  return {
    schema_version: 1,
    client_slug: clientId,
    status: 'approved',
    generated_from: 'client_truth_bootstrap (auto)',
    decision_question: `Qual narrativa torna ${positioning.slice(0, 90)} mais claro antes da venda?`,
    acquisition_objective: 'Produzir conteúdo que conecte o público à oferta com base no contexto registrado.',
    primary_bottleneck: 'Converter atenção em venda sem conhecimento aprofundado de mercado (decisão provisória).',
    market_thesis: 'Conteúdo consistente com o posicionamento e a oferta registrados gera aproximação e venda.',
    not_now: ['Não prometer resultados sem evidência real.', 'Não produzir fora do contexto registrado do cliente.'],
    approved_by: 'system:client-truth-bootstrap',
    approved_at: now,
    evidence,
    hypotheses,
    funnel_metadata: {
      funnel_stage: 'consideracao',
      intent_level: 'medio',
      friction_level: 'medio',
      lead_signal_expected: 'contato_ou_compra',
      qualification_goal: 'entender a dor antes de oferecer',
      primary_cta: offers.length ? `Conhecer ${offers[0].slice(0, 60)}` : 'Falar com a marca',
      routing_destination: 'whatsapp',
      next_best_action: 'Produzir conteúdo educacional alinhado ao posicionamento.',
    },
    source: { generated_at: now, note: 'Decisão provisória derivada do client_references. Refine com uma rodada de strategy.' },
  }
}

export async function ensureClientContext({ marketingRoot, clientId }) {
  const clientDir = path.join(marketingRoot, 'clients', clientId)
  const clientMd = path.join(clientDir, 'client.md')
  const brandKit = path.join(clientDir, 'brand-kit.json')
  const strategyFile = path.join(clientDir, 'outputs', 'strategy', 'strategy-decision.json')
  const created = []
  const missing = []

  // client.md é a base obrigatória do gate. Sem referência no Supabase, não há o que materializar.
  if (fs.existsSync(clientMd)) {
    return { ok: true, created, missing: [], already: true }
  }

  const env = loadEnv(marketingRoot)
  const reference = await fetchReference(env, clientId)
  if (!reference) {
    return { ok: false, missing: ['client_references'], error: `Sem client_references para ${clientId} — cadastre o contexto do cliente antes de produzir.` }
  }

  fs.mkdirSync(clientDir, { recursive: true })
  fs.writeFileSync(clientMd, buildClientMd(clientId, reference))
  created.push('client.md')
  if (!fs.existsSync(brandKit)) {
    fs.writeFileSync(brandKit, JSON.stringify(buildBrandKit(clientId, reference), null, 2))
    created.push('brand-kit.json')
  }
  if (!fs.existsSync(strategyFile)) {
    fs.mkdirSync(path.dirname(strategyFile), { recursive: true })
    fs.writeFileSync(strategyFile, JSON.stringify(buildStrategyDecision(clientId, reference), null, 2))
    created.push('outputs/strategy/strategy-decision.json')
  }
  return { ok: true, created, missing, reference: Boolean(reference) }
}

// CLI
if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) {
  const slug = process.argv.includes('--slug') ? process.argv[process.argv.indexOf('--slug') + 1] : ''
  if (!slug) { console.error('Uso: node scripts/context/ensure-client-context.mjs --slug <slug>'); process.exit(1) }
  const marketingRoot = path.resolve(__dirname, '..', '..')
  ensureClientContext({ marketingRoot, clientId: slug })
    .then(result => { console.log(JSON.stringify(result, null, 2)); process.exit(result.ok ? 0 : 1) })
    .catch(error => { console.error(error.message); process.exit(1) })
}
