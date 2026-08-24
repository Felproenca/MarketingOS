import { requireUser, authError } from './_lib/auth.js'
import { db } from './_lib/config.js'
import { executeJob } from './_lib/executor.js'
import { resolveAI } from './_lib/ai-router.js'

export default async function handler(request, response) {
  try {
    const user = await requireUser(request)
    const id = String(request.query.id || '').trim()
    if (!id) return response.status(400).json({ error: 'id_obrigatorio' })

    if (request.method === 'GET') {
      const jobs = await db(`media_jobs?id=eq.${encodeURIComponent(id)}&select=*&limit=1`)
      const job = jobs?.[0]
      if (!job) return response.status(404).json({ error: 'Missão não encontrada.' })
      const artifacts = await db(`artifacts?job_id=eq.${encodeURIComponent(id)}&select=*&order=created_at.desc&limit=10`).catch(() => [])
      return response.status(200).json({ job, artifacts: artifacts || [] })
    }

    if (request.method === 'POST') {
      const jobs = await db(`media_jobs?id=eq.${encodeURIComponent(id)}&select=*&limit=1`)
      const job = jobs?.[0]
      if (!job) return response.status(404).json({ error: 'Missão não encontrada.' })
      const route = resolveAI({ capability: job.capability, connection: null, policy: {}, estimatedCost: 0 })
      const execution = await executeJob(job, route)
      return response.status(200).json({ execution, job })
    }

    if (request.method === 'DELETE') {
      await db(`media_jobs?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE', headers: { Prefer: 'return=minimal' } }).catch(() => null)
      return response.status(200).json({ ok: true })
    }

    return response.status(405).json({ error: 'method_not_allowed' })
  } catch (error) {
    return authError(response, error)
  }
}
