/**
 * MASTER PIPELINE — Orquestrador Completo
 *
 * Fluxo:
 * Insights → Funis → DesignOS → Loop → Publicado
 *
 * Roda automático para os 4 clientes ativos
 */

import { db } from '../_lib/config.js'
import { analyzeFunnelFromInsights } from '../skills/funis-operator.js'
import { generateSocialContent } from '../skills/designos-social.js'
import { publishToInstagram } from '../skills/loop-publisher.js'

const ACTIVE_CLIENTS = ['forca-da-terra', 'fortunato', 'bruno-capelli', 'toqueindiano']

/**
 * Pipeline completo: Um ciclo de conteúdo automático
 */
export async function runMasterPipeline(clientId) {
  try {
    console.log(`[MasterPipeline] Iniciando ciclo para ${clientId}...`)

    const startTime = Date.now()

    // Step 1: FUNIS AUTOMÁTICO
    console.log(`  [1/4] Analisando funil...`)
    const funnelResult = await analyzeFunnelFromInsights(clientId)
    if (!funnelResult.ok) {
      console.log(`  ⚠️ Funis falhou: ${funnelResult.error}`)
      return { ok: false, error: funnelResult.error, step: 'funis' }
    }
    const brief = funnelResult.brief

    // Step 2: DESIGNOS (Geração de conteúdo)
    console.log(`  [2/4] Gerando conteúdo visual...`)
    const designResult = await generateSocialContent(clientId, brief)
    if (!designResult.ok) {
      console.log(`  ⚠️ DesignOS falhou: ${designResult.error}`)
      return { ok: false, error: designResult.error, step: 'design' }
    }
    const content = designResult.content

    // Step 3: LOOP (Publicação)
    console.log(`  [3/4] Publicando no Instagram...`)
    const loopResult = await publishToInstagram(clientId, content)
    if (!loopResult.ok) {
      console.log(`  ⚠️ Loop falhou: ${loopResult.error}`)
      return { ok: false, error: loopResult.error, step: 'loop' }
    }

    // Step 4: Registrar na dashboard do cliente
    console.log(`  [4/4] Registrando na dashboard...`)
    await registerInDashboard(clientId, {
      funnelStage: funnelResult.funnelStage,
      briefId: funnelResult.briefId,
      contentId: designResult.contentId,
      postId: loopResult.postId,
      publishedAt: loopResult.publishedAt,
    })

    const duration = Date.now() - startTime

    console.log(`  ✅ Ciclo completo em ${duration}ms`)

    return {
      ok: true,
      clientId,
      duration,
      funnelStage: funnelResult.funnelStage,
      briefId: funnelResult.briefId,
      contentId: designResult.contentId,
      postId: loopResult.postId,
      publishedAt: loopResult.publishedAt,
      completedAt: new Date().toISOString(),
    }
  } catch (error) {
    console.error(`[MasterPipeline] Erro crítico: ${error.message}`)
    return { ok: false, error: error.message }
  }
}

/**
 * Rodar pipeline para todos os 4 clientes
 */
export async function runMasterPipelineForAllClients() {
  const results = {}
  const startTime = Date.now()

  console.log(`[MasterPipeline] Iniciando ciclo para ${ACTIVE_CLIENTS.length} clientes...`)

  for (const clientId of ACTIVE_CLIENTS) {
    results[clientId] = await runMasterPipeline(clientId)
  }

  const duration = Date.now() - startTime

  // Registrar ciclo completo
  await registerCycleMetrics(results, duration)

  return {
    ok: Object.values(results).every(r => r.ok),
    cycleTime: duration,
    results,
  }
}

/**
 * Registrar na dashboard do cliente
 */
async function registerInDashboard(clientId, data) {
  try {
    await db('artifacts', {
      method: 'POST',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({
        client_id: clientId,
        artifact_type: 'pipeline_cycle',
        title: `Ciclo Automático - ${new Date().toLocaleDateString('pt-BR')}`,
        status: 'completed',
        metadata: {
          ...data,
          cycleTime: new Date().toISOString(),
        },
      }),
    })
  } catch (error) {
    console.error('dashboard_register_error', error.message)
  }
}

/**
 * Registrar métricas do ciclo
 */
async function registerCycleMetrics(results, duration) {
  try {
    const successCount = Object.values(results).filter(r => r.ok).length
    const postCount = Object.values(results)
      .filter(r => r.ok)
      .filter(r => r.postId).length

    await db('audit_events', {
      method: 'POST',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({
        client_id: 'system',
        event_type: 'master_pipeline_cycle',
        actor_role: 'system',
        resource_type: 'orchestrator',
        resource_id: 'master-pipeline',
        metadata: {
          duration,
          clients: ACTIVE_CLIENTS.length,
          successful: successCount,
          postsPublished: postCount,
          results,
        },
        created_at: new Date().toISOString(),
      }),
    })
  } catch (error) {
    console.error('metrics_register_error', error.message)
  }
}

// === API ===

export default async function handler(request, response) {
  if (request.method !== 'POST' && request.method !== 'GET') {
    return response.status(405).json({ error: 'method_not_allowed' })
  }

  // GET: Status do serviço
  if (request.method === 'GET' && request.query.status === '1') {
    return response.status(200).json({
      ok: true,
      service: 'master-pipeline',
      activeClients: ACTIVE_CLIENTS.length,
      timestamp: new Date().toISOString(),
    })
  }

  // POST: Trigger manual
  if (request.method === 'POST') {
    const { action, clientId } = request.body

    if (action === 'trigger_single' && clientId) {
      const result = await runMasterPipeline(clientId)
      return response.status(result.ok ? 200 : 400).json(result)
    }

    if (action === 'trigger_all') {
      const result = await runMasterPipelineForAllClients()
      return response.status(result.ok ? 200 : 400).json(result)
    }
  }

  return response.status(400).json({ error: 'action_required' })
}
