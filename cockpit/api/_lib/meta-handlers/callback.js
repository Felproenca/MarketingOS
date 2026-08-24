import { db, encrypt } from '../config.js'
import { call, debugToken, exchange } from '../meta.js'

const targetUrl = () => process.env.COCKPIT_WEB_URL || 'https://app.mkos.online'

export default async function handler(request, response) {
  const { code, state, error, error_description: errorDescription } = request.query
  if (error) return response.status(400).send(`<h1>Autorização não concluída</h1><p>${safe(errorDescription || error)}</p>`)
  if (!code || !state) return response.status(400).send('Callback Meta incompleto.')

  let stage = 'session'
  try {
    const sessions = await db(`oauth_sessions?state=eq.${encodeURIComponent(state)}&select=state,client_id,user_id,created_at&limit=1`)
    const session = sessions?.[0]
    if (!session || Date.now() - new Date(session.created_at).getTime() > 10 * 60 * 1000) throw new Error('Sessão OAuth expirada ou inválida.')

    stage = 'token'
    const token = await exchange(code)
    stage = 'profile'
    const me = await call('/me', { fields: 'id,name', access_token: token.accessToken })

    stage = 'pages'
    const pages = await listPages(me.id, token.accessToken)
    let selected = null
    for (const page of pages) {
      const pageDetails = page.instagram_business_account?.id
        ? page
        : await pageWithInstagram(page, token.accessToken)
      if (pageDetails?.instagram_business_account?.id) {
        selected = { page: pageDetails, ig: pageDetails.instagram_business_account }
        break
      }
    }

    // Login for Business may return the selected Instagram as a granular target
    // without exposing it through /me/accounts. Resolve that target directly.
    let tokenDiagnostic = ''
    if (!selected) {
      const resolved = await instagramFromToken(token.accessToken)
      selected = resolved.selected
      tokenDiagnostic = resolved.diagnostic
    }

    if (!selected) throw new Error(`A Meta autorizou os ativos, mas a API retornou ${pages.length} Página(s) sem vínculo Instagram legível. ${[pages.diagnostic, tokenDiagnostic].filter(Boolean).join(' | ') || 'Sem detalhe adicional da API.'}`)

    stage = 'save'
    await db('connections?on_conflict=client_id,source', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify({
        client_id: session.client_id,
        source: 'meta',
        access_token_encrypted: encrypt(token.accessToken),
        source_account_id: selected.ig.id,
        page_id: selected.page?.id || null,
        username: selected.ig.username || null,
        expires_at: token.expiresIn ? new Date(Date.now() + token.expiresIn * 1000).toISOString() : null,
        connected_at: new Date().toISOString(),
      }),
    })
    await db('client_memberships?on_conflict=client_id,user_id', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify({ client_id: session.client_id, user_id: session.user_id, role: 'owner' }),
    })
    await db('client_profiles?on_conflict=client_id', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify({ client_id: session.client_id, display_name: selected.ig.username || session.client_id, status: 'active', updated_at: new Date().toISOString() }),
    })

    await db(`oauth_sessions?state=eq.${encodeURIComponent(state)}`, { method: 'DELETE', headers: { Prefer: 'return=minimal' } })
    return response.redirect(`${targetUrl()}/portal?meta=connected&client_id=${encodeURIComponent(session.client_id)}`)
  } catch (caught) {
    console.error('oauth_callback_failed', { stage, message: caught.message })
    return response.status(502).send(`<h1>Conexão autorizada, mas não concluída</h1><p><strong>Etapa:</strong> ${safe(stage)}</p><p><strong>Motivo:</strong> ${safe(caught.message)}</p><p>Nenhum token foi exibido.</p>`)
  }
}

async function listPages(userId, accessToken) {
  const pages = []
  const diagnostics = []
  try {
    const result = await call(`/${userId}/accounts`, { fields: 'id,name,access_token,instagram_business_account{id,username}', limit: '100', access_token: accessToken })
    pages.push(...(result.data || []))
    diagnostics.push(`accounts:data=${(result.data || []).length}`)
  } catch (error) { diagnostics.push(`accounts: ${error.message}`); console.error('pages_lookup_failed', error.message) }

  if (pages.length) return pages

  pages.diagnostic = diagnostics.join(' | ')
  return pages
}

async function instagramFromToken(accessToken) {
  try {
    const debug = await debugToken(accessToken)
    const granular = debug.data?.granular_scopes || []
    const instagramTargets = granular.filter(scope => String(scope.scope || '').startsWith('instagram_')).flatMap(scope => scope.target_ids || [])
    const otherTargets = granular.filter(scope => !String(scope.scope || '').startsWith('instagram_')).flatMap(scope => scope.target_ids || [])
    const targets = [...new Set([...instagramTargets, ...otherTargets])]
    const scopeNames = (debug.data?.scopes || []).join(',') || 'none'
    const diagnostic = `token_valid=${Boolean(debug.data?.is_valid)}, type=${debug.data?.type || 'unknown'}, scopes=${scopeNames}, granular=${(debug.data?.granular_scopes || []).map(scope => `${scope.scope}:${(scope.target_ids || []).length}`).join(',') || 'none'}, targets=${targets.length}`
    console.error('meta_token_diagnostic', {
      valid: Boolean(debug.data?.is_valid),
      type: debug.data?.type || 'unknown',
      scopes: scopeNames,
      granularScopes: (debug.data?.granular_scopes || []).map(scope => `${scope.scope}:${(scope.target_ids || []).length}`).join(',') || 'none',
      targetCount: targets.length,
    })
    if (!targets.length) return { selected: null, diagnostic }
    const assetErrors = []
    for (const targetId of targets) {
      try {
        const instagram = await call(`/${targetId}`, { fields: 'id,username,name', access_token: accessToken })
        if (instagram.username && instagram.id) return { selected: { page: {}, ig: instagram }, diagnostic }
      } catch (error) {
        try {
          const page = await call(`/${targetId}`, { fields: 'id,name,instagram_business_account{id,username}', access_token: accessToken })
          if (page.instagram_business_account?.id) return { selected: { page, ig: page.instagram_business_account }, diagnostic }
        } catch (pageError) {
          assetErrors.push(pageError.message)
          console.error('granular_asset_lookup_failed', pageError.message)
        }
      }
    }
    return { selected: null, diagnostic: `${diagnostic}, asset_errors=${assetErrors.length}, last_asset_error=${String(assetErrors.at(-1) || 'none').slice(0, 180)}` }
  } catch (error) {
    console.error('token_debug_failed', error.message)
    return { selected: null, diagnostic: `token_debug: ${String(error.message).slice(0, 180)}` }
  }
  return { selected: null, diagnostic: 'asset_lookup_failed' }
}

async function pageWithInstagram(page, userToken) {
  try {
    return await call(`/${page.id}`, { fields: 'id,name,instagram_business_account{id,username}', access_token: page.access_token || userToken })
  } catch (error) {
    console.error('page_instagram_lookup_failed', error.message)
    return null
  }
}

function safe(value) { return String(value).replace(/[<&>"']/g, char => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' }[char])) }
