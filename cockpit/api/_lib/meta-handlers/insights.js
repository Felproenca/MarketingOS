import { db, decrypt } from '../config.js'
import { call } from '../meta.js'
import { authError, requireClientAccess } from '../auth.js'

export default async function handler(request, response) {
  if (request.method !== 'GET') return response.status(405).json({ error: 'method_not_allowed' })
  const clientId = String(request.query.clientId || '')
  if (!/^[a-z0-9][a-z0-9_-]{1,80}$/i.test(clientId)) return response.status(400).json({ error: 'client_id_invalido' })
  try {
    await requireClientAccess(request, clientId, db)
    const rows = await db(`connections?client_id=eq.${encodeURIComponent(clientId)}&source=eq.meta&select=source_account_id,username,connected_at,access_token_encrypted&limit=1`)
    const connection = rows?.[0]
    const results = await loadOperationalResults(clientId)
    if (!connection) return response.status(200).json({ clientId, connected: false, source: 'instagram', account: null, period: null, insights: {}, media: { fetched: 0, items: [] }, results, error: 'connection_not_found' })
    try {
      const token = decrypt(connection.access_token_encrypted)
      const account = await call(`/${connection.source_account_id}`, { fields: 'id,username,name,followers_count,media_count', access_token: token })
      const since = Math.floor(Date.now() / 1000) - 28 * 86400
      const until = Math.floor(Date.now() / 1000)
      const metrics = ['reach', 'profile_views', 'website_clicks', 'follows']
      const insights = {}
      for (const metric of metrics) {
        try {
          const result = await call(`/${connection.source_account_id}/insights`, { metric, metric_type: 'total_value', period: 'day', since, until, access_token: token })
          insights[metric] = result.data?.[0] || null
        } catch (error) {
          insights[metric] = { value: null, unavailable: true, reason: error.message }
        }
      }
      const media = await collectMedia(connection.source_account_id, token, request.query.limit)
      return response.status(200).json({ clientId, connected: true, source: 'instagram', account: { id: account.id, username: account.username || connection.username || null, name: account.name || null, followers: account.followers_count ?? null, mediaCount: account.media_count ?? null }, period: { since: new Date(since * 1000).toISOString(), until: new Date(until * 1000).toISOString() }, insights, media, results, connectedAt: connection.connected_at })
    } catch (metaError) {
      console.error('meta_connection_unavailable', { clientId, message: metaError.message })
      return response.status(200).json({ clientId, connected: false, source: 'instagram', account: null, period: null, insights: {}, media: { fetched: 0, items: [] }, results, error: 'meta_unavailable' })
    }
  } catch (error) {
    console.error('meta_insights_failed', { clientId, message: error.message })
    return authError(response, error)
  }
}

async function loadOperationalResults(clientId) {
  const [artifacts, jobs, requests] = await Promise.all([
    db(`artifacts?client_id=eq.${encodeURIComponent(clientId)}&select=id,job_id,artifact_type,title,status,current_version,metadata,created_at,updated_at&order=updated_at.desc&limit=100`),
    db(`media_jobs?client_id=eq.${encodeURIComponent(clientId)}&select=id,job_type,capability,status,created_at,started_at,completed_at,error&order=created_at.desc&limit=50`),
    db(`work_requests?client_id=eq.${encodeURIComponent(clientId)}&select=id,title,request_type,objective,status,requires_approval,created_at,updated_at&order=created_at.desc&limit=100`),
  ])
  const artifactIds = (artifacts || []).map(item => item.id).join(',')
  const [versions, approvals] = artifactIds ? await Promise.all([
    db(`artifact_versions?artifact_id=in.(${encodeURIComponent(artifactIds)})&select=id,artifact_id,version,kind,preview_url,manifest,qa,created_at&order=version.desc`),
    db(`artifact_approvals?artifact_id=in.(${encodeURIComponent(artifactIds)})&select=id,artifact_id,version,actor_role,decision,feedback,created_at&order=created_at.desc`),
  ]) : [[], []]
  return { artifacts: artifacts || [], jobs: jobs || [], requests: requests || [], versions: versions || [], approvals: approvals || [] }
}

async function collectMedia(igUserId, token, requestedLimit) {
  const limit = Math.min(Math.max(Number(requestedLimit) || 50, 1), 100)
  const fields = 'id,caption,media_type,media_product_type,timestamp,permalink,like_count,comments_count,media_url,thumbnail_url,children{id,media_type,media_url,thumbnail_url}'
  const items = []
  let next = `/${igUserId}/media`
  let params = { fields, limit, access_token: token }
  while (next && items.length < limit) {
    const page = await call(next, params)
    items.push(...(page.data || []))
    next = page.paging?.next || null
    params = { access_token: token }
  }
  return {
    fetched: items.length,
    items: await Promise.all(items.slice(0, limit).map(item => enrichMedia(item, token))),
  }
}

async function enrichMedia(item, token) {
  const metrics = {}
  const metricNames = ['reach', 'impressions', 'saved', 'shares', 'total_interactions', 'follows', 'plays', 'video_views', 'ig_reels_avg_watch_time', 'ig_reels_video_view_total_time']
  for (const metric of metricNames) {
    try {
      const result = await call(`/${item.id}/insights`, { metric, access_token: token })
      const row = result.data?.[0]
      metrics[metric] = row?.total_value?.value ?? row?.values?.[0]?.value ?? null
    } catch (error) {
      metrics[metric] = null
    }
  }
  return {
    id: item.id,
    caption: item.caption || null,
    mediaType: item.media_type || null,
    productType: item.media_product_type || null,
    timestamp: item.timestamp || null,
    permalink: item.permalink || null,
    likeCount: item.like_count ?? null,
    commentsCount: item.comments_count ?? null,
    mediaUrl: item.media_url || null,
    thumbnailUrl: item.thumbnail_url || null,
    children: item.children?.data || [],
    metrics,
  }
}
