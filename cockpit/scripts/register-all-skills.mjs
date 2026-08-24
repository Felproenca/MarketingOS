// Registra TODAS as skills de MarketingOS/skills no registry.json.
// - Preserva as 18 já registradas (status/executor/overrides).
// - Adiciona as .md que têm frontmatter de skill (name + command) e ainda não estão no registry.
// - Classifica capability/categoria por heurística de grupo + nome.
// Roda: node scripts/register-all-skills.mjs
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const skillsDir = path.join(root, 'skills')
const registryPath = path.join(skillsDir, 'registry.json')
const mktRegistryPath = path.join(__dirname, '..', '..', 'skills', 'registry.json') // MarketingOS/skills/registry.json

function walk(dir) {
  const out = []
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name)
    if (e.isDirectory()) out.push(...walk(full))
    else if (/\.md$/i.test(e.name)) out.push(full)
  }
  return out
}

function parseFrontmatter(text) {
  const m = /^---\s*\n([\s\S]*?)\n---/.exec(text)
  if (!m) return {}
  const fm = {}
  for (const line of m[1].split('\n')) {
    const eq = line.indexOf(':')
    if (eq < 0) continue
    const key = line.slice(0, eq).trim()
    const value = line.slice(eq + 1).trim().replace(/^["']|["']$/g, '')
    if (key && value) fm[key] = value
  }
  return fm
}

function firstHeading(text) {
  const m = /^#\s+(.+)$/m.exec(text)
  return m ? m[1].replace(/—.*$/, '').trim() : null
}

function firstParagraph(text) {
  const body = text.replace(/^---\s*\n[\s\S]*?\n---/, '')
  const lines = body.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#') && !l.startsWith('>') && !l.startsWith('-') && !l.startsWith('→'))
  return (lines[0] || '').slice(0, 180)
}

function classify(group, name) {
  const g = String(group || '').toLowerCase()
  const n = String(name || '').toLowerCase()
  const mk = (capability, category, extra = {}) => ({ capability, category, ...extra })

  if (n.includes('abrir') || n.includes('salvar')) return mk(null, 'sistema', { selectable: false, requestTypes: [] })
  if (n.includes('agent-builder')) return mk(null, 'sistema', { selectable: false, requestTypes: ['other'] })

  // grupos específicos primeiro (evita keyword errada, ex.: skill-site-audit)
  if (g === 'analise') {
    if (n.includes('seo') || n.includes('site-audit') || n.includes('trend') || n.includes('investigar')) return mk('research', 'pesquisa')
    if (n.includes('estrategista')) return mk('strategy', 'estrategia')
    return mk('analysis', 'dados')
  }
  if (g === 'aquisicao') return mk('ads', 'aquisicao')
  if (g === 'percepcao' || g === 'perception') return mk('research', 'pesquisa')
  if (g === 'inteligencia') return mk('research', 'pesquisa')
  if (g === 'relacionamento') return mk('automation', 'relacionamento')
  if (g === 'venda') return mk('strategy', 'estrategia')

  // criacao / demais
  if (n.includes('carousel')) return mk('carousel', 'criacao')
  if (n.includes('image')) return mk('image_generate', 'criacao')
  if (n.includes('video') || n.includes('reel')) return mk('video_edit', 'criacao')
  if (n.includes('site-builder') || n.includes('motion')) return mk(null, 'criacao', { requestTypes: ['site'] })
  if (n.includes('publicar') || n.includes('publish')) return mk('publish', 'distribuicao')
  if (n.includes('post') || n.includes('conteudo') || n.includes('social-copy') || n.includes('criar')) return mk('post', 'criacao')

  return mk('strategy', g === 'criacao' ? 'criacao' : (g || 'estrategia'))
}

function executorFor(capability) {
  if (capability === 'image_generate') return 'desingos-fal-kie-adapter'
  if (capability === 'video_generate' || capability === 'video_edit') return 'editoros-video-edit-v1'
  if (capability === 'publish') return 'mediaos-publisher-v1'
  if (capability === 'data_sync') return 'mediaos-data-sync-v1'
  return 'marketingos-local-executor'
}

function providersFor(capability) {
  if (capability === 'image_generate' || capability === 'video_generate') return ['fal']
  if (capability === 'research') return ['pipeline', 'deepseek']
  return ['pipeline']
}

function requiresFor(capability) {
  const base = ['client_truth', 'brief']
  if (capability === 'research') return ['research_brief', 'client_truth']
  if (capability === 'ads') return ['objective', 'audience', 'client_truth']
  if (capability === 'automation') return ['trigger', 'routing', 'client_truth']
  return base
}

// As 18 skills originais são preservadas intactas (status/executor/overrides).
// As demais são regeneradas a partir dos SKILL.md.
const CORE = new Set(['ai-orchestration', 'client-onboarding', 'artifact-qa', 'external-output-recovery', 'brand-intelligence', 'topic-intelligence', 'criacao-carousel', 'criacao-post', 'criacao-image-generation', 'criacao-video-ai', 'video-edit', 'funnel-strategy', 'acquisition', 'relationship', 'premium-site', 'data-analysis', 'data-sync', 'publish'])

const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'))
const core = registry.skills.filter(s => CORE.has(s.skill_id))
const existingPaths = new Set(core.map(s => s.path))
const existingIds = new Set(core.map(s => s.skill_id))

const added = []
for (const file of walk(skillsDir)) {
  const rel = path.relative(root, file).replace(/\\/g, '/')
  if (existingPaths.has(rel)) continue
  const text = fs.readFileSync(file, 'utf8')
  const fm = parseFrontmatter(text)
  if (!fm.name) continue // não é uma skill (template/anotação sem frontmatter de skill)
  const name = String(fm.name)
  if (existingIds.has(name)) continue
  const { capability, category, selectable = true, requestTypes } = classify(fm.group, name)
  const label = firstHeading(text) || name
  const description = firstParagraph(text) || String(fm.command || name)
  const reqTypes = requestTypes || (capability ? [capability] : [])
  const entry = {
    skill_id: name,
    label,
    description,
    category,
    owner: 'MarketingOS',
    selectable,
    path: rel,
    status: 'available',
    capability,
    request_types: reqTypes,
    requires: capability ? requiresFor(capability) : ['context'],
    executor: executorFor(capability),
    output: ['artifact'],
    qa: capability ? ['human_review'] : [],
    approval_required: capability !== null,
    providers_allowed: providersFor(capability),
    fallback: capability === 'research' || capability === 'image_generate' || capability === 'video_generate' ? 'prompt_and_upload' : 'blocked',
  }
  added.push(entry)
}

registry.skills = [...core, ...added].sort((a, b) => String(a.skill_id).localeCompare(String(b.skill_id)))

const out = JSON.stringify(registry, null, 2) + '\n'
fs.writeFileSync(registryPath, out)
if (fs.existsSync(path.dirname(mktRegistryPath))) fs.writeFileSync(mktRegistryPath, out)

console.log(`Registradas +${added.length} skills. Total: ${registry.skills.length}`)
const byStatus = {}
for (const s of registry.skills) byStatus[s.status] = (byStatus[s.status] || 0) + 1
console.log('status:', byStatus)
for (const a of added) console.log(`  + ${a.skill_id.padEnd(30)} ${(a.capability || '—').padEnd(15)} ${a.category}`)
