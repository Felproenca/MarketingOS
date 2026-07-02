const BASE = 'http://localhost:4201'

export async function getMissions() {
  const r = await fetch(`${BASE}/api/missions`)
  if (!r.ok) throw new Error('Falha ao carregar missões')
  return r.json()
}

export async function getMission(slug: string) {
  const r = await fetch(`${BASE}/api/missions/${slug}`)
  if (!r.ok) throw new Error('Missão não encontrada')
  return r.json()
}

export async function createMission(data: Record<string, string>) {
  const r = await fetch(`${BASE}/api/missions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!r.ok) throw new Error('Falha ao criar missão')
  return r.json()
}

export async function executeMission(slug: string) {
  const r = await fetch(`${BASE}/api/missions/${slug}/execute`, { method: 'POST' })
  if (!r.ok) throw new Error('Falha ao executar missão')
  return r.json()
}

export async function deleteMission(slug: string) {
  const r = await fetch(`${BASE}/api/missions/${slug}`, { method: 'DELETE' })
  if (!r.ok) throw new Error('Falha ao deletar missão')
  return r.json()
}
