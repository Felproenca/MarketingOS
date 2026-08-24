import crypto from 'node:crypto'
import { db, encrypt, required } from './config.js'
import { authError, requireClientAccess } from './auth.js'

const PROVIDERS = new Set(['anthropic', 'openai', 'deepseek', 'qwen', 'fal', 'kie', 'canva', 'meta', 'local'])
const MODES = new Set(['oauth_subscription', 'api_key_customer', 'subscription_assisted', 'local', 'platform_api'])
const MIME_EXT = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' }

export async function connections(request, response) {
  try {
    const clientId = String(request.query.clientId || request.body?.clientId || '').trim().toLowerCase()
    if (!clientId) return response.status(400).json({ error: 'client_id_obrigatorio' })
    await requireClientAccess(request, clientId, db)
    if (request.method === 'GET') {
      const rows = await db(`provider_connections?client_id=eq.${encodeURIComponent(clientId)}&select=id,client_id,provider,connection_type,capabilities,execution_mode,scopes,status,billing_owner,monthly_budget,monthly_spend,last_validated_at,created_at,updated_at&order=updated_at.desc`)
      return response.status(200).json({ connections: rows || [] })
    }
    if (request.method !== 'POST') return response.status(405).json({ error: 'method_not_allowed' })
    const body = request.body || {}; const provider = String(body.provider || '').trim().toLowerCase(); const mode = String(body.executionMode || body.execution_mode || 'api_key_customer')
    if (!PROVIDERS.has(provider)) return response.status(400).json({ error: 'provider_invalido' })
    if (!MODES.has(mode)) return response.status(400).json({ error: 'execution_mode_invalido' })
    if (mode === 'api_key_customer' && !body.secret) return response.status(400).json({ error: 'secret_obrigatorio' })
    const secretRef = body.secret
      ? encrypt(String(body.secret))
      : mode === 'platform_api'
        ? `platform:${provider}`
        : `oauth:${crypto.randomUUID()}`
    const rows = await db('provider_connections?on_conflict=client_id,provider,connection_type', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=representation' }, body: JSON.stringify({ client_id: clientId, provider, connection_type: mode, secret_ref: secretRef, capabilities: Array.isArray(body.capabilities) ? body.capabilities : [], execution_mode: mode, scopes: Array.isArray(body.scopes) ? body.scopes : [], billing_owner: 'customer', metadata: { default_model: body.model || null, base_url: body.baseUrl || null, endpoint: body.endpoint || null }, status: 'active', updated_at: new Date().toISOString() }) })
    return response.status(201).json({ connection: sanitize(rows?.[0]) })
  } catch (error) { return authError(response, error) }
}

export async function upload(request, response) {
  try {
    if (request.method !== 'POST') return response.status(405).json({ error: 'method_not_allowed' })
    const body = request.body || {}; const clientId = String(body.clientId || '').trim().toLowerCase(); const jobId = String(body.jobId || body.job_id || '').trim(); const contentType = String(body.contentType || body.content_type || '').toLowerCase(); const data = String(body.dataBase64 || body.data_base64 || '').replace(/^data:[^;]+;base64,/, '')
    if (!clientId || !jobId || !MIME_EXT[contentType] || !data) return response.status(400).json({ error: 'client_id, job_id, content_type e arquivo são obrigatórios' })
    await requireClientAccess(request, clientId, db)
    const jobs = await db(`media_jobs?id=eq.${encodeURIComponent(jobId)}&client_id=eq.${encodeURIComponent(clientId)}&select=id,job_type,status,input&limit=1`); const job = jobs?.[0]
    if (!job) return response.status(404).json({ error: 'job_not_found' })
    if (!['queued', 'routed', 'running', 'blocked', 'error', 'review'].includes(job.status)) return response.status(409).json({ error: 'job_not_ready_for_external_upload', status: job.status })
    const buffer = Buffer.from(data, 'base64'); if (buffer.length > 25 * 1024 * 1024) return response.status(413).json({ error: 'file_too_large', maxBytes: 25 * 1024 * 1024 })
    const bucket = process.env.MEDIAOS_STORAGE_BUCKET || 'media'; const fileName = `external-${crypto.randomUUID()}.${MIME_EXT[contentType]}`; const storagePath = `artifacts/${clientId}/${jobId}/v1/${fileName}`; const base = required('SUPABASE_URL').replace(/\/$/, '').replace(/\/rest\/v1$/, ''); const key = process.env.SUPABASE_SECRET_KEY || required('SUPABASE_SERVICE_ROLE_KEY')
    const stored = await fetch(`${base}/storage/v1/object/${encodeURIComponent(bucket)}/${storagePath.split('/').map(encodeURIComponent).join('/')}`, { method: 'POST', headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': contentType, 'x-upsert': 'true' }, body: buffer }); if (!stored.ok) throw new Error(`Storage ${stored.status}`)
    const previewUrl = `${base}/storage/v1/object/public/${bucket}/${storagePath}`
    const externalAsset = { kind: 'image', url: previewUrl, fileName: String(body.fileName || '').slice(0, 180), uploadedAt: new Date().toISOString() }
    if (['queued', 'routed', 'running'].includes(job.status)) {
      const input = job.input && typeof job.input === 'object' ? job.input : {}
      await db(`media_jobs?id=eq.${encodeURIComponent(jobId)}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ input: { ...input, external_assets: [...(Array.isArray(input.external_assets) ? input.external_assets : []), externalAsset] }, updated_at: new Date().toISOString() }) })
      return response.status(201).json({ ok: true, jobId, previewUrl, attachedToInput: true })
    }
    const artifacts = await db(`artifacts?job_id=eq.${encodeURIComponent(jobId)}&select=id&limit=1`); const artifact = artifacts?.[0] ? (await db(`artifacts?id=eq.${encodeURIComponent(artifacts[0].id)}`, { method: 'PATCH', headers: { Prefer: 'return=representation' }, body: JSON.stringify({ status: 'review', current_version: 1, metadata: { preview_url: previewUrl, source: 'external_upload', assets: [externalAsset] }, updated_at: new Date().toISOString() }) }))?.[0] : (await db('artifacts', { method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify({ client_id: clientId, job_id: jobId, artifact_type: 'image', title: body.title || 'Imagem enviada externamente', status: 'review', current_version: 1, metadata: { preview_url: previewUrl, source: 'external_upload', assets: [externalAsset] } }) }))?.[0]
    if (!artifact?.id) throw new Error('artifact_upload_not_created')
    await db('artifact_versions', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ artifact_id: artifact.id, version: 1, kind: 'image', storage_path: storagePath, preview_url: previewUrl, manifest: { source: 'external_upload', original_name: String(body.fileName || '').slice(0, 180) }, qa: { status: 'passed', checks: ['mime_validated', 'size_validated', 'uploaded'] } }) })
    await db(`media_jobs?id=eq.${encodeURIComponent(jobId)}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ status: 'review', result: { artifact_id: artifact.id, assets: [{ kind: 'image', url: previewUrl }], source: 'external_upload' }, error: null, completed_at: new Date().toISOString(), updated_at: new Date().toISOString() }) })
    return response.status(201).json({ ok: true, artifact, previewUrl, jobId })
  } catch (error) { return authError(response, error) }
}

function sanitize(row) { if (!row) return null; const { secret_ref, ...safe } = row; return safe }
