import { db, decrypt } from '../config.js'
import { call } from '../meta.js'
import { publishCarousel } from '../instagram-carousel.js'
import { authError } from '../auth.js'

export function resolveArtifactImageUrls(artifact, version = {}, requested = []) {
  const registered = [
    artifact?.metadata?.preview_url,
    ...(artifact?.metadata?.assets || []).map(item => item?.url),
    ...(artifact?.metadata?.result?.structured?.rendered_urls || []),
    version?.preview_url,
    ...(version?.manifest?.rendered_urls || []),
  ].filter(Boolean)
  const publishUrls = requested.length ? requested : registered
  return { registered, publishUrls }
}

export async function publishApprovedArtifact({ clientId, artifactId, imageUrls, caption = '' }) {
  const rows = await db(`artifacts?id=eq.${encodeURIComponent(artifactId)}&client_id=eq.${encodeURIComponent(clientId)}&select=id,status,metadata&limit=1`)
  const artifact = rows?.[0]
  if (!artifact) throw Object.assign(new Error('Artifact nao encontrado para este cliente.'), { statusCode: 404 })
  if (artifact.status !== 'approved') throw Object.assign(new Error(`Publicacao bloqueada: artifact esta em status ${artifact.status}; exige approved.`), { statusCode: 409 })
  const versions = await db(`artifact_versions?artifact_id=eq.${encodeURIComponent(artifactId)}&version=eq.${encodeURIComponent(artifact.current_version)}&select=preview_url,manifest&limit=1`).catch(() => [])
  const version = versions?.[0]
  const { registered: registeredUrls, publishUrls } = resolveArtifactImageUrls(artifact, version, imageUrls)
  if (!publishUrls.length) throw Object.assign(new Error('image_urls_obrigatorias'), { statusCode: 400 })
  if (registeredUrls.length && publishUrls.some(url => !registeredUrls.includes(url))) throw Object.assign(new Error('Publicacao bloqueada: imagem nao pertence ao artifact aprovado.'), { statusCode: 409 })
  const connections = await db(`connections?client_id=eq.${encodeURIComponent(clientId)}&source=eq.meta&select=source_account_id,access_token_encrypted,expires_at&limit=1`)
  const connection = connections?.[0]
  if (!connection) throw Object.assign(new Error('Cliente sem conexao Meta; conectar no portal.'), { statusCode: 409 })
  if (connection.expires_at && new Date(connection.expires_at).getTime() <= Date.now()) throw Object.assign(new Error('Token Meta expirado; reconectar no portal.'), { statusCode: 409 })
  const result = await publishCarousel({ accessToken: decrypt(connection.access_token_encrypted), igUserId: connection.source_account_id, imageUrls: publishUrls, caption, call })
  await db(`artifacts?id=eq.${encodeURIComponent(artifactId)}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ metadata: { ...(artifact.metadata || {}), publication: { platform: 'instagram', platform_post_id: result.platformPostId, published_at: new Date().toISOString() } }, updated_at: new Date().toISOString() }) })
  return { clientId, artifactId, ...result, visibility: 'public' }
}

export default async function handler(request, response) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'method_not_allowed' })
  try {
    const secret = String(process.env.FLUX_PUBLISH_SECRET || '').trim()
    if (!secret) throw Object.assign(new Error('Publicador Meta nao configurado: FLUX_PUBLISH_SECRET ausente.'), { statusCode: 503 })
    if (request.headers['x-flux-secret'] !== secret) throw Object.assign(new Error('Segredo de servico invalido.'), { statusCode: 401 })
    const body = request.body || {}
    const clientId = String(body.clientId || '').trim()
    const artifactId = String(body.artifactId || body.artifact_id || '').trim()
    const imageUrls = Array.isArray(body.imageUrls) ? body.imageUrls.map(String).filter(Boolean) : []
    if (!/^[a-z0-9][a-z0-9_-]{1,80}$/i.test(clientId)) return response.status(400).json({ error: 'client_id_invalido' })
    if (!artifactId) return response.status(400).json({ error: 'artifact_id_obrigatorio' })
    return response.status(200).json(await publishApprovedArtifact({ clientId, artifactId, imageUrls, caption: String(body.caption || '') }))
  } catch (error) { return authError(response, error) }
}
