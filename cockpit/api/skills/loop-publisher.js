/**
 * LOOP Publisher — Publica conteúdo no Instagram
 * Input: Conteúdo de DesignOS
 * Output: Post publicado + registrado na agenda
 *
 * Features:
 * - Conhece trending do Instagram
 * - Otimiza timing
 * - Rastreia publicação
 * - Integra com agenda cliente
 */

import { db, decrypt } from '../_lib/config.js'
import { call as metaCall } from '../_lib/meta.js'

/**
 * Publicar conteúdo no Instagram
 */
export async function publishToInstagram(clientId, content) {
  try {
    console.log(`[Loop Publisher] Publicando para ${clientId}...`)

    // 1. Verificar se tem conexão com Instagram
    const igConnection = await db(
      `connections?client_id=eq.${encodeURIComponent(clientId)}&source=eq.meta&select=source_account_id,access_token_encrypted&limit=1`
    )

    if (!igConnection?.[0]) {
      return { ok: false, error: 'Instagram não conectado' }
    }

    const token = decrypt(igConnection[0].access_token_encrypted)
    const igUserId = igConnection[0].source_account_id

    // 2. Detectar trending topics
    const trending = await detectTrendingTopics()

    // 3. Otimizar conteúdo para trending
    const optimizedContent = optimizeForTrending(content, trending)

    // 4. Publicar
    const published = await publishMedia(igUserId, token, optimizedContent)

    // 5. Registrar na agenda
    const agenda = await registerInAgenda(clientId, content, published)

    return {
      ok: true,
      clientId,
      publishedAt: new Date().toISOString(),
      postId: published.id,
      agendaId: agenda?.id,
      performance: {
        expectedReach: content.metadata.expectedReach,
        trackingUrl: `instagram.com/p/${published.id}`,
      },
    }
  } catch (error) {
    console.error('[Loop Publisher] Erro:', error.message)
    return { ok: false, error: error.message }
  }
}

/**
 * Detectar trending topics no Instagram (mock - integrar com API real)
 */
async function detectTrendingTopics() {
  // TODO: Integrar com Real Instagram Insights API
  // Por enquanto, retornar trending conhecidos
  return {
    hashtags: ['#contentcreator', '#reelsinstagram', '#instagram', '#viralreels'],
    formats: ['reels', 'carousel'],
    aesthetics: ['minimalist', 'authentic', 'bold-colors'],
    timing: {
      best: '19h-21h UTC',
      secondary: '10h-12h UTC',
    },
  }
}

/**
 * Otimizar conteúdo para trending
 */
function optimizeForTrending(content, trending) {
  return {
    ...content,
    copy: {
      ...content.copy,
      // Adicionar trending hashtags mais relevantes
      hashtags: [
        ...content.copy.hashtags.slice(0, 20),
        ...trending.hashtags.slice(0, 10),
      ].slice(0, 30),
    },

    // Ajustar timing
    publishTiming: trending.timing.best,

    // Meta optimization
    optimization: {
      format: content.type, // 'reel' ou 'carousel'
      thumbnail: content.visual.imageUrl,
      hook: extractHook(content.copy.headline),
      keyframes: ['0s (hook)', '3s (value)', '15s (cta)'],
    },
  }
}

/**
 * Publicar media no Instagram (via Meta API)
 */
async function publishMedia(igUserId, token, content) {
  try {
    // Construir payload de publicação
    let mediaPayload

    if (content.type === 'reel') {
      // Para reels: video_url obrigatório
      mediaPayload = {
        media_type: 'VIDEO',
        video_url: content.visual.videoUrl,
        caption: `${content.copy.headline}\n\n${content.copy.body}\n\n${content.copy.hashtags.join(' ')}`,
        access_token: token,
      }
    } else if (content.type === 'carousel') {
      // Para carousel: array de imagens
      mediaPayload = {
        media_type: 'CAROUSEL',
        children: [
          {
            media_type: 'IMAGE',
            image_url: content.visual.imageUrl,
          },
        ],
        caption: `${content.copy.headline}\n\n${content.copy.body}\n\n${content.copy.hashtags.join(' ')}`,
        access_token: token,
      }
    } else {
      // Post padrão
      mediaPayload = {
        media_type: 'IMAGE',
        image_url: content.visual.imageUrl,
        caption: `${content.copy.headline}\n\n${content.copy.body}\n\n${content.copy.hashtags.join(' ')}`,
        access_token: token,
      }
    }

    // Chamar Meta API
    const response = await metaCall(`/${igUserId}/media`, mediaPayload)

    return {
      id: response.id,
      publishedAt: new Date().toISOString(),
      url: `instagram.com/p/${response.id}`,
    }
  } catch (error) {
    console.error('publish_error', error.message)
    throw error
  }
}

/**
 * Registrar publicação na agenda do cliente
 */
async function registerInAgenda(clientId, content, published) {
  try {
    const agenda = await db('artifacts', {
      method: 'POST',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({
        client_id: clientId,
        artifact_type: 'published_post',
        title: `Publicado: ${content.type} - ${content.metadata.funnelStage}`,
        status: 'published',
        metadata: {
          publishedAt: published.publishedAt,
          postUrl: published.url,
          contentId: content.id,
          performance: {
            tracked: false,
            expectedReach: content.metadata.expectedReach,
          },
        },
      }),
    })

    // Registrar em audit
    await db('audit_events', {
      method: 'POST',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({
        client_id: clientId,
        event_type: 'content_published',
        actor_role: 'system',
        resource_type: 'post',
        resource_id: published.id,
        metadata: {
          platform: 'instagram',
          type: content.type,
          funnelStage: content.metadata.funnelStage,
          url: published.url,
        },
        created_at: new Date().toISOString(),
      }),
    })

    return agenda?.[0]
  } catch (error) {
    console.error('agenda_register_error', error.message)
    return null
  }
}

// === HELPERS ===

function extractHook(headline) {
  // Extrair primeiras 3 palavras como hook
  return headline.split(' ').slice(0, 3).join(' ')
}

/**
 * Rastrear performance da publicação
 */
export async function trackPostPerformance(clientId, postId) {
  try {
    const insights = await metaCall(`/${postId}/insights`, {
      metric: 'engagement,impressions,reach',
    })

    return {
      postId,
      tracked: true,
      engagement: insights.engagement || 0,
      impressions: insights.impressions || 0,
      reach: insights.reach || 0,
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    console.error('track_error', error.message)
    return { postId, tracked: false }
  }
}

// === API ===

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'method_not_allowed' })
  }

  const { clientId, content, action } = request.body

  if (action === 'publish') {
    const result = await publishToInstagram(clientId, content)
    return response.status(result.ok ? 200 : 400).json(result)
  }

  if (action === 'track') {
    const { postId } = request.body
    const result = await trackPostPerformance(clientId, postId)
    return response.status(200).json(result)
  }

  return response.status(400).json({ error: 'action_required' })
}
