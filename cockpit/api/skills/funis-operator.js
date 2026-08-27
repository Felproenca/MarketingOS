/**
 * FUNIS OPERATOR — Skill/Agente de Funis Automático
 * Transforma insights em decisões de funil + gera briefs automáticos
 *
 * Roda: Automático a cada ciclo de dados
 * Input: data_now_normalized (insights)
 * Output: Brief criativo pronto para DesignOS + Loop
 */

import { db } from '../_lib/config.js'

const FUNNEL_STAGES = {
  awareness: {
    name: 'Descoberta',
    objective: 'Provocar curiosidade e reconhecimento do problema',
    contentTypes: ['educational', 'storytelling', 'problem-identification'],
    formats: ['reel', 'carousel', 'short-form-video'],
    cta: 'Salvar ou Compartilhar',
    keyMetrics: ['reach', 'saves', 'shares'],
  },
  consideration: {
    name: 'Consideração',
    objective: 'Demonstrar como sua marca resolve',
    contentTypes: ['case-study', 'proof-of-concept', 'comparison'],
    formats: ['carousel', 'long-form-video', 'testimonial'],
    cta: 'Enviar DM ou Clicar Link',
    keyMetrics: ['website_clicks', 'comments', 'shares'],
  },
  conversion: {
    name: 'Conversão',
    objective: 'Criar urgência e facilitar compra',
    contentTypes: ['offer', 'urgency', 'limited-time', 'direct-cta'],
    formats: ['video-direto', 'product-post', 'story-sequence'],
    cta: 'Comprar Agora',
    keyMetrics: ['clicks', 'conversions'],
  },
  retention: {
    name: 'Retenção',
    objective: 'Manter cliente engajado e build comunidade',
    contentTypes: ['community', 'behind-the-scenes', 'value-add'],
    formats: ['story', 'reel', 'live', 'carousel'],
    cta: 'Comentar ou Reagir',
    keyMetrics: ['engagement', 'comments', 'saves'],
  },
}

/**
 * Main: Analisar insights e gerar brief de funil automático
 */
export async function analyzeFunnelFromInsights(clientId) {
  try {
    console.log(`[FunnisOperator] Analisando funil para ${clientId}...`)

    // 1. Carregar insights mais recentes
    const insights = await db(
      `data_now_normalized?client_id=eq.${encodeURIComponent(clientId)}&select=*&order=observed_at.desc&limit=100`
    )

    if (!insights?.length) {
      return { ok: false, error: 'Sem dados para analisar' }
    }

    // 2. Detectar estágio atual do funil
    const funnelStage = detectFunnelStage(insights)

    // 3. Gerar brief automático
    const brief = generateFunnelBrief(clientId, funnelStage, insights)

    // 4. Salvar na agenda
    const saved = await saveFunnelBrief(clientId, brief)

    return {
      ok: true,
      clientId,
      funnelStage,
      brief,
      agendaId: saved?.id,
      briefId: brief.id,
    }
  } catch (error) {
    console.error(`[FunnelOperator] Erro: ${error.message}`)
    return { ok: false, error: error.message }
  }
}

/**
 * Detectar em qual estágio do funil está baseado em performance
 */
function detectFunnelStage(insights) {
  const metrics = {
    reach: 0,
    saves: 0,
    clicks: 0,
    conversions: 0,
  }

  // Agregar métricas
  for (const insight of insights) {
    if (insight.metrics?.reach) metrics.reach += insight.metrics.reach
    if (insight.metrics?.saved) metrics.saves += insight.metrics.saved
    if (insight.metrics?.website_clicks) metrics.clicks += insight.metrics.website_clicks
    if (insight.metrics?.conversions) metrics.conversions += insight.metrics.conversions
  }

  const avgReach = metrics.reach / insights.length
  const avgSaves = metrics.saves / insights.length
  const avgClicks = metrics.clicks / insights.length

  // Lógica de detecção
  if (avgClicks > 50) return 'conversion'
  if (avgSaves > 100) return 'consideration'
  if (avgReach > 5000) return 'awareness'
  return 'awareness' // default
}

/**
 * Gerar brief de funil automático
 */
function generateFunnelBrief(clientId, stage, insights) {
  const stageConfig = FUNNEL_STAGES[stage]
  const topInsight = insights[0] || {}

  return {
    id: `brief-${Date.now()}`,
    clientId,
    stage,
    title: `Conteúdo ${stageConfig.name}: ${topInsight.metadata?.caption?.slice(0, 40) || 'Nova proposta'}`,

    // Funil
    funnelConfig: {
      stage,
      stageName: stageConfig.name,
      objective: stageConfig.objective,
      contentTypes: stageConfig.contentTypes,
      formats: stageConfig.formats,
      cta: stageConfig.cta,
      keyMetrics: stageConfig.keyMetrics,
    },

    // Inspiração (o que funcionou)
    inspiration: {
      fromInsight: topInsight.entity_id,
      metrics: topInsight.metrics,
      caption: topInsight.metadata?.caption,
      mediaType: topInsight.metadata?.product_type,
    },

    // Executável por DesignOS
    designInput: {
      format: stageConfig.formats[0],
      tone: mapFunnelToTone(stage),
      visual: mapFunnelToVisual(stage),
      copy: generateCopyStrategy(stage),
      cta: stageConfig.cta,
    },

    // Loop integration
    loopInput: {
      platform: 'instagram',
      contentType: stageConfig.contentTypes[0],
      hashtagStrategy: generateHashtagStrategy(stage),
      publishTiming: getOptimalTiming(stage),
      expectPerformance: {
        reach: stage === 'awareness' ? '5k-10k' : '1k-5k',
        engagement: stage === 'conversion' ? '5-10%' : '1-3%',
      },
    },

    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  }
}

/**
 * Salvar brief na agenda editorial
 */
async function saveFunnelBrief(clientId, brief) {
  try {
    const saved = await db('work_requests', {
      method: 'POST',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({
        client_id: clientId,
        title: brief.title,
        request_type: 'agenda_item',
        status: 'proposta',
        source_system: 'funis-operator',
        target_system: 'design-system',
        requires_approval: false,
        priority: 'high',
        payload: {
          agenda: {
            type: brief.funnelConfig.formats[0],
            objective: brief.funnelConfig.objective,
            funnel_stage: brief.stage,
            channel: 'instagram',
            brief_id: brief.id,
            design_input: brief.designInput,
            loop_input: brief.loopInput,
            inspiration: brief.inspiration,
          },
        },
        created_at: new Date().toISOString(),
      }),
    })

    return saved?.[0]
  } catch (error) {
    console.error('save_brief_error', error.message)
    return null
  }
}

// === HELPERS ===

function mapFunnelToTone(stage) {
  const tones = {
    awareness: 'curiosidade + educação',
    consideration: 'confiança + autoridade',
    conversion: 'urgência + benefício',
    retention: 'comunidade + valor',
  }
  return tones[stage] || 'profissional'
}

function mapFunnelToVisual(stage) {
  const visuals = {
    awareness: 'Cores vibrantes, movimento, trending aesthetics',
    consideration: 'Minimalist, prova social, before/after',
    conversion: 'CTAs destacadas, urgência visual, scarcity',
    retention: 'Behind-the-scenes, pessoal, community-first',
  }
  return visuals[stage] || 'moderno'
}

function generateCopyStrategy(stage) {
  const strategies = {
    awareness: 'Hook + Curiosidade + Problema',
    consideration: 'Solução + Prova + Bridge',
    conversion: 'Oferta + Urgência + CTA Direto',
    retention: 'Valor + Relacionamento + Engajamento',
  }
  return strategies[stage] || 'padrão'
}

function generateHashtagStrategy(stage) {
  const hashtags = {
    awareness: ['trending', 'discovery', 'niche_leader'],
    consideration: ['proof', 'authority', 'niche_specific'],
    conversion: ['offer', 'urgency', 'brand'],
    retention: ['community', 'brand', 'insider'],
  }
  return hashtags[stage] || []
}

function getOptimalTiming(stage) {
  const timings = {
    awareness: '14h-16h (descoberta)',
    consideration: '19h-21h (decision making)',
    conversion: '10h-12h (action)',
    retention: 'variável (community)',
  }
  return timings[stage] || 'padrão'
}

// === API ===

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'method_not_allowed' })
  }

  const { clientId, action } = request.body

  if (action === 'analyze') {
    const result = await analyzeFunnelFromInsights(clientId)
    return response.status(result.ok ? 200 : 400).json(result)
  }

  return response.status(400).json({ error: 'action_required' })
}
