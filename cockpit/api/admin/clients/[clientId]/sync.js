import { db, decrypt } from '../../../_lib/config.js'
import { call } from '../../../_lib/meta.js'
import { authError, requireAdmin } from '../../../_lib/auth.js'

export default async function handler(request, response) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'method_not_allowed' })
  const clientId = String(request.query.clientId || '')
  try {
    await requireAdmin(request)
    const rows = await db(`connections?client_id=eq.${encodeURIComponent(clientId)}&source=eq.meta&select=source_account_id,access_token_encrypted&limit=1`)
    const connection = rows?.[0]
    if (!connection) return response.status(404).json({ error: 'connection_not_found' })
    const started = new Date().toISOString()
    const run = await db('data_now_sync_runs', { method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify({ client_id: clientId, source: 'instagram', trigger: 'manual', status: 'running', started_at: started }) })
    const runId = run?.[0]?.id
    const token = decrypt(connection.access_token_encrypted)
    const observedAt = new Date().toISOString()
    const raw = []
    const normalized = []
    const account = await call(`/${connection.source_account_id}`, { fields: 'id,username,name,followers_count,media_count', access_token: token })
    raw.push(rawRow(runId, clientId, 'account', connection.source_account_id, observedAt, account))
    normalized.push(normalizedRow(runId, clientId, connection.source_account_id, 'account', connection.source_account_id, observedAt, { followers: account.followers_count ?? null, media_count: account.media_count ?? null }, { username: account.username || null }))
    const mediaPage = await call(`/${connection.source_account_id}/media`, { fields: 'id,caption,media_type,media_product_type,timestamp,permalink,like_count,comments_count,media_url,thumbnail_url', limit: '100', access_token: token })
    for (const item of mediaPage.data || []) {
      const insightPayload = []
      for (const metric of ['reach', 'impressions', 'saved', 'shares', 'total_interactions', 'follows', 'plays', 'video_views']) {
        try { insightPayload.push(await call(`/${item.id}/insights`, { metric, access_token: token })) } catch { insightPayload.push({ data: [{ name: metric, value: null, unavailable: true }] }) }
      }
      const payload = { media: item, insights: insightPayload }
      raw.push(rawRow(runId, clientId, 'content', item.id, observedAt, payload))
      const metrics = { likes: item.like_count ?? null, comments: item.comments_count ?? null }
      for (const result of insightPayload.flatMap(value => value.data || [])) metrics[result.name] = result.total_value?.value ?? result.values?.[0]?.value ?? result.value ?? null
      normalized.push(normalizedRow(runId, clientId, connection.source_account_id, 'content', item.id, observedAt, metrics, { media_type: item.media_type || null, product_type: item.media_product_type || null, permalink: item.permalink || null }))
    }
    if (raw.length) await db('data_now_raw', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify(raw) })
    if (normalized.length) await db('data_now_normalized', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify(normalized) })
    await db(`data_now_sync_runs?id=eq.${encodeURIComponent(runId)}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ status: 'success', finished_at: new Date().toISOString(), raw_records: raw.length, normalized_records: normalized.length }) })
    return response.status(200).json({ clientId, runId, source: 'instagram', status: 'success', rawRecords: raw.length, normalizedRecords: normalized.length })
  } catch (error) { return authError(response, error) }
}

function rawRow(runId, clientId, entityType, entityId, observedAt, payload) { return { run_id: runId, client_id: clientId, source: 'instagram', entity_type: entityType, entity_id: entityId, observed_at: observedAt, payload } }
function normalizedRow(runId, clientId, accountId, entityType, entityId, observedAt, metrics, metadata) { return { run_id: runId, schema_version: '1.0', client_id: clientId, source: 'instagram', source_account_id: accountId, entity_type: entityType, entity_id: entityId, observed_at: observedAt, metrics, raw_ref: `${clientId}/raw/instagram/${entityId}`, metadata } }
