import { db } from './config.js'

const DEFAULT_COSTS = {
  carousel: 6000, post: 4000, audit: 8000, funnel_strategy: 6000, traffic: 7000, design: 7000,
  strategy: 4000, research: 5000, analysis: 4000, coletar_referencia: 5000, agentic_code: 2000,
  data_sync: 500, publish: 1500,
}
const DEFAULT_QUOTA = 100000

export async function getOutputCost(capability) {
  try {
    const rows = await db(`output_costs?capability=eq.${encodeURIComponent(capability)}&select=tokens_per_output&limit=1`)
    const cost = rows?.[0]?.tokens_per_output
    if (cost) return Number(cost)
  } catch { /* tabela ausente */ }
  return DEFAULT_COSTS[capability] || 3000
}

// Preço estimado por token (R$): ~R$0,01 por 1.000 tokens (DeepSeek, aprox.).
const BRL_PER_TOKEN = 0.00001

export async function getQuota(clientId) {
  try {
    const rows = await db(`client_quotas?client_id=eq.${encodeURIComponent(clientId)}&select=monthly_token_quota,used_tokens,plan,plan_value_brl,max_monthly_cost_brl,used_cost_brl,reset_at&limit=1`)
    const q = rows?.[0]
    if (!q) return { enabled: false, quota: DEFAULT_QUOTA, used: 0, remaining: DEFAULT_QUOTA, plan: null }
    const quota = Number(q.monthly_token_quota)
    const used = Number(q.used_tokens)
    const maxCost = Number(q.max_monthly_cost_brl) || 0
    const usedCost = Number(q.used_cost_brl) || 0
    return {
      enabled: true, quota, used, remaining: Math.max(0, quota - used), plan: q.plan,
      planValueBRL: Number(q.plan_value_brl) || 0, maxCostBRL: maxCost, usedCostBRL: usedCost,
      remainingCostBRL: Math.max(0, maxCost - usedCost), resetAt: q.reset_at,
    }
  } catch {
    return { enabled: false, quota: DEFAULT_QUOTA, used: 0, remaining: DEFAULT_QUOTA, plan: null }
  }
}

export async function canExecute(clientId, capability) {
  const cost = await getOutputCost(capability)
  const quota = await getQuota(clientId)
  const costBRL = cost * BRL_PER_TOKEN
  if (quota.enabled && quota.remaining < cost) {
    return { ok: false, reason: 'quota_exceeded', quota, cost, message: `Cota de tokens insuficiente: restam ${quota.remaining}, ${capability} custa ${cost}.` }
  }
  if (quota.enabled && quota.maxCostBRL > 0 && quota.remainingCostBRL < costBRL) {
    return { ok: false, reason: 'cost_quota_exceeded', quota, cost, costBRL, message: `Teto de custo atingido (R$ ${quota.maxCostBRL}): resta R$ ${quota.remainingCostBRL.toFixed(2)}, ${capability} custa ~R$ ${costBRL.toFixed(2)}.` }
  }
  return { ok: true, quota, cost }
}

export async function deductQuota(clientId, capability) {
  const cost = await getOutputCost(capability)
  const costBRL = Math.round(cost * BRL_PER_TOKEN * 100) / 100
  try {
    const quota = await getQuota(clientId)
    await db(`client_quotas?client_id=eq.${encodeURIComponent(clientId)}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ used_tokens: quota.used + cost, used_cost_brl: Math.round((quota.usedCostBRL + costBRL) * 100) / 100, updated_at: new Date().toISOString() }),
    }).catch(() => null)
  } catch { /* tabela ausente */ }
  try {
    await db('ai_usage_events', {
      method: 'POST',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ client_id: clientId, provider: 'marketingos', model: null, event_type: 'output_cost', input_units: null, output_units: cost, estimated_cost: costBRL, metadata: { capability } }),
    }).catch(() => null)
  } catch { /* schema varia */ }
  return { tokens: cost, costBRL }
}
