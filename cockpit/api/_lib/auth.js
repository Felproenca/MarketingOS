import { required } from './config.js'

export async function requireUser(request) {
  const authorization = request.headers.authorization || ''
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : ''
  if (!token) throw Object.assign(new Error('Autenticação necessária.'), { statusCode: 401 })
  const base = required('SUPABASE_URL').replace(/\/$/, '').replace(/\/rest\/v1$/, '')
  const key = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SECRET_KEY || required('SUPABASE_SERVICE_ROLE_KEY')
  const response = await fetch(`${base}/auth/v1/user`, { headers: { apikey: key, Authorization: `Bearer ${token}` } })
  const body = await response.json().catch(() => ({}))
  if (!response.ok || !body.id) throw Object.assign(new Error('Sessão inválida ou expirada.'), { statusCode: 401 })
  return body
}

export async function requireClientAccess(request, clientId, db) {
  const user = await requireUser(request)
  const adminEmails = String(process.env.ADMIN_EMAILS || '').split(',').map(value => value.trim().toLowerCase()).filter(Boolean)
  if (user.email && adminEmails.includes(user.email.toLowerCase())) return user
  const rows = await db(`client_memberships?client_id=eq.${encodeURIComponent(clientId)}&user_id=eq.${encodeURIComponent(user.id)}&select=client_id&limit=1`)
  if (!rows?.length) throw Object.assign(new Error('Você não tem acesso a este espaço.'), { statusCode: 403 })
  return user
}

export async function requireAdmin(request) {
  const user = await requireUser(request)
  const admins = String(process.env.ADMIN_EMAILS || '').split(',').map(value => value.trim().toLowerCase()).filter(Boolean)
  if (!user.email || !admins.includes(user.email.toLowerCase())) throw Object.assign(new Error('Acesso restrito à equipe MK/OS.'), { statusCode: 403 })
  return user
}

export function authError(response, error) { return response.status(error.statusCode || 500).json({ error: error.message || 'Erro interno.' }) }
