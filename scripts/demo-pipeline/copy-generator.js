'use strict';

const Anthropic = require('@anthropic-ai/sdk');

const SYSTEM_PROMPT = `Você é um especialista em diagnóstico de marketing digital para negócios brasileiros.
Analisa dados reais de um negócio e gera copy personalizado para 3 slides de uma proposta comercial visual.

Regras:
- Seja específico a esse negócio — nunca genérico
- Use linguagem direta, sem jargões de marketing
- Tom consultivo e provocador, não vendedor
- Nunca invente dados — trabalhe com o que foi fornecido
- O slide 3 (desejo) ativa emoção, não lista features
- Gaps devem ser baseados nos sinais reais fornecidos

Formato de saída: JSON puro, sem markdown, sem explicações.`;

async function generateCopy(segment, lead, brand, content = {}) {
  const client = new Anthropic();
  const signals = brand.signals || {};
  const segmentLabel = segment === 'clinica' ? 'Clínica / saúde / estética' : 'B2B / serviço profissional';

  const contextLines = [
    `Negócio: ${brand.name || lead.name}`,
    `Segmento: ${segmentLabel}`,
    `Site: ${lead.website || 'não disponível'}`,
    `Avaliação Google: ${lead.rating ? `${lead.rating}★ (${lead.reviewCount || '?'} avaliações)` : 'não disponível'}`,
    `Instagram: ${signals.hasInstagram ? 'sim' : 'não identificado'}`,
    `WhatsApp no site: ${signals.hasWhatsapp ? 'sim' : 'não identificado'}`,
    `Blog/conteúdo: ${signals.hasBlog ? 'sim' : 'não'}`,
    `Formulário de contato: ${signals.hasContactForm ? 'sim' : 'não'}`,
    content.metaDescription ? `Descrição do site: ${content.metaDescription}` : null,
    content.h1 ? `Título principal do site: ${content.h1}` : null,
    content.heroText ? `Texto destaque do site: ${content.heroText}` : null,
    content.services?.length ? `Serviços identificados: ${content.services.slice(0, 6).join(', ')}` : null,
  ].filter(Boolean).join('\n');

  const userPrompt = `Analise os dados e gere o copy para os 3 slides. Retorne APENAS JSON válido neste formato exato (os valores são HTML inline — use <br> para quebra de linha, <em> para destaque na cor da marca, <i> para destaque dourado itálico, <strong> para negrito):

{
  "gaps": [
    {"title": "título curto do gap 1 (máx 8 palavras)", "desc": "impacto real em 1 frase (máx 20 palavras)"},
    {"title": "título curto do gap 2 (máx 8 palavras)", "desc": "impacto real em 1 frase (máx 20 palavras)"},
    {"title": "título curto do gap 3 (máx 8 palavras)", "desc": "impacto real em 1 frase (máx 20 palavras)"}
  ],
  "postHeadline": "headline do post em 3 linhas com <br>, use <em> em 1 palavra para destaque",
  "postSub": "subtítulo do post, 1-2 frases diretas, sem HTML",
  "postCaption": "legenda do post, 3 parágrafos curtos separados por <br><br>, use <strong> em 1 palavra por parágrafo",
  "desireHeadline": "frase de desejo em 3-4 linhas com <br>, comece com <em>verbo</em> ou <em>Imagine</em>, última linha use <i>frase curta.</i>",
  "desireSub": "frase de suporte 1-2 linhas, pode usar <strong> em 1 trecho"
}

Dados do negócio:
${contextLines}`;

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
    messages: [{ role: 'user', content: userPrompt }],
  });

  const raw = message.content[0].text.trim().replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  return JSON.parse(raw);
}

module.exports = { generateCopy };
