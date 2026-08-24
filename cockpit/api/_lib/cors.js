export function handleCors(request, response) {
  const origin = request.headers.origin || '*'
  response.setHeader('Access-Control-Allow-Origin', origin)
  response.setHeader('Vary', 'Origin')
  response.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, Idempotency-Key, apikey')
  response.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
  response.setHeader('Access-Control-Max-Age', '86400')
  if (request.method === 'OPTIONS') {
    response.status(204).end()
    return true
  }
  return false
}
