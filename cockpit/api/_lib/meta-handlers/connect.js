import crypto from 'node:crypto'
import { db } from '../config.js'
import { authError, requireUser } from '../auth.js'
import { authorizationUrl } from '../meta.js'
export default async function handler(request, response) { if (!['GET', 'POST'].includes(request.method)) return response.status(405).json({ error: 'method_not_allowed' }); const clientId = String(request.query.clientId || ''); if (!/^[a-z0-9][a-z0-9_-]{1,80}$/i.test(clientId)) return response.status(400).json({ error: 'client_id_invalido' }); try { const user = await requireUser(request); const state = crypto.randomBytes(32).toString('hex'); await db('oauth_sessions', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ state, client_id: clientId, user_id: user.id }) }); const url = authorizationUrl(state); if (request.method === 'GET') return response.redirect(302, url); return response.status(200).json({ url }) } catch (error) { return authError(response, error) } }
