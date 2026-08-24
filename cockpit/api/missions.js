import { requireUser, authError } from './_lib/auth.js'
import { listMissions, createMission } from './_lib/intake.js'

export default async function handler(request, response) {
  try {
    const user = await requireUser(request)
    if (request.method === 'GET') {
      return response.status(200).json(await listMissions())
    }
    if (request.method === 'POST') {
      const result = await createMission({ body: request.body || {}, user })
      return response.status(201).json(result)
    }
    return response.status(405).json({ error: 'method_not_allowed' })
  } catch (error) {
    return authError(response, error)
  }
}
