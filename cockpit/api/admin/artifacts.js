import { db } from '../_lib/config.js'
import { authError, requireAdmin, requireClientAccess, requireUser } from '../_lib/auth.js'
import { publishApprovedArtifact } from '../_lib/meta-handlers/publish.js'
import { handleCors } from '../_lib/cors.js'

const DECISIONS = new Set(['approved', 'rejected', 'changes_requested'])

export default async function handler(request, response) {
  if (handleCors(request, response)) return
  try {
    if (request.method === 'GET') {
      const user = await requireAdmin(request)
      const status = String(request.query?.status || '').trim()
      const filter = status ? `&status=eq.${encodeURIComponent(status)}` : ''
      const artifacts = await db(`artifacts?select=*&order=updated_at.desc&limit=100${filter}`)
      return response.status(200).json({ artifacts: artifacts || [] })
    }
    if (request.method === 'POST' && request.body?.action === 'publish') {
      await requireAdmin(request)
      const id = String(request.body.artifactId || request.body.artifact_id || '').trim()
      if (!id) return response.status(400).json({ error: 'artifact_id_obrigatorio' })
      const rows = await db(`artifacts?id=eq.${encodeURIComponent(id)}&select=id,client_id,metadata&limit=1`)
      const artifact = rows?.[0]
      if (!artifact) return response.status(404).json({ error: 'Artifact nao encontrado.' })
      const imageUrls = Array.isArray(request.body.imageUrls) ? request.body.imageUrls.map(String).filter(Boolean) : [artifact.metadata?.preview_url, ...(artifact.metadata?.assets || []).map(item => item?.url)].filter(Boolean)
      return response.status(200).json(await publishApprovedArtifact({ clientId: artifact.client_id, artifactId: id, imageUrls, caption: String(request.body.caption || artifact.metadata?.caption || '') }))
    }
    if (request.method !== 'POST' && request.method !== 'PATCH') return response.status(405).json({ error: 'method_not_allowed' })
    const user = await requireUser(request)
    const body = request.body || {}
    const artifactId = String(body.artifactId || body.artifact_id || '').trim()
    const decision = String(body.decision || '').trim()
    if (!artifactId || !DECISIONS.has(decision)) return response.status(400).json({ error: 'artifactId e decision valido sao obrigatorios.' })
    const artifacts = await db(`artifacts?id=eq.${encodeURIComponent(artifactId)}&select=*&limit=1`)
    const artifact = artifacts?.[0]
    if (!artifact) return response.status(404).json({ error: 'Artifact nao encontrado.' })
    const adminEmails = String(process.env.ADMIN_EMAILS || '').split(',').map(value => value.trim().toLowerCase()).filter(Boolean)
    const isAdmin = Boolean(user.email && adminEmails.includes(user.email.toLowerCase()))
    if (!isAdmin) await requireClientAccess(request, artifact.client_id, db)
    if (!isAdmin && decision === 'rejected') return response.status(403).json({ error: 'Cliente pode aprovar ou solicitar ajustes; rejeicao final e uma acao do operador.' })
    const versions = await db(`artifact_versions?artifact_id=eq.${encodeURIComponent(artifactId)}&version=eq.${encodeURIComponent(artifact.current_version)}&select=*&limit=1`)
    const version = versions?.[0]
    if (!version) return response.status(409).json({ error: 'Versao corrente do artifact nao encontrada.' })
    if (decision === 'approved' && version.qa?.status !== 'passed') return response.status(422).json({ error: 'Artifact bloqueado: QA ainda nao esta passed.', qa: version.qa })
    const nextStatus = decision === 'approved' ? 'approved' : decision === 'rejected' ? 'rejected' : 'changes_requested'
    if (artifact.status === nextStatus) return response.status(200).json({ artifact, decision, idempotent: true })
    if (artifact.status !== 'review') return response.status(409).json({ error: 'artifact_version_review_required', message: 'A versao precisa voltar para review depois que um ajuste for solicitado. Gere uma nova versao antes de aprovar novamente.' })
    const actorRole = isAdmin ? 'operator' : 'client'
    await db('artifact_approvals', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ artifact_id: artifactId, version: artifact.current_version, actor_id: user.id, actor_role: actorRole, decision, feedback: body.feedback || null }) })
    const updated = await db(`artifacts?id=eq.${encodeURIComponent(artifactId)}`, { method: 'PATCH', headers: { Prefer: 'return=representation' }, body: JSON.stringify({ status: nextStatus, updated_at: new Date().toISOString() }) })
    let requestId = null
    if (artifact.job_id) {
      const jobs = await db(`media_jobs?id=eq.${encodeURIComponent(artifact.job_id)}&select=id,request_id&limit=1`)
      requestId = jobs?.[0]?.request_id || null
      await db(`media_jobs?id=eq.${encodeURIComponent(artifact.job_id)}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ status: nextStatus === 'approved' ? 'approved' : 'review', updated_at: new Date().toISOString() }) })
    }
    if (requestId) {
      const requestStatus = nextStatus === 'approved' ? 'approved' : nextStatus === 'rejected' ? 'blocked' : 'review'
      const requestRows = await db(`work_requests?id=eq.${encodeURIComponent(requestId)}&select=id,payload&limit=1`)
      const payload = requestRows?.[0]?.payload || {}
      await db(`work_requests?id=eq.${encodeURIComponent(requestId)}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ status: requestStatus, updated_at: new Date().toISOString(), payload: { ...payload, approval_status: nextStatus, approval_feedback: body.feedback || null, artifact_id: artifactId } }) })
      await db('work_request_events', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ request_id: requestId, event_type: `artifact_${decision}`, from_status: 'review', to_status: requestStatus, message: body.feedback || `Artifact ${decision}.`, metadata: { artifact_id: artifactId, version: artifact.current_version, actor_role: actorRole } }) }).catch(() => null)
    }
    await db('audit_events', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ client_id: artifact.client_id, actor_id: user.id, actor_role: actorRole, event_type: `artifact_${decision}`, resource_type: 'artifact', resource_id: artifactId, metadata: { version: artifact.current_version, feedback: body.feedback || null } }) }).catch(() => null)
    let publication = null
    const publishOnApproval = decision === 'approved' && ['carousel', 'post', 'image'].includes(String(artifact.artifact_type || '').toLowerCase())
    const imageUrls = [version.preview_url, artifact.metadata?.preview_url, ...(artifact.metadata?.assets || []).map(item => item?.url)].filter(Boolean)
    if (publishOnApproval && imageUrls.length) {
      try {
        publication = await publishApprovedArtifact({ clientId: artifact.client_id, artifactId, imageUrls, caption: String(artifact.metadata?.caption || '') })
      } catch (error) {
        publication = { status: 'failed', error: error.message || 'publication_failed' }
        await db(`artifacts?id=eq.${encodeURIComponent(artifactId)}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ metadata: { ...(artifact.metadata || {}), publication: { status: 'failed', error: error.message || 'publication_failed', failed_at: new Date().toISOString() } }, updated_at: new Date().toISOString() }) }).catch(() => null)
      }
    }
    return response.status(200).json({ artifact: updated?.[0] || null, decision, publication })
  } catch (error) { return authError(response, error) }
}
