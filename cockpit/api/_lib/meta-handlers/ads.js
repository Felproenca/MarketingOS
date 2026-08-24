import { db, decrypt } from '../config.js'
import { call } from '../meta.js'
import { authError, requireClientAccess } from '../auth.js'

const FIELDS = 'campaign_id,campaign_name,adset_id,adset_name,ad_id,ad_name,impressions,reach,frequency,clicks,ctr,cpc,cpm,spend,actions,action_values,purchase_roas'

export default async function handler(request, response) {
  if (request.method !== 'GET') return response.status(405).json({ error: 'method_not_allowed' })
  const clientId = String(request.query.clientId || '')
  if (!/^[a-z0-9][a-z0-9_-]{1,80}$/i.test(clientId)) return response.status(400).json({ error: 'client_id_invalido' })
  try {
    await requireClientAccess(request, clientId, db)
    const rows = await db(`connections?client_id=eq.${encodeURIComponent(clientId)}&source=eq.meta&select=access_token_encrypted,connected_at&limit=1`)
    if (!rows?.[0]) return response.status(404).json({ clientId, connected: false, error: 'connection_not_found' })
    const token = decrypt(rows[0].access_token_encrypted)
    const accounts = await listAdAccounts(token)
    const since = request.query.since || new Date(Date.now() - 28 * 86400000).toISOString().slice(0, 10)
    const until = request.query.until || new Date().toISOString().slice(0, 10)
    const data = []
    const errors = []
    for (const account of accounts) {
      try {
        const result = await call(`/${account.id}/insights`, { level: 'ad', fields: FIELDS, time_range: JSON.stringify({ since, until }), limit: '500', access_token: token })
        data.push(...(result.data || []).map(row => ({ ...row, ad_account_id: account.id, ad_account_name: account.name })))
      } catch (error) { errors.push({ accountId: account.id, message: error.message }) }
    }
    return response.status(200).json({ clientId, connected: true, source: 'meta_ads', period: { since, until }, adAccounts: accounts.map(({ id, name, accountStatus, currency, timezone }) => ({ id, name, accountStatus, currency, timezone })), rows: data, errors })
  } catch (error) {
    console.error('meta_ads_failed', { clientId, message: error.message })
    return authError(response, error)
  }
}

async function listAdAccounts(token) {
  const result = await call('/me/adaccounts', { fields: 'id,account_id,name,account_status,currency,timezone_name', limit: '100', access_token: token })
  return (result.data || []).map(item => ({ id: item.id, name: item.name || item.account_id || item.id, accountStatus: item.account_status ?? null, currency: item.currency || null, timezone: item.timezone_name || null }))
}
