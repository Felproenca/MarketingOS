import { requireUser, authError } from '../_lib/auth.js'
import { db } from '../_lib/config.js'
import { clientReport } from '../_lib/reporting.js'
import { createMission } from '../_lib/intake.js'
import { handleCors } from '../_lib/cors.js'

// Previsão por média: média dos últimos registros por fonte (expectativa do próximo período)
function computeForecast(metrics) {
  const bySource = {}
  for (const m of metrics || []) {
    const src = m.source || 'geral'
    if (!bySource[src]) bySource[src] = []
    bySource[src].push(m.metrics || {})
  }
  const out = {}
  for (const [src, items] of Object.entries(bySource)) {
    const latest = items.slice(0, 4)
    const keys = new Set()
    for (const item of latest) for (const k of Object.keys(item)) keys.add(k)
    const avg = {}
    for (const k of keys) {
      const values = latest.map(i => Number(i[k])).filter(v => Number.isFinite(v))
      avg[k] = values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : null
    }
    out[src] = avg
  }
  return out
}

function computeAcquisitionInsights(rows) {
  const instagram = (rows || []).filter(row => row.source === 'instagram' && row.entity_type === 'instagram_media')
  const youtube = (rows || []).filter(row => row.source === 'youtube' && row.entity_type === 'youtube_video')
  const rank = (items, key) => [...items].sort((a, b) => Number(b.metrics?.[key] || 0) - Number(a.metrics?.[key] || 0))[0] || null
  const topInstagram = rank(instagram, 'reach') || rank(instagram, 'total_interactions')
  const topYoutube = rank(youtube, 'viewCount') || rank(youtube, 'likeCount')
  const formatCounts = instagram.reduce((acc, row) => { const format = row.metadata?.product_type || row.metadata?.media_type || 'unknown'; acc[format] = (acc[format] || 0) + 1; return acc }, {})
  return {
    generated_at: new Date().toISOString(),
    truth_rule: 'Derivado somente de data_now_normalized; sem amostra, não há conclusão.',
    instagram: { records: instagram.length, top_content: topInstagram ? { entity_id: topInstagram.entity_id, permalink: topInstagram.metadata?.permalink || null, format: topInstagram.metadata?.product_type || topInstagram.metadata?.media_type || null, reach: topInstagram.metrics?.reach ?? null, interactions: topInstagram.metrics?.total_interactions ?? null, saves: topInstagram.metrics?.saved ?? null } : null, formats: formatCounts, confidence: instagram.length >= 5 ? 'medium' : instagram.length ? 'low' : 'none' },
    youtube: { records: youtube.length, top_video: topYoutube ? { entity_id: topYoutube.entity_id, title: topYoutube.metadata?.title || null, views: topYoutube.metrics?.viewCount ?? null, likes: topYoutube.metrics?.likeCount ?? null, comments: topYoutube.metrics?.commentCount ?? null } : null, confidence: youtube.length >= 5 ? 'medium' : youtube.length ? 'low' : 'none' },
    evidence: [...instagram.slice(0, 10), ...youtube.slice(0, 10)].map(row => ({ source: row.source, entity_type: row.entity_type, entity_id: row.entity_id, observed_at: row.observed_at })),
  }
}

export default async function handler(request, response) {
  if (handleCors(request, response)) return
  try {
    const user = await requireUser(request)
    const slug = String(request.query.slug || '').trim().toLowerCase()
    if (!slug) return response.status(400).json({ error: 'slug_obrigatorio' })

    // O usuário precisa ser membro do cliente (isolamento entre clientes)
    const membership = await db(`client_memberships?client_id=eq.${encodeURIComponent(slug)}&user_id=eq.${encodeURIComponent(user.id)}&select=client_id,role&limit=1`).catch(() => [])
    if (!membership?.[0]) return response.status(403).json({ error: 'sem_acesso_a_este_cliente' })

    if (request.method === 'POST') {
      const body = request.body || {}
      const result = await createMission({ body: { ...body, clientId: slug, title: body.title || 'Solicitação do cliente', requestType: body.requestType || 'strategy' }, user })
      return response.status(201).json(result)
    }
    if (request.method !== 'GET') return response.status(405).json({ error: 'method_not_allowed' })

    const report = await clientReport(slug)

    const jobs = (await db(`media_jobs?client_id=eq.${encodeURIComponent(slug)}&status=in.(queued,routed,review,running)&select=id,job_type,capability,status,title,created_at&order=created_at.desc&limit=20`).catch(() => [])) || []
    const metrics = (await db(`data_now_normalized?client_id=eq.${encodeURIComponent(slug)}&select=source,entity_type,entity_id,metrics,metadata,observed_at&order=observed_at.desc&limit=200`).catch(() => [])) || []
    const artifacts = (await db(`artifacts?client_id=eq.${encodeURIComponent(slug)}&select=id,artifact_type,title,status,metadata,created_at&order=created_at.desc&limit=50`).catch(() => [])) || []
    const connections = (await db(`connections?client_id=eq.${encodeURIComponent(slug)}&select=source,username,connected_at,expires_at&order=source.asc`).catch(() => [])) || []

    return response.status(200).json({
      ...report,
      proximos_passos: (jobs || []).map(j => ({ tipo: 'missao', titulo: j.title || j.job_type, capability: j.capability, status: j.status, criado_em: j.created_at })),
      resultados_reais: (artifacts || []).map(a => ({ id: a.id, tipo: a.artifact_type, titulo: a.title, status: a.status, preview_url: a.metadata?.preview_url || null, publication: a.metadata?.publication || null, criado_em: a.created_at })),
      metricas: metrics || [],
      previsao: computeForecast(metrics),
      insights_aquisicao: computeAcquisitionInsights(metrics),
      connections: (connections || []).map(connection => ({ source: connection.source, username: connection.username || null, connected: true, connectedAt: connection.connected_at || null, expiresAt: connection.expires_at || null })),
    })
  } catch (error) {
    return authError(response, error)
  }
}
