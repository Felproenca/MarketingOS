// Code Agent — modo "code mode": a IA escreve um programa Node.js que resolve a
// tarefa, executa num sandbox temporário e itera em caso de erro. Reduz tokens
// para tarefas determinísticas/repetitivas e é eficaz para código.
import { writeFileSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { execFileSync } from 'node:child_process'

const MODEL = 'deepseek-chat'

async function llm(system, prompt, maxTokens = 3000) {
  const key = process.env.DEEPSEEK_API_KEY
  if (!key) throw new Error('DEEPSEEK_API_KEY ausente')
  const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
    body: JSON.stringify({ model: MODEL, max_tokens: maxTokens, messages: [{ role: 'system', content: system }, { role: 'user', content: prompt }] }),
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body?.error?.message || `DeepSeek HTTP ${res.status}`)
  return body?.choices?.[0]?.message?.content || ''
}

function extractCode(text) {
  const m = /```(?:js|javascript|mjs|node)?\s*([\s\S]*?)```/i.exec(text || '')
  if (m) return m[1].trim()
  const start = (text || '').indexOf('const ') >= 0 ? (text || '').indexOf('const ') : 0
  return (text || '').slice(start).trim()
}

export async function runCodeAgent({ task, context = '', maxAttempts = 3, timeoutMs = 30000 }) {
  const dir = mkdtempSync(join(tmpdir(), 'codeagent-'))
  const file = join(dir, 'program.mjs')
  const system = 'Você é um programador Node.js. Escreva SOMENTE um programa .mjs completo (sem markdown, sem explicação) que resolve a tarefa e imprime o resultado como JSON válido em stdout via console.log(JSON.stringify(...)). Use apenas módulos nativos do Node.js (fs, path, http, crypto…). Sem dependências externas.'
  let prompt = `Tarefa:\n${task}${context ? `\n\nContexto:\n${context}` : ''}`
  let code = ''
  let output = ''
  let attempts = 0
  let lastError = ''
  try {
    for (let i = 0; i < maxAttempts; i++) {
      attempts = i + 1
      const text = await llm(system, prompt)
      code = extractCode(text)
      writeFileSync(file, code)
      try {
        output = execFileSync('node', [file], { timeout: timeoutMs, encoding: 'utf8', cwd: dir }).trim()
        return { ok: true, attempts, code, output, lastError: null }
      } catch (e) {
        lastError = String(e.stderr || e.stdout || e.message || e).slice(0, 1500)
        prompt = `Tarefa:\n${task}\n\nSeu programa anterior falhou. Corrija-o e reimprima o programa completo.\n\nErro:\n${lastError}\n\nPrograma anterior:\n${code}`
      }
    }
    return { ok: false, attempts, code, output, lastError, error: 'max_attempts_reached' }
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}
