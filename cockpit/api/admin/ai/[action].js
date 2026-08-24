import { connections, upload } from '../../_lib/ai-endpoints.js'
import { handleCors } from '../../_lib/cors.js'
export default async function handler(request, response) {
  if (handleCors(request, response)) return
  const action = String(request.query.action || '').toLowerCase()
  if (action === 'connections') return connections(request, response)
  if (action === 'upload') return upload(request, response)
  return response.status(404).json({ error: 'ai_action_not_found' })
}
