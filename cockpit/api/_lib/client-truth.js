import { db } from './config.js'

const REQUIRED_FIELDS = [
  ['brand_profile.positioning', truth => truth.brand_profile?.positioning],
  ['brand_profile.audience', truth => truth.brand_profile?.audience],
  ['brand_profile.visual_direction', truth => truth.brand_profile?.visual_direction],
  ['voice_profile.tone', truth => truth.voice_profile?.tone],
  ['offers', truth => Array.isArray(truth.offers) && truth.offers.length > 0],
  ['constraints', truth => Array.isArray(truth.constraints) && truth.constraints.length > 0],
]

export async function getClientTruth(clientId) {
  const [profiles, references] = await Promise.all([
    db(`client_profiles?client_id=eq.${encodeURIComponent(clientId)}&select=client_id,display_name,company_name,status,updated_at&limit=1`),
    db(`client_references?client_id=eq.${encodeURIComponent(clientId)}&select=client_id,brand_profile,voice_profile,offers,constraints,approved_examples,notes,updated_at&limit=1`),
  ])
  const profile = profiles?.[0] || null
  const reference = references?.[0] || null
  const truth = {
    client: profile,
    client_id: clientId,
    brand_profile: reference?.brand_profile || {},
    voice_profile: reference?.voice_profile || {},
    offers: reference?.offers || [],
    constraints: reference?.constraints || [],
    approved_examples: reference?.approved_examples || [],
    notes: reference?.notes || null,
    updated_at: reference?.updated_at || profile?.updated_at || null,
  }
  return { truth, profile, reference, validation: validateClientTruth(truth) }
}

export function validateClientTruth(truth) {
  const missing = REQUIRED_FIELDS.filter(([, read]) => !read(truth)).map(([field]) => field)
  const warnings = []
  if (!truth.approved_examples?.length) warnings.push('approved_examples')
  if (!truth.client?.display_name && !truth.client_id) missing.push('client.display_name')
  return { valid: missing.length === 0, missing, warnings, checkedAt: new Date().toISOString() }
}
