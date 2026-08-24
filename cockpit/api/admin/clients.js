import { db } from '../_lib/config.js'
import { authError, requireAdmin, requireUser } from '../_lib/auth.js'
import { handleCors } from '../_lib/cors.js'

function parseList(value) {
  if (Array.isArray(value)) return value.filter(Boolean)
  return String(value || '').split('\n').map(item => item.trim()).filter(Boolean)
}

export default async function handler(request, response) {
  if (handleCors(request, response)) return
  if (!['GET', 'POST', 'PUT'].includes(request.method)) return response.status(405).json({ error: 'method_not_allowed' })
  try {
    const user = await requireUser(request)
    if (String(request.query.action || '') === 'reference') return handleReference(request, response, user)
    const admins = String(process.env.ADMIN_EMAILS || '').split(',').map(value => value.trim().toLowerCase()).filter(Boolean)
    const isAdmin = Boolean(user.email && admins.includes(user.email.toLowerCase()))
    if (request.method === 'POST') {
      if (!isAdmin) return response.status(403).json({ error: 'Acesso restrito à equipe MK/OS.' })
      return createClient(request, response)
    }
    if (request.method === 'PUT') {
      if (!isAdmin) return response.status(403).json({ error: 'Acesso restrito.' })
      return updateClient(request, response)
    }
    const memberships = isAdmin ? null : await db(`client_memberships?user_id=eq.${encodeURIComponent(user.id)}&select=client_id,role,created_at`)
    const membershipFilter = memberships?.length ? `&client_id=in.(${memberships.map(row => encodeURIComponent(row.client_id)).join(',')})` : '&client_id=eq.__none__'
    const clients = await db(`client_profiles?select=client_id,display_name,company_name,status,created_at,updated_at&order=updated_at.desc${isAdmin ? '' : membershipFilter}`)
    const connections = await db('connections?select=client_id,source,source_account_id,username,expires_at,connected_at,updated_at&order=updated_at.desc')
    const aiConnections = await db(`provider_connections?select=client_id,provider,connection_type,status,scopes,billing_owner,updated_at&order=updated_at.desc${isAdmin ? '' : membershipFilter}`)
    const references = await db('client_references?select=client_id,brand_profile,voice_profile,offers,constraints,approved_examples,updated_at')
    const quotas = await db(`client_quotas?select=client_id,plan,monthly_token_quota,used_tokens,plan_value_brl,max_monthly_cost_brl,used_cost_brl,reset_at${isAdmin ? '' : membershipFilter}`)
    const allMemberships = isAdmin ? await db('client_memberships?select=client_id,user_id,role,created_at') : memberships
    const known = new Map((clients || []).map(client => [client.client_id, client]))
    for (const connection of connections || []) if (!known.has(connection.client_id)) known.set(connection.client_id, { client_id: connection.client_id, display_name: connection.username || connection.client_id, company_name: null, status: 'active', created_at: connection.connected_at, updated_at: connection.updated_at || connection.connected_at })
    const output = [...known.values()].map(client => {
      const reference = (references || []).find(row => row.client_id === client.client_id)
      const quota = (quotas || []).find(row => row.client_id === client.client_id)
      const setup = { reference: Boolean(reference), referenceReady: Boolean(reference?.brand_profile?.positioning && reference?.brand_profile?.audience && reference?.brand_profile?.visual_direction && reference?.voice_profile?.tone && reference?.offers?.length && reference?.constraints?.length), quota: Boolean(quota), connections: (connections || []).filter(row => row.client_id === client.client_id).length }
      return { ...client, setup, quota, sources: (connections || []).filter(row => row.client_id === client.client_id).map(row => ({ source: row.source, accountId: row.source_account_id, username: row.username, expiresAt: row.expires_at, connectedAt: row.connected_at, updatedAt: row.updated_at })), aiConnections: (aiConnections || []).filter(row => row.client_id === client.client_id).map(row => ({ provider: row.provider, connectionType: row.connection_type, status: row.status, scopes: row.scopes || [], billingOwner: row.billing_owner, updatedAt: row.updated_at })), members: (allMemberships || []).filter(row => row.client_id === client.client_id).length, role: (memberships || []).find(row => row.client_id === client.client_id)?.role || (isAdmin ? 'operator' : 'viewer') }
    })
    return response.status(200).json({ clients: output, isAdmin })
  } catch (error) { return authError(response, error) }
}

async function handleReference(request, response, user) {
  const clientId = String(request.query.clientId || '').trim().toLowerCase()
  if (!clientId) return response.status(400).json({ error: 'client_id ausente.' })
  const admins = String(process.env.ADMIN_EMAILS || '').split(',').map(value => value.trim().toLowerCase()).filter(Boolean)
  const isAdmin = Boolean(user.email && admins.includes(user.email.toLowerCase()))
  if (!isAdmin) {
    const membership = await db(`client_memberships?client_id=eq.${encodeURIComponent(clientId)}&user_id=eq.${encodeURIComponent(user.id)}&select=client_id&limit=1`)
    if (!membership?.[0]) return response.status(403).json({ error: 'Sem acesso a este cliente.' })
  }
  if (request.method === 'GET') {
    const rows = await db(`client_references?client_id=eq.${encodeURIComponent(clientId)}&select=*&limit=1`)
    return response.status(200).json({ reference: rows?.[0] || null })
  }
  const body = request.body || {}
  const payload = {
    client_id: clientId,
    brand_profile: { positioning: String(body.positioning || '').trim(), audience: String(body.audience || '').trim(), visual_direction: String(body.visualDirection || '').trim() },
    voice_profile: { tone: String(body.tone || '').trim(), vocabulary: parseList(body.vocabulary) },
    offers: parseList(body.offers),
    constraints: parseList(body.constraints),
    approved_examples: parseList(body.approvedExamples),
    notes: String(body.notes || '').trim() || null,
    updated_at: new Date().toISOString(),
  }
  const rows = await db('client_references?on_conflict=client_id', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=representation' }, body: JSON.stringify(payload) })
  return response.status(200).json({ reference: rows?.[0] || null })
}

async function createClient(request, response) {
  const body = request.body || {}
  const clientId = String(body.clientId || '').trim().toLowerCase()
  const displayName = String(body.displayName || '').trim()
  const companyName = String(body.companyName || '').trim() || null
  const email = String(body.email || '').trim().toLowerCase()
  if (!/^[a-z0-9][a-z0-9_-]{1,80}$/.test(clientId) || !displayName) return response.status(400).json({ error: 'Informe client_id e nome do cliente.' })
  const reference = referencePayload(body)
  const referenceReady = Boolean(reference.brand_profile.positioning && reference.brand_profile.audience && reference.brand_profile.visual_direction && reference.voice_profile.tone && reference.offers.length && reference.constraints.length)
  await db('client_profiles?on_conflict=client_id', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify({ client_id: clientId, display_name: displayName, company_name: companyName, status: referenceReady ? 'active' : 'onboarding', updated_at: new Date().toISOString() }) })
  await db('client_references?on_conflict=client_id', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify({ client_id: clientId, ...reference, updated_at: new Date().toISOString() }) })
  await db('client_quotas?on_conflict=client_id', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify({ client_id: clientId, plan: body.plan || 'basico', monthly_token_quota: Number(body.monthlyTokenQuota || 100000), reset_at: new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth() + 1, 1)).toISOString() }) })
  await db('ai_client_policies?on_conflict=client_id', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify({ client_id: clientId, mode: body.aiMode || 'balanced', require_approval: body.requireApproval !== false, allow_external_fallback: body.allowExternalFallback !== false }) })
  let invitation = null
  if (email) {
    const base = process.env.SUPABASE_URL.replace(/\/$/, '').replace(/\/rest\/v1$/, '')
    const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!key) throw new Error('SUPABASE_SECRET_KEY ausente para enviar convite.')
    const inviteResponse = await fetch(`${base}/auth/v1/admin/invite`, { method: 'POST', headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ email, redirect_to: `${process.env.CLIENT_PORTAL_URL || 'https://marketingos-frontend.vercel.app'}/login/cliente?slug=${encodeURIComponent(clientId)}`, data: { client_id: clientId, display_name: displayName } }) })
    const inviteBody = await inviteResponse.json().catch(() => ({}))
    if (!inviteResponse.ok) throw new Error(inviteBody.msg || inviteBody.message || 'Não foi possível enviar o convite.')
    invitation = { email, sent: true }
    if (inviteBody.id) await db('client_memberships?on_conflict=client_id,user_id', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify({ client_id: clientId, user_id: inviteBody.id, role: 'owner' }) })
  }
  return response.status(201).json({ clientId, displayName, status: referenceReady ? 'active' : 'onboarding', referenceReady, invitation })
}

async function updateClient(request, response) {
  const body = request.body || {}
  const clientId = String(body.clientId || body.client_id || '').trim().toLowerCase()
  if (!clientId) return response.status(400).json({ error: 'Informe client_id.' })
  const current = await db(`client_profiles?client_id=eq.${encodeURIComponent(clientId)}&select=client_id,display_name,company_name,status&limit=1`)
  if (!current?.[0]) return response.status(404).json({ error: 'Cliente nao encontrado.' })
  const reference = referencePayload(body)
  const referenceReady = Boolean(reference.brand_profile.positioning && reference.brand_profile.audience && reference.brand_profile.visual_direction && reference.voice_profile.tone && reference.offers.length && reference.constraints.length)
  const profile = (await db(`client_profiles?client_id=eq.${encodeURIComponent(clientId)}`, { method: 'PATCH', headers: { Prefer: 'return=representation' }, body: JSON.stringify({ display_name: String(body.displayName || current[0].display_name).trim(), company_name: String(body.companyName || current[0].company_name || '').trim() || null, status: referenceReady ? 'active' : 'onboarding', updated_at: new Date().toISOString() }) }))?.[0]
  await db('client_references?on_conflict=client_id', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify({ client_id: clientId, ...reference, updated_at: new Date().toISOString() }) })
  return response.status(200).json({ client: profile || { ...current[0], status: referenceReady ? 'active' : 'onboarding' }, referenceReady })
}

function referencePayload(body) {
  return {
    brand_profile: { positioning: String(body.positioning || '').trim(), audience: String(body.audience || '').trim(), visual_direction: String(body.visualDirection || '').trim() },
    voice_profile: { tone: String(body.tone || '').trim(), vocabulary: parseList(body.vocabulary) },
    offers: parseList(body.offers),
    constraints: parseList(body.constraints),
    approved_examples: parseList(body.approvedExamples),
    notes: String(body.notes || '').trim() || null,
  }
}
