import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const REGISTRY_PATH = require.resolve('../../skills/registry.json')

const REQUIRED_FIELDS = ['skill_id', 'label', 'description', 'category', 'owner', 'selectable', 'path', 'status', 'capability', 'request_types', 'requires', 'executor', 'output', 'qa', 'approval_required', 'providers_allowed', 'fallback']
const STATUSES = new Set(['operational', 'available', 'archived'])
const FALLBACKS = new Set(['blocked', 'prompt_and_upload'])

let cache = null

export function loadSkillRegistry() {
  if (cache) return cache
  const raw = JSON.parse(readFileSync(REGISTRY_PATH, 'utf8'))
  if (!raw || !Array.isArray(raw.skills)) throw new Error('skills/registry.json invalido: lista "skills" ausente.')
  cache = raw
  return cache
}

export function validateSkillRegistry() {
  const registry = loadSkillRegistry()
  const errors = []
  const seen = new Set()
  for (const skill of registry.skills) {
    if (seen.has(skill.skill_id)) errors.push(`skill_id duplicado: ${skill.skill_id}`)
    seen.add(skill.skill_id)
    for (const field of REQUIRED_FIELDS) {
      if (!(field in skill)) errors.push(`${skill.skill_id}: campo obrigatorio ausente "${field}"`)
    }
    if (skill.status && !STATUSES.has(skill.status)) errors.push(`${skill.skill_id}: status invalido "${skill.status}"`)
    if (typeof skill.label !== 'string' || !skill.label.trim()) errors.push(`${skill.skill_id}: label deve ser string nao vazia`)
    if (typeof skill.description !== 'string') errors.push(`${skill.skill_id}: description deve ser string`)
    if (typeof skill.category !== 'string' || !skill.category.trim()) errors.push(`${skill.skill_id}: category deve ser string nao vazia`)
    if (typeof skill.owner !== 'string' || !skill.owner.trim()) errors.push(`${skill.skill_id}: owner deve ser string nao vazia`)
    if (typeof skill.selectable !== 'boolean') errors.push(`${skill.skill_id}: selectable deve ser boolean`)
    if (skill.path !== null && typeof skill.path !== 'string') errors.push(`${skill.skill_id}: path deve ser string ou null`)
    if (skill.capability !== null && typeof skill.capability !== 'string') errors.push(`${skill.skill_id}: capability deve ser string ou null`)
    if (!Array.isArray(skill.request_types)) errors.push(`${skill.skill_id}: request_types deve ser um array`)
    if (!Array.isArray(skill.requires)) errors.push(`${skill.skill_id}: requires deve ser um array`)
    if (!Array.isArray(skill.output)) errors.push(`${skill.skill_id}: output deve ser um array`)
    if (!Array.isArray(skill.qa)) errors.push(`${skill.skill_id}: qa deve ser um array`)
    if (!Array.isArray(skill.providers_allowed)) errors.push(`${skill.skill_id}: providers_allowed deve ser um array`)
    if (typeof skill.approval_required !== 'boolean') errors.push(`${skill.skill_id}: approval_required deve ser boolean`)
    if (skill.fallback && !FALLBACKS.has(skill.fallback)) errors.push(`${skill.skill_id}: fallback invalido "${skill.fallback}"`)
    if (!skill.executor) errors.push(`${skill.skill_id}: executor obrigatorio`)
  }
  return { ok: errors.length === 0, errors, registry }
}

// Resolução determinística: canônicas (contrato original) primeiro; depois
// operational; `available` nunca derrubam a rota. Skills novas de capability
// única (audit, traffic, design, funnel_strategy...) continuam selecionáveis
// pela capability, mas não sequestram as request_types do contrato original.
function preferOperational(matches) {
  return matches.find(skill => skill.canonical === true)
    || matches.find(skill => skill.status === 'operational')
    || matches[0] || null
}

export function skillForCapability(capability) {
  const registry = loadSkillRegistry()
  return preferOperational(registry.skills.filter(skill => skill.capability === capability && skill.status !== 'archived'))
}

export function skillForRequestType(requestType) {
  const registry = loadSkillRegistry()
  return preferOperational(registry.skills.filter(skill => skill.request_types.includes(requestType) && skill.status !== 'archived'))
}

export function skillForId(skillId) {
  const registry = loadSkillRegistry()
  return registry.skills.find(skill => skill.skill_id === skillId && skill.status !== 'archived') || null
}

// Shape pronta para a área de seleção de skills do Cockpit. Exclui skills de
// sistema (selectable=false) e arquivadas. Campos operacionais vêm do próprio
// registry, sem duplicar display metadata no frontend.
export function skillsForSelection() {
  const registry = loadSkillRegistry()
  return registry.skills
    .filter(skill => skill.selectable !== false && skill.status !== 'archived')
    .map(skill => ({
      skill_id: skill.skill_id,
      label: skill.label,
      description: skill.description,
      category: skill.category,
      owner: skill.owner,
      capability: skill.capability,
      request_types: skill.request_types,
      requires: skill.requires,
      executor: skill.executor,
      output: skill.output,
      qa: skill.qa,
      approval_required: skill.approval_required,
      providers_allowed: skill.providers_allowed,
      fallback: skill.fallback,
      status: skill.status,
    }))
}
