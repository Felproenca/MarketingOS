import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { db } from '../cockpit/api/_lib/config.js'

const here = path.dirname(fileURLToPath(import.meta.url))
const source = path.join(here, '..', 'clients', 'bruno-capelli', 'outputs', 'strategy', 'content-funnel-90d.json')
const plan = JSON.parse(await fs.readFile(source, 'utf8'))
const existing = await db(`work_requests?client_id=eq.${encodeURIComponent(plan.client_id)}&request_type=eq.agenda_item&select=title,payload`)
const keys = new Set((existing || []).map(item => `${item.title}::${item.payload?.agenda?.due_date || ''}`))
const created = []

for (const item of plan.items) {
  const key = `${item.title}::${item.due_date}`
  if (keys.has(key)) continue
  const rows = await db('work_requests', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({
      client_id: plan.client_id,
      title: item.title,
      request_type: 'agenda_item',
      objective: item.objective,
      status: 'proposta',
      source_system: 'marketingos',
      target_system: 'marketingos',
      requires_approval: true,
      payload: { agenda: item },
      created_at: new Date().toISOString(),
    }),
  })
  if (rows?.[0]?.id) created.push(rows[0].id)
}

console.log(JSON.stringify({ client_id: plan.client_id, planned: plan.items.length, created: created.length, skipped: plan.items.length - created.length }))
