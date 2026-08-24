import { existsSync } from 'node:fs'
import path from 'node:path'
import { validateSkillRegistry, loadSkillRegistry } from '../cockpit/api/_lib/skill-registry.js'

const root = path.resolve(import.meta.dirname, '..')

function main() {
  const { ok, errors, registry } = validateSkillRegistry()
  const missing = []
  for (const skill of registry.skills) {
    if (!skill.path) continue
    if (!existsSync(path.join(root, skill.path))) missing.push(`${skill.skill_id}: arquivo nao encontrado (${skill.path})`)
  }
  const rows = registry.skills.map(skill => ({
    skill_id: skill.skill_id,
    status: skill.status,
    capability: skill.capability || '(meta)',
    request_types: skill.request_types.join(',') || '-',
    executor: skill.executor,
    approval: skill.approval_required,
    fallback: skill.fallback,
  }))
  console.table(rows)
  console.log(JSON.stringify({
    ok: ok && missing.length === 0,
    version: registry.version,
    total: registry.skills.length,
    operational: registry.skills.filter(skill => skill.status === 'operational').length,
    available: registry.skills.filter(skill => skill.status === 'available').length,
    errors,
    missing_files: missing,
  }, null, 2))
  if (!ok || missing.length) process.exitCode = 1
}

main()
