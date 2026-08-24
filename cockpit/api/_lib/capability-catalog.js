// Catálogo de capabilities derivado integralmente de skills/registry.json.
// Não existe mais display metadata hardcoded: label, description, category,
// owner, executor, qa, approval, providers e fallback vêm do registry. Uma
// skill nova publicada no registry aparece no Cockpit sem deploy de código.
import { loadSkillRegistry, skillsForSelection } from './skill-registry.js'

function displayStatus(skill) {
  if (skill.status === 'operational') return 'operational'
  if (skill.status === 'archived') return 'archived'
  const local = skill.providers_allowed.includes('pipeline')
  if (!local && skill.providers_allowed.length) return 'needs_connection'
  return 'available'
}

export function capabilityCatalog() {
  return skillsForSelection().map(skill => ({
    id: skill.skill_id,
    label: skill.label,
    description: skill.description,
    category: skill.category,
    owner: skill.owner,
    requestTypes: skill.request_types,
    executor: skill.executor,
    input: skill.requires.join(' + '),
    output: skill.output.join(' + '),
    qa: skill.qa,
    approval: skill.approval_required,
    status: displayStatus(skill),
    provider: 'deferred_to_ai_router',
    model: 'deferred_to_ai_router',
    skill: skill.skill_id,
    providers: skill.providers_allowed,
    fallback: skill.fallback,
  }))
}

export function registryMeta() {
  const registry = loadSkillRegistry()
  return {
    version: registry.version,
    policy: registry.policy,
    total: registry.skills.length,
    selectable: registry.skills.filter(skill => skill.selectable !== false && skill.status !== 'archived').length,
  }
}
