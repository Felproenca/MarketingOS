const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
const SESSION_KEY = 'mkos.auth.session'

export type AuthUser = { id: string; email?: string }
export type AuthSession = { access_token: string; refresh_token: string; expires_at?: number; user: AuthUser }

function assertConfig() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) throw new Error('Login ainda não configurado. Adicione VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY na Vercel.')
}

export function getSession(): AuthSession | null {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null') } catch { return null }
}

export function saveSession(session: AuthSession | null) {
  if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  else localStorage.removeItem(SESSION_KEY)
}

export async function signIn(email: string, password: string) {
  assertConfig()
  const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, { method: 'POST', headers: { apikey: SUPABASE_ANON_KEY, 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })
  const body = await response.json()
  if (!response.ok) throw new Error(body.error_description || body.msg || 'E-mail ou senha inválidos.')
  const session = { ...body, user: body.user || { email } }
  saveSession(session)
  return session as AuthSession
}

export async function sendMagicLink(email: string, redirectTo = '/login') {
  assertConfig()
  const response = await fetch(`${SUPABASE_URL}/auth/v1/otp`, { method: 'POST', headers: { apikey: SUPABASE_ANON_KEY, 'Content-Type': 'application/json' }, body: JSON.stringify({ email, create_user: false, options: { email_redirect_to: `${window.location.origin}${redirectTo}` } }) })
  if (!response.ok) { const body = await response.json().catch(() => ({})); throw new Error(body.msg || 'Não foi possível enviar o link.') }
}

export async function signOut() { saveSession(null) }

/** Resolve a área do usuário logado: operador → /operacao; membro de cliente → /dados/<slug>. */
export async function resolveHome(): Promise<string> {
  const response = await apiFetch('/api/admin/clients')
  const body = await response.json().catch(() => ({}) as Record<string, unknown>)
  if (!response.ok) throw new Error((body?.error as string) || 'Não foi possível identificar o espaço desta conta.')
  const isAdmin = Boolean((body as { isAdmin?: boolean }).isAdmin)
  if (isAdmin) return '/operacao'
  const clients = (body as { clients?: { client_id: string }[] }).clients || []
  const slug = clients[0]?.client_id
  if (!slug) throw new Error('Nenhum cliente associado a esta conta.')
  return `/dados/${encodeURIComponent(slug)}`
}

export async function restoreSessionFromUrl() {
  assertConfig()
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''))
  const accessToken = hash.get('access_token')
  const refreshToken = hash.get('refresh_token')
  if (!accessToken || !refreshToken) return null
  const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${accessToken}` } })
  const user = await response.json().catch(() => ({}))
  if (!response.ok || !user.id) throw new Error('Link de acesso inválido ou expirado.')
  const session: AuthSession = { access_token: accessToken, refresh_token: refreshToken, expires_at: Number(hash.get('expires_at') || 0) || undefined, user }
  saveSession(session)
  window.history.replaceState({}, document.title, `${window.location.pathname}${window.location.search}`)
  return session
}

async function refreshSession() {
  const current = getSession()
  if (!current?.refresh_token) return null
  const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, { method: 'POST', headers: { apikey: SUPABASE_ANON_KEY, 'Content-Type': 'application/json' }, body: JSON.stringify({ refresh_token: current.refresh_token }) })
  if (!response.ok) return null
  const body = await response.json()
  const session = { ...body, user: body.user || current.user }
  saveSession(session)
  return session as AuthSession
}

export function authHeaders() {
  const session = getSession()
  return session ? { Authorization: `Bearer ${session.access_token}` } : {}
}

export async function apiFetch(path: string, init: RequestInit = {}) {
  const request = () => fetch(path, { ...init, headers: { ...authHeaders(), ...(init.headers || {}) } as HeadersInit })
  let response = await request()
  if (response.status === 401 && getSession()?.refresh_token) {
    const refreshed = await refreshSession()
    if (refreshed) response = await request()
  }
  if (response.status === 401) { saveSession(null); window.location.href = '/login' }
  return response
}
