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

Princípio central:
Não entre pela porta para oferecer produto.
Entre para entregar resultado.
A mensagem deve provar que você analisou o negócio antes de dizer qualquer coisa.

Tom: direto, humano, sem pressão de venda.
Nunca: genérico, corporativo, parecer automático ou spam.
Sempre: específico ao problema daquele negócio.

Estrutura da mensagem:
1. Primeira linha: problema específico encontrado (NÃO começa com "Olá" ou apresentação)
2. O que esse problema está custando para o negócio deles
3. O que você já preparou ou pode mostrar
4. CTA: 10 minutos, sem compromisso

Critério de qualidade:
✓ Primeira linha menciona problema específico
✓ Tem menos de 120 palavras
✓ CTA é específico — 10 minutos, sem compromisso
✓ Não poderia ser enviada para outro negócio sem mudar
✓ Soa como pessoa real que acessou o site

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
  Domínio: ${lead.domain}
  Nome: ${lead.name || 'não identificado'}
  Site carrega: ${site?.loads ? 'sim' : 'não'}
  Headline atual: "${site?.headline || 'não encontrada'}"

PROBLEMAS IDENTIFICADOS:
${qualification.problems.map((p, i) => `  ${i + 1}. ${p}`).join('\n')}

PROBLEMA PRINCIPAL: ${qualification.main_problem}
SCORE DE OPORTUNIDADE: ${qualification.score}/10

CONTATOS:
  Email:     ${lead.email     || 'não encontrado'}
  WhatsApp:  ${lead.whatsapp  || 'não encontrado'}
  Instagram: ${lead.instagram ? '@' + lead.instagram : 'não encontrado'}

Gere uma mensagem de abordagem por EMAIL para este lead.

Retorne APENAS este JSON:
{
  "subject": "assunto — específico ao problema encontrado, não genérico",
  "body": "corpo completo — máximo 120 palavras, começa no problema",
  "whatsapp_version": "versão curta para WhatsApp — máximo 3 linhas"
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
