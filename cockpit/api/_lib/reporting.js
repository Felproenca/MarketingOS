// Relatório real por cliente — metrifica custo a partir da agenda de operação
// (missões + sync runs) e rastreia desperdício (outputs rejeitados).
import { db } from './config.js'

const BRL_PER_USD = 5.5

export async function clientReport(clientId) {
  const jobs = (await db(`media_jobs?client_id=eq.${encodeURIComponent(clientId)}&select=capability,status,created_at&order=created_at.desc&limit=500`).catch(() => [])) || []
  const artifacts = (await db(`artifacts?client_id=eq.${encodeURIComponent(clientId)}&select=id,artifact_type,title,status,created_at&order=created_at.desc&limit=500`).catch(() => [])) || []
  const artifactIds = artifacts.map(a => a.id)
  const approvals = artifactIds.length
    ? (await db(`artifact_approvals?artifact_id=in.(${encodeURIComponent(artifactIds.join(','))})&select=artifact_id,decision,feedback,created_at&order=created_at.desc&limit=500`).catch(() => [])) || []
    : []
  const usage = (await db(`ai_usage_events?client_id=eq.${encodeURIComponent(clientId)}&select=event_type,input_units,output_units,estimated_cost,created_at&order=created_at.desc&limit=1000`).catch(() => [])) || []
  const syncRuns = (await db(`data_now_sync_runs?client_id=eq.${encodeURIComponent(clientId)}&select=source,status,raw_records,error_count,created_at&order=created_at.desc&limit=500`).catch(() => [])) || []
  const quota = (await db(`client_quotas?client_id=eq.${encodeURIComponent(clientId)}&select=plan,monthly_token_quota,used_tokens,plan_value_brl,max_monthly_cost_brl,used_cost_brl&limit=1`).catch(() => [])) || []

  // custo: ai_usage_events (output_cost carrega output_units = tokens; estimativa BRL)
  const byCapabilityCost = {}
  const usageTokens = usage.reduce((sum, e) => sum + (Number(e.output_units) || Number(e.input_units) || 0), 0)
  for (const e of usage) {
    const cap = e.metadata?.capability || e.event_type || 'outro'
    byCapabilityCost[cap] = (byCapabilityCost[cap] || 0) + (Number(e.output_units) || 0)
  }

  // desperdício: artifacts rejeitados
  const rejectedArtifactIds = new Set(approvals.filter(a => a.decision === 'rejected').map(a => a.artifact_id))
  const rejected = artifacts.filter(a => rejectedArtifactIds.has(a.id))
  const approved = artifacts.filter(a => approvals.some(p => p.artifact_id === a.id && p.decision === 'approved'))

  const costUsd = usage.reduce((sum, e) => sum + (Number(e.estimated_cost) || 0), 0)
  const outputsByStatus = jobs.reduce((acc, j) => { acc[j.status] = (acc[j.status] || 0) + 1; return acc }, {})
  const outputsByCapability = jobs.reduce((acc, j) => { acc[j.capability] = (acc[j.capability] || 0) + 1; return acc }, {})
  const syncBySource = syncRuns.reduce((acc, r) => { acc[r.source] = (acc[r.source] || 0) + 1; return acc }, {})
  const syncErrors = syncRuns.filter(r => r.status === 'error').length

  return {
    cliente: clientId,
    cota: {
      plano: quota[0]?.plan || null,
      total_tokens: Number(quota[0]?.monthly_token_quota) || 0,
      usados: Number(quota[0]?.used_tokens) || 0,
      restantes: Math.max(0, (Number(quota[0]?.monthly_token_quota) || 0) - (Number(quota[0]?.used_tokens) || 0)),
      valor_plano_brl: Number(quota[0]?.plan_value_brl) || 0,
      teto_custo_brl: Number(quota[0]?.max_monthly_cost_brl) || 0,
      custo_usado_brl: Number(quota[0]?.used_cost_brl) || 0,
    },
    margem: {
      receita_brl: Number(quota[0]?.plan_value_brl) || 0,
      custo_brl: Number(quota[0]?.used_cost_brl) || 0,
      lucro_brl: Math.max(0, (Number(quota[0]?.plan_value_brl) || 0) - (Number(quota[0]?.used_cost_brl) || 0)),
      margem_pct: (Number(quota[0]?.plan_value_brl) || 0) > 0 ? Math.round((1 - (Number(quota[0]?.used_cost_brl) || 0) / (Number(quota[0]?.plan_value_brl) || 0)) * 1000) / 10 : null,
    },
    operacoes: {
      missoes: jobs.length,
      sync_runs: syncRuns.length,
      sync_erros: syncErrors,
      sync_por_fonte: syncBySource,
    },
    outputs: { total: jobs.length, por_capability: outputsByCapability, por_status: outputsByStatus },
    custo: {
      tokens_metrificados: usageTokens,
      custo_usd: Math.round(costUsd * 1000000) / 1000000,
      custo_brl_estimado: Math.round(costUsd * BRL_PER_USD * 100) / 100,
      tokens_por_capability: byCapabilityCost,
    },
    qualidade: {
      artifacts: artifacts.length,
      aprovados: approved.length,
      rejeitados: rejected.length,
      taxa_aprovacao: artifacts.length ? Math.round((approved.length / artifacts.length) * 1000) / 10 : null,
      razoes_rejeicao: rejected.map(a => ({ titulo: a.title, motivo: approvals.find(p => p.artifact_id === a.id && p.decision === 'rejected')?.feedback || null })),
    },
    desperdicio: {
      outputs_rejeitados: rejected.length,
      // custo estimado desperdiçado = outputs rejeitados × custo médio da capability (do output_costs)
    },
    gerado_em: new Date().toISOString(),
  }
}
