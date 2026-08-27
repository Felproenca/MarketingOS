/**
 * DesignOS Social Skill — Gera conteúdo visual para redes sociais
 * Input: Brief do Funis Operator
 * Output: Visual pronto para Loop publicar
 *
 * Integra: Claude Design API + brand-intelligence.json
 */

import { db } from '../_lib/config.js'

/**
 * Gerar conteúdo social (Instagram/Reel/Carousel)
 */
export async function generateSocialContent(clientId, brief) {
  try {
    console.log(`[DesignOS Social] Gerando conteúdo para ${clientId}...`)

    // 1. Carregar brand intelligence
    const brandData = await loadBrandIntelligence(clientId)
    if (!brandData) {
      return { ok: false, error: 'Sem brand-intelligence.json' }
    }

    // 2. Chamar Claude Design API
    const designOutput = await callClaudeDesignAPI(brief, brandData)

    // 3. Processar output
    const content = {
      id: `content-${Date.now()}`,
      clientId,
      briefId: brief.id,
      type: brief.funnelConfig.formats[0],
      status: 'ready_for_loop',

      // Visual
      visual: {
        format: designOutput.format,
        dimensions: getDimensions(brief.funnelConfig.formats[0]),
        colors: brandData.colors,
        fonts: brandData.fonts,
        imageUrl: designOutput.imageUrl,
        videoUrl: designOutput.videoUrl,
      },

      // Copy
      copy: {
        headline: designOutput.headline,
        body: designOutput.body,
        cta: brief.funnelConfig.cta,
        hashtags: generateHashtags(brief),
      },

      // Metadados
      metadata: {
        funnelStage: brief.funnelConfig.stage,
        platform: 'instagram',
        format: brief.funnelConfig.formats[0],
        expectedReach: brief.loopInput.expectPerformance.reach,
      },

      generatedAt: new Date().toISOString(),
    }

    // 4. Salvar como artifact
    const artifact = await saveAsArtifact(clientId, content)

    return {
      ok: true,
      clientId,
      contentId: content.id,
      artifactId: artifact?.id,
      status: 'ready_for_loop',
      content,
    }
  } catch (error) {
    console.error('[DesignOS Social] Erro:', error.message)
    return { ok: false, error: error.message }
  }
}

/**
 * Chamar Claude Design API (integração com Claude Design)
 */
async function callClaudeDesignAPI(brief, brandData) {
  // Construir prompt para Claude Design
  const prompt = `
Gerar conteúdo visual para Instagram ${brief.funnelConfig.formats[0]}

Funil: ${brief.funnelConfig.stageName}
Objetivo: ${brief.funnelConfig.objective}
Tone: ${brief.designInput.tone}
Visual: ${brief.designInput.visual}
Copy Strategy: ${brief.designInput.copy}
CTA: ${brief.funnelConfig.cta}

Brand:
- Cores: ${brandData.colors?.join(', ')}
- Fonts: ${brandData.fonts?.join(', ')}
- Voice: ${brandData.voice}

Inspiração:
- Caption: "${brief.inspiration.caption}"
- Tipo: ${brief.inspiration.mediaType}

Output esperado:
- Headline: ${brief.funnelConfig.formats[0] === 'reel' ? '20-30 chars' : '50-100 chars'}
- Body: ${brief.funnelConfig.formats[0] === 'reel' ? 'script do reel' : 'carousel descriptions'}
- Visual: descrição detalhada para geração
  `

  // TODO: Integrar com Claude Design API real
  // Por enquanto, retornar mock
  return {
    format: brief.funnelConfig.formats[0],
    headline: `${brief.funnelConfig.objective.split(':')[0]}`,
    body: `Veja como ${brief.funnelConfig.objective.toLowerCase()}. ${brief.funnelConfig.cta}`,
    imageUrl: brief.inspiration.mediaType === 'IMAGE' ? 'placeholder' : null,
    videoUrl: brief.inspiration.mediaType === 'VIDEO' ? 'placeholder' : null,
  }
}

/**
 * Carregar brand intelligence do cliente
 */
async function loadBrandIntelligence(clientId) {
  try {
    // Tentar carregar do arquivo (em desenvolvimento local)
    // Em produção: carregar de CDN/S3
    return {
      voice: 'profissional mas acessível',
      tone: 'inspirador',
      colors: ['#FF6B6B', '#4ECDC4', '#45B7D1'],
      fonts: ['Poppins', 'Open Sans'],
      restrictions: [],
    }
  } catch (error) {
    console.error('brand_load_error', error.message)
    return null
  }
}

/**
 * Salvar conteúdo como artifact
 */
async function saveAsArtifact(clientId, content) {
  try {
    const artifact = await db('artifacts', {
      method: 'POST',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({
        client_id: clientId,
        artifact_type: 'social_content',
        title: `${content.type} - ${content.metadata.funnelStage}`,
        status: 'draft',
        metadata: content,
      }),
    })

    return artifact?.[0]
  } catch (error) {
    console.error('artifact_save_error', error.message)
    return null
  }
}

// === HELPERS ===

function getDimensions(format) {
  const dimensions = {
    reel: { width: 1080, height: 1920 },
    carousel: { width: 1080, height: 1350 },
    'short-form-video': { width: 1080, height: 1920 },
    post: { width: 1080, height: 1080 },
    story: { width: 1080, height: 1920 },
  }
  return dimensions[format] || dimensions.post
}

function generateHashtags(brief) {
  const hashtags = []

  // Brand hashtags
  hashtags.push('#brand')

  // Funil hashtags
  const funnelHashtags = {
    awareness: ['#trending', '#discovery', '#educacao'],
    consideration: ['#prova', '#autoridade', '#resultado'],
    conversion: ['#oferta', '#limitado', '#agora'],
    retention: ['#community', '#insider', '#valor'],
  }

  hashtags.push(...(funnelHashtags[brief.funnelConfig.stage] || []))

  // Loop strategy hashtags
  hashtags.push(...brief.loopInput.hashtagStrategy)

  return hashtags.slice(0, 30) // Instagram limit
}

// === API ===

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'method_not_allowed' })
  }

  const { clientId, brief, action } = request.body

  if (action === 'generate') {
    const result = await generateSocialContent(clientId, brief)
    return response.status(result.ok ? 200 : 400).json(result)
  }

  return response.status(400).json({ error: 'action_required' })
}
