'use strict';

/**
 * message-builder.js — Mensagem personalizada via Claude.
 *
 * Princípio do manifesto:
 * Não entramos para oferecer produto. Entramos para entregar resultado.
 * A mensagem prova que analisamos o negócio antes de dizer qualquer coisa.
 */

const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic();

const SYSTEM_PROMPT = `Você é Felipe Proença — especialista em marketing digital com IA.

PROTOCOLO DE PRIMEIRO CONTATO — ETAPA 2:
Esta mensagem é o primeiro contato. Nunca pitch, nunca diagnóstico, nunca link, nunca imagem.
O objetivo é uma única coisa: fazer o lead responder com "sim, isso acontece aqui".

Tom: direto, humano, casual — como alguém que realmente viu o perfil deles.
Nunca: genérico, corporativo, parecer bot, mencionar o produto ou serviço.
Sempre: nomeie UM problema específico que você observou. Termine com pergunta.

Estrutura obrigatória:
1. "Oi!" — sem nome de empresa na primeira palavra
2. Uma observação específica sobre o que foi visto (Instagram, Maps, site, bio)
3. Uma frase que nomeia o problema sem julgamento e sem solução
4. Uma pergunta fechada sobre se isso está acontecendo com eles

Critério de qualidade:
✓ Máximo 4 linhas no total
✓ Zero menção ao MarketingOS, ao Felipe, ao produto ou ao serviço
✓ Zero CTA de venda, zero link, zero imagem
✓ Termina com pergunta — não com proposta
✓ Não poderia ser enviada para outro negócio sem mudar
✓ Soa como pessoa real que passou pelo perfil deles

Retorne APENAS JSON válido, sem markdown, sem explicações.`;

async function build(lead) {
  const { analysis, qualification } = lead;
  const site = analysis.site;

  const leadContext = buildLeadContext(lead, site, qualification);

  try {
    const response = await client.messages.create({
      model:      'claude-sonnet-4-6',
      max_tokens: 600,
      system: [
        {
          type: 'text',
          text: SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [
        {
          role:    'user',
          content: leadContext,
        },
      ],
    });

    const text  = response.content[0].text;
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('JSON não encontrado na resposta');

    return JSON.parse(match[0]);

  } catch (err) {
    // Fallback humanizado se Claude falhar
    return buildFallback(lead, qualification);
  }
}

function buildLeadContext(lead, site, qualification) {
  return `NEGÓCIO ANALISADO:
  Nome: ${lead.name || 'não identificado'}
  Instagram: ${lead.instagram ? '@' + lead.instagram : 'não encontrado'}
  WhatsApp: ${lead.whatsapp || 'não encontrado'}
  Site carrega: ${site?.loads ? 'sim' : 'não'}
  Headline atual: "${site?.headline || 'não encontrada'}"

PROBLEMA PRINCIPAL OBSERVADO: ${qualification.main_problem}
OUTROS PROBLEMAS: ${qualification.problems.slice(1).join(' | ') || 'nenhum adicional'}

Gere a mensagem de PRIMEIRO CONTATO seguindo o protocolo Etapa 2.
A mensagem vai por WhatsApp — deve soar humana e casual.

Retorne APENAS este JSON:
{
  "subject": "não usado — manter campo vazio",
  "body": "versão para email — mesmo conteúdo do whatsapp_version",
  "whatsapp_version": "mensagem de primeiro contato — máximo 4 linhas, termina com pergunta"
}`;
}

function buildFallback(lead, qualification) {
  const domain = lead.domain || 'seu negócio';
  return {
    subject: `Vi algo no site da ${domain} que vale 10 min`,
    body: `Analisei o site de vocês e encontrei: ${qualification.main_problem}. Isso está impactando diretamente a captação de novos clientes.\n\nPreparei algo específico para mostrar como resolver. São 10 minutos, sem compromisso.\n\nPosso te mandar?\n\nFelipe Proença\nMarketingOS`,
    whatsapp_version: `Oi, analisei o site de vocês e encontrei algo que está custando clientes todo mês. São 10 min pra mostrar. Posso?\n\nFelipe — MarketingOS`,
  };
}

module.exports = { build };
