import crypto from 'node:crypto'
import { db, encrypt, decrypt } from '../_lib/config.js'
import { authorizationUrl, exchange, call } from '../_lib/google.js'
import { authError, requireUser, requireClientAccess } from '../_lib/auth.js'
import { handleCors } from '../_lib/cors.js'

const TARGET_URL = () => process.env.COCKPIT_WEB_URL || 'https://app.mkos.online'

export default async function handler(request, response) {
  if (handleCors(request, response)) return
  const action = String(request.query.action || '').toLowerCase()
  try {
    if (action === 'connect') return await handleConnect(request, response)
    if (action === 'callback') return await handleCallback(request, response)
    if (action === 'status') return await handleStatus(request, response)
    if (action === 'youtube') return await handleYouTube(request, response)
    if (action === 'ads') return await handleAds(request, response)
    return response.status(404).json({ error: 'google_action_not_found' })
  } catch (error) {
    return authError(response, error)
  }
}

async function handleConnect(request, response) {
  const clientId = String(request.query.clientId || '')
  if (!/^[a-z0-9][a-z0-9_-]{1,80}$/i.test(clientId)) return response.status(400).json({ error: 'client_id_invalido' })
  const user = await requireUser(request)
  const state = crypto.randomBytes(32).toString('hex')
  await db('oauth_sessions', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ state, client_id: clientId, user_id: user.id }) })
  const url = authorizationUrl(state)
  if (request.method === 'GET') return response.redirect(302, url)
  return response.status(200).json({ url })
}

async function handleCallback(request, response) {
  const { code, state, error, error_description } = request.query
  if (error) return response.status(400).send(`Autorização não concluída: ${String(error_description || error)}`)
  if (!code || !state) return response.status(400).send('Callback Google incompleto.')
  const sessions = await db(`oauth_sessions?state=eq.${encodeURIComponent(state)}&select=state,client_id,user_id,created_at&limit=1`)
  const session = sessions?.[0]
  if (!session || Date.now() - new Date(session.created_at).getTime() > 10 * 60 * 1000) return response.status(400).send('Sessão OAuth expirada.')
  const token = await exchange(code)
  const bundle = encrypt(JSON.stringify({ accessToken: token.accessToken, refreshToken: token.refreshToken || null, scope: token.scope || null }))
  await db('connections?on_conflict=client_id,source', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({
      client_id: session.client_id,
      source: 'google',
      access_token_encrypted: bundle,
      source_account_id: null,
      username: null,
      expires_at: token.expiresIn ? new Date(Date.now() + token.expiresIn * 1000).toISOString() : null,
      connected_at: new Date().toISOString(),
    }),
  })
  await db(`oauth_sessions?state=eq.${encodeURIComponent(state)}`, { method: 'DELETE', headers: { Prefer: 'return=minimal' } })
  return response.redirect(`${TARGET_URL()}/portal?google=connected&client_id=${encodeURIComponent(session.client_id)}`)
}

async function getToken(clientId) {
  const rows = await db(`connections?client_id=eq.${encodeURIComponent(clientId)}&source=eq.google&select=access_token_encrypted,expires_at&limit=1`)
  const row = rows?.[0]
  if (!row) throw Object.assign(new Error('Cliente sem conexão Google; conectar no portal.'), { statusCode: 409 })
  const bundle = JSON.parse(decrypt(row.access_token_encrypted))
  if (!bundle.accessToken) throw Object.assign(new Error('Token Google inválido.'), { statusCode: 502 })
  return bundle
}

async function handleStatus(request, response) {
  const clientId = String(request.query.clientId || '')
  if (!/^[a-z0-9][a-z0-9_-]{1,80}$/i.test(clientId)) return response.status(400).json({ error: 'client_id_invalido' })
  await requireClientAccess(request, clientId, db)
  const rows = await db(`connections?client_id=eq.${encodeURIComponent(clientId)}&source=eq.google&select=connected_at,expires_at&limit=1`)
  return response.status(200).json({ clientId, connected: Boolean(rows?.[0]), connectedAt: rows?.[0]?.connected_at || null, expiresAt: rows?.[0]?.expires_at || null, sources: ['youtube', 'google_ads'] })
}

async function handleYouTube(request, response) {
  const clientId = String(request.query.clientId || '')
  if (!/^[a-z0-9][a-z0-9_-]{1,80}$/i.test(clientId)) return response.status(400).json({ error: 'client_id_invalido' })
  await requireClientAccess(request, clientId, db)
  const bundle = await getToken(clientId)
  const data = await call(bundle.accessToken, 'https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet,contentDetails&mine=true')
  const channel = data.items?.[0] || null
  if (!channel) return response.status(200).json({ clientId, connected: true, source: 'youtube', channel: null, videos: [] })
  const uploads = channel.contentDetails?.relatedPlaylists?.uploads
  const playlist = uploads ? await call(bundle.accessToken, `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&playlistId=${encodeURIComponent(uploads)}&maxResults=50`) : { items: [] }
  const ids = (playlist.items || []).map(item => item.contentDetails?.videoId).filter(Boolean)
  const videoData = ids.length ? await call(bundle.accessToken, `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${ids.join(',')}`) : { items: [] }
  const videos = (videoData.items || []).map(video => ({ id: video.id, title: video.snippet?.title || null, description: video.snippet?.description || null, publishedAt: video.snippet?.publishedAt || null, duration: video.contentDetails?.duration || null, statistics: video.statistics || {} }))
  return response.status(200).json({ clientId, connected: true, source: 'youtube', channel: { id: channel.id, title: channel.snippet?.title || null, statistics: channel.statistics || null }, videos, collectedAt: new Date().toISOString() })
}

async function handleAds(request, response) {
  const clientId = String(request.query.clientId || '')
  if (!/^[a-z0-9][a-z0-9_-]{1,80}$/i.test(clientId)) return response.status(400).json({ error: 'client_id_invalido' })
  await requireClientAccess(request, clientId, db)
  const bundle = await getToken(clientId)
  const customerId = String(process.env.GOOGLE_ADS_CUSTOMER_ID || '').replace(/[-\s]/g, '')
  const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN
  if (!customerId || !developerToken) {
    return response.status(200).json({ clientId, connected: true, source: 'google_ads', ready: false, note: 'GOOGLE_ADS_CUSTOMER_ID ou developer token ausentes.' })
  }
  const query = 'SELECT campaign.id, campaign.name, campaign.status, metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.ctr, metrics.average_cpc FROM campaign ORDER BY metrics.impressions DESC'
  const api = await fetch(`https://googleads.googleapis.com/v17/customers/${customerId}/googleAds:searchStream`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${bundle.accessToken}`, 'developer-token': developerToken },
    body: JSON.stringify({ query }),
  })
  const text = await api.text()
  let data = []
  try { data = JSON.parse(text) } catch { /* ignore */ }
  if (!api.ok) {
    return response.status(200).json({ clientId, connected: true, source: 'google_ads', ready: false, error: data?.error?.message || data?.error?.status || `Google Ads HTTP ${api.status}`, hint: 'Confira se o developer token foi aprovado para Standard Access e se o customer id está correto.' })
  }
  const rows = (data || []).flatMap(chunk => chunk.results || []).map(r => ({
    id: r.campaign?.id, name: r.campaign?.name, status: r.campaign?.status,
    impressions: r.metrics?.impressions, clicks: r.metrics?.clicks, costMicros: r.metrics?.cost_micros, ctr: r.metrics?.ctr, averageCpc: r.metrics?.average_cpc,
  }))
  return response.status(200).json({ clientId, connected: true, source: 'google_ads', ready: true, customerId, count: rows.length, rows })
}
