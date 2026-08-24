// Gera api/_lib/skills-content.js com o conteúdo de todos os SKILL.md
// de cockpit/skills/, para que o executor serverless leia o playbook real
// de cada skill em runtime (sem depender de fs.readFileSync fora do bundle).
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const skillsDir = path.join(root, 'skills')
const outFile = path.join(root, 'api', '_lib', 'skills-content.js')

function walk(dir) {
  const results = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) results.push(...walk(full))
    else if (/\.(md|json)$/i.test(entry.name)) results.push(full)
  }
  return results
}

const map = {}
for (const file of walk(skillsDir)) {
  const rel = path.relative(root, file).replace(/\\/g, '/')
  map[rel] = fs.readFileSync(file, 'utf8')
}

const body = `// GERADO por scripts/build-skills-content.mjs — NAO EDITE MANUALMENTE.\n// Regenere com: node scripts/build-skills-content.mjs\nexport const SKILLS_CONTENT = ${JSON.stringify(map)};\n`
fs.writeFileSync(outFile, body)
console.log(`skills-content.js gerado com ${Object.keys(map).length} playbooks (.md).`)
