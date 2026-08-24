import { required } from './config.js'
const version = process.env.META_GRAPH_VERSION || 'v23.0'
const graph = `https://graph.facebook.com/${version}`
export const redirectUri = () => process.env.META_OAUTH_REDIRECT_URI || 'https://app.mkos.online/api/integrations/meta/callback'
export async function call(pathname, params) { const url = new URL(/^https?:\/\//i.test(pathname) ? pathname : `${graph}${pathname}`); for (const [key, value] of Object.entries(params || {})) url.searchParams.set(key, value); const response = await fetch(url); const body = await response.json(); if (!response.ok || body.error) throw new Error(body.error?.message || `Meta HTTP ${response.status}`); return body }
export function authorizationUrl(state) { const params = new URLSearchParams({ client_id: required('META_APP_ID'), redirect_uri: redirectUri(), state, response_type: 'code' }); const configId = process.env.META_LOGIN_CONFIG_ID; if (configId) { params.set('config_id', configId); params.set('override_default_response_type', 'true'); } else { params.set('scope', process.env.META_OAUTH_SCOPES || 'instagram_basic,instagram_manage_insights,pages_show_list,pages_read_engagement,ads_read'); } return `https://www.facebook.com/${version}/dialog/oauth?${params}` }
export async function exchange(code) {
  const appId = required('META_APP_ID')
  const secret = required('META_APP_SECRET')
  const configId = process.env.META_LOGIN_CONFIG_ID
  const exchangeParams = { client_id: appId, client_secret: secret, redirect_uri: redirectUri(), code }
  if (configId) exchangeParams.config_id = configId
  const short = await call('/oauth/access_token', exchangeParams)
  const long = await call('/oauth/access_token', { grant_type: 'fb_exchange_token', client_id: appId, client_secret: secret, fb_exchange_token: short.access_token })
  return { accessToken: long.access_token || short.access_token, expiresIn: Number(long.expires_in || short.expires_in || 0) }
}

export async function debugToken(accessToken) {
  const appToken = `${required('META_APP_ID')}|${required('META_APP_SECRET')}`
  return call('/debug_token', { input_token: accessToken, access_token: appToken })
}
