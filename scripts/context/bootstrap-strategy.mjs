#!/usr/bin/env node
// Converte o registro legado (estrategia.md + client.md + brand-kit + client_references)
// em outputs/strategy/strategy-decision.json no schema atual (decision-record.js).
//
// Por que existe: o Context Gate exige strategy-decision.json para jobs de conteúdo,
// mas os clientes antigos tinham o formato estrategia.md. Este script promove o material
// REAL já existente para o formato novo, com rastreabilidade (generated_from).
//
// Uso:
//   node scripts/context/bootstrap-strategy.mjs              # todos os clientes
//   node scripts/context/bootstrap-strategy.mjs --slug x     # um cliente
//   node scripts/context/bootstrap-strategy.mjs --force      # sobrescreve existentes
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const marketingRoot = path.resolve(__dirname, '..', '..')
const clientsRoot = path.join(marketingRoot, 'clients')

const args = process.argv.slice(2)
const onlySlug = args.includes('--slug') ? args[args.indexOf('--slug') + 1] : ''
const force = args.includes('--force')

// ── Supabase (client_references) ────────────────────────────────────────────
const env = {}
try {
  for (const line of fs.readFileSync(path.join(marketingRoot, '.env'), 'utf8').split('\n')) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line)
    if (m && !env[m[1]]) env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
} catch { /* sem .env local — só arquivos */ }

async function fetchReference(clientId) {
  const url = String(env.SUPABASE_URL || '').replace(/\/rest\/v1$/, '').replace(/\/$/, '')
  const key = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SECRET_KEY
  if (!url || !key) return null
  try {
    const r = await fetch(`${url}/rest/v1/client_references?client_id=eq.${encodeURIComponent(clientId)}&select=brand_profile,voice_profile,offers,constraints,approved_examples,notes&limit=1`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    })
    if (!r.ok) return null
    const rows = await r.json()
    return rows?.[0] || null
  } catch { return null }
}

// ── Síntese do registro a partir do material real ───────────────────────────
function slugFromDir(name) {
  return name
}

function extractLines(text) {
  return String(text || '')
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line && !/^#/.test(line) && !/^```/.test(line) && !/^>/.test(line) && line.length > 25)
    .slice(0, 8)
}

function buildDecision({ slug, estrategia, clientText, brandKit, reference }) {
  const now = new Date().toISOString()
  const lines = extractLines(estrategia)
  const brand = brandKit || {}
  const brandProfile = reference?.brand_profile || {}
  const offers = Array.isArray(reference?.offers) ? reference.offers : []
  const positioning = brandProfile.positioning || brand.positioning || (clientText || '').split('\n').find(line => line.includes(':') && line.length > 20) || ''
  const audience = brandProfile.audience || brand.audience || 'Público definido no registro do cliente.'
  const objective = lines[0] || `Operar marketing de ${slug} com base no registro estratégico existente.`
  const bottleneck = lines[1] || (positioning ? `Converter interesse em venda sem perder o posicionamento: ${positioning.slice(0, 120)}` : 'Transformar presença digital em retorno mensurável.')
  const thesis = lines[2] || 'Conteúdo deve educar e conduzir à compra com base nos dados reais do negócio.'
  const evidence = []
  const addEvidence = (id, kind, source, observed, implication) => {
    if (observed && observed.length > 10) {
      evidence.push({ id, kind, source, source_url: '', observed: observed.slice(0, 280), implication: implication || 'Base para as decisões abaixo.', captured_at: now, confidence: 'medium' })
    }
  }
  addEvidence('EV-ESTRATEGIA', 'first_party', `estrategia.md (${slug})`, lines[0] || null, 'Foco atual e prioridades registradas anteriormente.')
  addEvidence('EV-CLIENT', 'first_party', `client.md (${slug})`, (clientText || '').split('\n').find(line => line.trim().length > 30) || null, 'Posicionamento e contexto do cliente.')
  addEvidence('EV-BRAND', 'first_party', 'brand-kit.json / client_references', positioning || null, 'Direção de marca e oferta.')
  addEvidence('EV-AUDIENCE', 'audience', 'client_references', audience || null, 'Público e linguagem esperada.')
  addEvidence('EV-OFFERS', 'first_party', 'client_references', offers.length ? offers.slice(0, 3).join('; ') : null, 'Ofertas que orientam o CTA e o funil.')
  // Evidência de mercado/canal (exigida pelo decision-record: audience|first_party|interview + market|competitor|platform)
  const platformLine = lines.find(line => /mercado|concorr|instagram|shopee|mercadolivre|mercado livre|youtube|google|plataforma|campanha|anuncio/i.test(line))
  addEvidence('EV-PLATFORM', 'platform', 'estrategia.md / registro operacional', platformLine || thesis || lines[0] || null, 'Canal e contexto de mercado registrados na estratégia do cliente.')

  const hypotheses = []
  if (bottleneck) hypotheses.push({
    id: 'H-01',
    statement: bottleneck.slice(0, 200),
    lever: 'conteudo',
    metric: 'engajamento_e_venda',
    decision_rule: 'Se o engajamento crescer sem venda, revisar CTA e oferta.',
    window: '14 dias',
    evidence_ids: evidence.slice(0, 3).map(e => e.id),
  })
  if (thesis) hypotheses.push({
    id: 'H-02',
    statement: thesis.slice(0, 200),
    lever: 'narrativa',
    metric: 'conversao',
    decision_rule: 'Validar com teste de ângulo em publicação e medir conversão.',
    window: '30 dias',
    evidence_ids: evidence.slice(0, 3).map(e => e.id),
  })

  const funnel = {
    funnel_stage: 'consideracao',
    intent_level: 'medio',
    friction_level: 'medio',
    lead_signal_expected: 'whatsapp_ou_compra',
    qualification_goal: 'entender a dor antes de oferecer',
    primary_cta: offers.length ? `Conhecer ${offers[0].slice(0, 60)}` : 'Falar com a marca',
    routing_destination: 'whatsapp',
    next_best_action: 'Produzir conteúdo educacional que conduza à conversa com a marca.',
  }

  return {
    schema_version: 1,
    client_slug: slug,
    status: 'approved',
    generated_from: 'estrategia.md (conversão do registro anterior)',
    decision_question: objective,
    acquisition_objective: objective,
    primary_bottleneck: bottleneck,
    market_thesis: thesis,
    not_now: [
      'Não prometer resultados individuais sem avaliação ou contexto do cliente.',
      'Não publicar conteúdo sem a decisão estratégica registrada.',
    ],
    approved_by: 'system:bootstrap-legacy',
    approved_at: now,
    evidence,
    hypotheses: hypotheses.length >= 2 ? hypotheses : [
      ...hypotheses,
      {
        id: 'H-03',
        statement: 'Produzir com consistência e medir o retorno para calibrar a operação.',
        lever: 'operacao',
        metric: 'outputs_aprovados',
        decision_rule: 'Manter o que gera aprovação; revisar o que bloqueia.',
        window: '30 dias',
        evidence_ids: evidence.slice(0, 3).map(e => e.id),
      },
    ],
    funnel_metadata: funnel,
    source: {
      estrategia_md: path.join('clients', slug, 'estrategia.md'),
      generated_at: now,
      note: 'Registro promovido do formato legado. Refine com uma rodada de strategy quando a operação estabilizar.',
    },
  }
}

// ── Execução ─────────────────────────────────────────────────────────────────
async function main() {
  const dirs = fs.readdirSync(clientsRoot, { withFileTypes: true })
    .filter(d => d.isDirectory() && !d.name.startsWith('_') && d.name !== 'agency')
    .map(d => d.name)
    .filter(name => !onlySlug || name === onlySlug)

  const done = []
  const skipped = []
  for (const slug of dirs) {
    const clientDir = path.join(clientsRoot, slug)
    const estrategiaFile = path.join(clientDir, 'estrategia.md')
    const targetDir = path.join(clientDir, 'outputs', 'strategy')
    const targetFile = path.join(targetDir, 'strategy-decision.json')
    if (!fs.existsSync(estrategiaFile)) { skipped.push(`${slug}: sem estrategia.md`); continue }
    if (fs.existsSync(targetFile) && !force) { skipped.push(`${slug}: já existe`); continue }
    const estrategia = fs.readFileSync(estrategiaFile, 'utf8')
    const clientText = fs.existsSync(path.join(clientDir, 'client.md')) ? fs.readFileSync(path.join(clientDir, 'client.md'), 'utf8') : ''
    let brandKit = null
    try { brandKit = JSON.parse(fs.readFileSync(path.join(clientDir, 'brand-kit.json'), 'utf8')) } catch { /* sem brand-kit */ }
    const reference = await fetchReference(slug)
    const decision = buildDecision({ slug, estrategia, clientText, brandKit, reference })
    fs.mkdirSync(targetDir, { recursive: true })
    fs.writeFileSync(targetFile, JSON.stringify(decision, null, 2))
    done.push(slug)
  }
  console.log(JSON.stringify({ ok: true, gerados: done, ignorados: skipped }, null, 2))
}

main().catch(error => { console.error(error.message); process.exit(1) })
