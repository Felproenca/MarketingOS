import { db, decrypt } from './config.js'
import { call as metaCall } from './meta.js'
import { call as googleCall, refresh } from './google.js'

const now = () => new Date().toISOString()

async function runStart(clientId, source, trigger = 'scheduler') {
  const created = await db('data_now_sync_runs', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({ client_id: clientId, source, trigger, status: 'running', started_at: now() }),
  })
  return created?.[0]
}

async function runEnd(runId, { status = 'success', rawRecords = 0, normalizedRecords = 0, errorCount = 0, lastError = null }) {
  if (!runId) return
  await db(`data_now_sync_runs?id=eq.${encodeURIComponent(runId)}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({ status, raw_records: rawRecords, normalized_records: normalizedRecords, error_count: errorCount, last_error: lastError, finished_at: now() }),
  }).catch(() => null)
}

async function metaToken(clientId) {
  const rows = await db(`connections?client_id=eq.${encodeURIComponent(clientId)}&source=eq.meta&select=source_account_id,access_token_encrypted&limit=1`)
  const row = rows?.[0]
  if (!row) return null
  return { igUserId: row.source_account_id, token: decrypt(row.access_token_encrypted) }
}

async function googleToken(clientId) {
  const rows = await db(`connections?client_id=eq.${encodeURIComponent(clientId)}&source=eq.google&select=access_token_encrypted,expires_at&limit=1`)
  const row = rows?.[0]
  if (!row) return null
  const bundle = JSON.parse(decrypt(row.access_token_encrypted))
  let token = bundle.accessToken
  if (row.expires_at && new Date(row.expires_at).getTime() <= Date.now() && bundle.refreshToken) {
    try { token = (await refresh(bundle.refreshToken)).accessToken } catch { /* keep stale token */ }
  }
  return token
}

async function pullInstagram(clientId) {
  const c = await metaToken(clientId)
  if (!c) return { ok: false, error: 'connection_not_found' }
  const since = Math.floor(Date.now() / 1000) - 28 * 86400
  const until = Math.floor(Date.now() / 1000)
  const metrics = {}
  for (const metric of ['reach', 'profile_views', 'website_clicks', 'follows']) {
    try {
      const r = await metaCall(`/${c.igUserId}/insights`, { metric, metric_type: 'total_value', period: 'day', since, until, access_token: c.token })
      metrics[metric] = r.data?.[0] || null
    } catch { metrics[metric] = null }
  }
  const media = await collectInstagramMedia(c.igUserId, c.token)
  return { ok: true, source: 'instagram', payload: { account: metrics, media_count: media.length }, rawRows: [{ entity_type: 'instagram_insights', entity_id: c.igUserId, payload: metrics }, ...media] }
}

async function collectInstagramMedia(igUserId, token) {
  const fields = 'id,caption,media_type,media_product_type,timestamp,permalink,like_count,comments_count,media_url,thumbnail_url'
  const rows = []; let next = `/${igUserId}/media`; let params = { fields, limit: 50, access_token: token }
  while (next && rows.length < 50) {
    const page = await metaCall(next, params)
    rows.push(...(page.data || [])); next = page.paging?.next || null; params = { access_token: token }
  }
  return Promise.all(rows.slice(0, 50).map(async item => {
    const metrics = {}
    for (const metric of ['reach', 'impressions', 'saved', 'shares', 'total_interactions', 'plays', 'video_views']) {
      try { const result = await metaCall(`/${item.id}/insights`, { metric, access_token: token }); metrics[metric] = result.data?.[0]?.total_value?.value ?? result.data?.[0]?.values?.[0]?.value ?? null } catch { metrics[metric] = null }
    }
    return { entity_type: 'instagram_media', entity_id: item.id, payload: { id: item.id, caption: item.caption || null, media_type: item.media_type || null, product_type: item.media_product_type || null, timestamp: item.timestamp || null, permalink: item.permalink || null, like_count: item.like_count ?? null, comments_count: item.comments_count ?? null, media_url: item.media_url || null, thumbnail_url: item.thumbnail_url || null, metrics } }
  }))
}

async function pullMetaAds(clientId) {
  const c = await metaToken(clientId)
  if (!c) return { ok: false, error: 'connection_not_found' }
  const accounts = await metaCall('/me/adaccounts', { fields: 'id,name', limit: '100', access_token: c.token })
  const rows = (accounts.data || []).map(a => ({ entity_type: 'ad_account', entity_id: a.id, payload: { id: a.id, name: a.name } }))
  return { ok: true, source: 'meta_ads', payload: { count: rows.length }, rawRows: rows }
}

async function pullYouTube(clientId) {
  const token = await googleToken(clientId)
  if (!token) return { ok: false, error: 'connection_not_found' }
  const data = await googleCall(token, 'https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet,contentDetails&mine=true')
  const ch = data.items?.[0]
  if (!ch) return { ok: true, source: 'youtube', payload: null, rawRows: [] }
  const uploads = ch.contentDetails?.relatedPlaylists?.uploads
  const items = uploads ? await googleCall(token, `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&playlistId=${encodeURIComponent(uploads)}&maxResults=50`) : { items: [] }
  const ids = (items.items || []).map(item => item.contentDetails?.videoId).filter(Boolean)
  const videos = ids.length ? await googleCall(token, `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${ids.join(',')}`) : { items: [] }
  const rawRows = [{ entity_type: 'youtube_channel', entity_id: ch.id, payload: { title: ch.snippet?.title, description: ch.snippet?.description || null, statistics: ch.statistics } }]
  rawRows.push(...(videos.items || []).map(video => ({ entity_type: 'youtube_video', entity_id: video.id, payload: { title: video.snippet?.title || null, description: video.snippet?.description || null, published_at: video.snippet?.publishedAt || null, channel_title: video.snippet?.channelTitle || null, duration: video.contentDetails?.duration || null, statistics: video.statistics || {} } })))
  return { ok: true, source: 'youtube', payload: { channel: ch.statistics || {}, video_count: rawRows.length - 1 }, rawRows }
}

async function pullGoogleAds(clientId) {
  const token = await googleToken(clientId)
  if (!token) return { ok: false, error: 'connection_not_found' }
  const customerId = String(process.env.GOOGLE_ADS_CUSTOMER_ID || '').replace(/[-\s]/g, '')
  const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN
  if (!customerId || !developerToken) return { ok: false, error: 'ads_config_missing' }
  const query = 'SELECT campaign.id, campaign.name, campaign.status, metrics.impressions, metrics.clicks, metrics.cost_micros FROM campaign ORDER BY metrics.impressions DESC'
  const res = await fetch(`https://googleads.googleapis.com/v17/customers/${customerId}/googleAds:searchStream`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${token}`, 'developer-token': developerToken },
    body: JSON.stringify({ query }),
  })
  const data = await res.json().catch(() => [])
  const rows = (data || []).flatMap(c => c.results || []).map(r => ({
    entity_type: 'campaign', entity_id: String(r.campaign?.id || ''),
    payload: { id: r.campaign?.id, name: r.campaign?.name, status: r.campaign?.status, impressions: r.metrics?.impressions, clicks: r.metrics?.clicks, costMicros: r.metrics?.cost_micros },
  }))
  return { ok: true, source: 'google_ads', payload: { count: rows.length }, rawRows: rows }
}

const PULLERS = { instagram: pullInstagram, meta_ads: pullMetaAds, youtube: pullYouTube, google_ads: pullGoogleAds }

export async function runSync(clientId, source) {
  const run = await runStart(clientId, source)
  const puller = PULLERS[source]
  if (!puller) {
    await runEnd(run?.id, { status: 'error', errorCount: 1, lastError: 'source_unknown' })
    return { ok: false, error: 'source_unknown' }
  }
  try {
    const result = await puller(clientId)
    if (!result.ok) {
      await runEnd(run?.id, { status: 'error', errorCount: 1, lastError: result.error })
      return result
    }
    let rawRecords = 0; let normalizedRecords = 0
    for (const row of (result.rawRows || []).slice(0, 500)) {
      await db('data_now_raw', {
        method: 'POST',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({ run_id: run.id, client_id: clientId, source, entity_type: row.entity_type, entity_id: row.entity_id, observed_at: now(), payload: row.payload }),
      }).catch(() => null)
      rawRecords++
      const normalized = normalizeRow(run.id, clientId, source, row)
      if (normalized) {
        try { await db('data_now_normalized', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify(normalized) }); normalizedRecords++ } catch { /* raw permanece disponível para reprocessamento */ }
      }
    }
    await runEnd(run.id, { status: 'success', rawRecords, normalizedRecords, errorCount: 0 })
    return { ok: true, source, rawRecords, normalizedRecords }
  } catch (e) {
    const message = String(e?.message || e)
    await runEnd(run?.id, { status: 'error', errorCount: 1, lastError: message })
    return { ok: false, error: message }
  }
}

function normalizeRow(runId, clientId, source, row) {
  const payload = row.payload || {}
  const statistics = payload.statistics || payload.metrics || payload
  const metrics = {}
  for (const key of ['reach', 'impressions', 'saved', 'shares', 'total_interactions', 'plays', 'video_views', 'like_count', 'comments_count', 'viewCount', 'likeCount', 'commentCount', 'favoriteCount']) if (statistics[key] != null) metrics[key] = Number(statistics[key]) || 0
  if (!Object.keys(metrics).length && row.entity_type !== 'youtube_channel') return null
  const observed = payload.timestamp || payload.published_at || new Date().toISOString()
  return { run_id: runId, schema_version: '1.1', client_id: clientId, source, source_account_id: null, entity_type: row.entity_type, entity_id: String(row.entity_id), period_start: null, period_end: null, observed_at: observed, metrics, raw_ref: `${source}:${row.entity_id}`, metadata: { title: payload.title || null, permalink: payload.permalink || null, media_type: payload.media_type || null, product_type: payload.product_type || null, source_truth: 'api' } }
}
