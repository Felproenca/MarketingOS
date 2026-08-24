import connectHandler from '../../_lib/meta-handlers/connect.js'
import statusHandler from '../../_lib/meta-handlers/status.js'
import adsHandler from '../../_lib/meta-handlers/ads.js'
import insightsHandler from '../../_lib/meta-handlers/insights.js'
import { handleCors } from '../../_lib/cors.js'

export default async function handler(request, response) {
  if (handleCors(request, response)) return
  const action = String(request.query.action || '').toLowerCase()
  const clientId = String(request.query.clientId || '')
  if (clientId) request.query.clientId = clientId
  if (action === 'connect') return connectHandler(request, response)
  if (action === 'status') return statusHandler(request, response)
  if (action === 'ads') return adsHandler(request, response)
  if (action === 'insights') return insightsHandler(request, response)
  return response.status(404).json({ error: 'meta_client_action_not_found' })
}
