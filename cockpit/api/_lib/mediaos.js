import crypto from 'node:crypto'
import { db } from './config.js'

export async function createMediaJob({ requestId, clientId, jobType, capability, input = {}, createdBy, requiresApproval = true, priority = 'normal', idempotencyKey, skillId }) {
  const stableKey = idempotencyKey || crypto.createHash('sha256').update(JSON.stringify({ requestId, clientId, jobType, capability, input })).digest('hex')
  let existing = []
  try { existing = await db(`media_jobs?idempotency_key=eq.${encodeURIComponent(stableKey)}&select=*&limit=1`) } catch (error) {
    if (!/column .*idempotency_key|schema cache/i.test(String(error.message))) throw error
  }
  if (existing?.[0]) return existing[0]
  const hardenedBody = {
    request_id: requestId || null,
    client_id: clientId,
    job_type: jobType,
    capability,
    skill_id: skillId || null,
    priority,
    input,
    created_by: createdBy || null,
    requires_approval: requiresApproval,
    status: 'queued',
    idempotency_key: stableKey,
    max_attempts: Number(process.env.MEDIAOS_MAX_ATTEMPTS || 3),
    next_attempt_at: new Date().toISOString(),
  }
  let rows
  try {
    rows = await db('media_jobs', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify(hardenedBody),
    })
  } catch (error) {
    if (!/column .*idempotency_key|column .*max_attempts|column .*skill_id|schema cache/i.test(String(error.message))) throw error
    rows = await db('media_jobs', { method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify({ ...hardenedBody, skill_id: undefined, idempotency_key: undefined, max_attempts: undefined, next_attempt_at: undefined }) })
  }
  const job = rows?.[0]
  if (!job?.id) throw new Error('MediaOS não conseguiu criar o job.')
  await db('media_job_events', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({ job_id: job.id, event_type: 'job_created', to_status: 'queued', message: 'Job criado pelo MediaOS.', metadata: { capability } }),
  })
  return job
}
