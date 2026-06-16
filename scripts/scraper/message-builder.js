'use strict';

/**
 * message-builder.js — Mensagem personalizada via Claude.
 *
 * Princípio do manifesto:
 * Não entramos para oferecer produto. Entramos para entregar resultado.
 * A mensagem prova que analisamos o negócio antes de dizer qualquer coisa.
 */

const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

const client = new Anthropic();
const PANEL_SETTINGS_FILE = path.resolve(__dirname, '../../agency/leads/scraper-panel-settings.json');

const SYSTEM_PROMPT = `Você é Felipe Proença — especialista em marketing digital com IA.

PROTOCOLO DE PRIMEIRO CONTATO — ETAPA 2:
Esta mensagem é o primeiro contato. Nunca pitch, nunca diagnóstico, nunca link, nunca imagem.
O objetivo é uma única coisa: fazer o lead responder com "sim, isso acontece aqui".

Tom: direto, humano, casual — como alguém que realmente viu o perfil deles.
Nunca: genérico, corporativo, parecer bot, mencionar o produto ou serviço.
Sempre: nomeie algo específico que você observou. Termine com pergunta.

Estrutura obrigatória (vale para TODAS as variantes):
1. "Oi!" — sem nome de empresa na primeira palavra
2. Uma observação específica sobre o que foi visto (Instagram, Maps, site, bio)
3. Uma frase que conecta a observação a uma consequência, sem julgamento e sem solução
4. Uma pergunta fechada sobre se isso está acontecendo com eles

Critério de qualidade (cada variante):
✓ Máximo 4 linhas
✓ Zero menção ao MarketingOS, ao Felipe, ao produto ou ao serviço
✓ Zero CTA de venda, zero link, zero imagem
✓ Termina com pergunta — não com proposta
✓ Não poderia ser enviada para outro negócio sem mudar
✓ Soa como pessoa real que passou pelo perfil deles

GERE TRÊS VARIANTES, cada uma com um ÂNGULO distinto:
- A · gargalo observado — nomeia um problema específico e a consequência dele.
- B · amplificação — reconhece o que já funciona e levanta o risco de não escalar (nunca diagnóstico de falha).
- C · curiosidade leve — observação + pergunta aberta, tom mais informal e curto.

RECOMENDAÇÃO DE PACOTE (para DEPOIS da resposta, nunca no 1º contato):
Com base no que foi observado, recomende se vale enviar um diagnóstico e/ou um vídeo curto.
- diagnóstico: faz sentido quando há site/perfil com material para analisar.
- vídeo: faz sentido quando o negócio é visual ou a explicação ganha com demonstração.

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

    const parsed = JSON.parse(match[0]);
    const variants = Array.isArray(parsed.variants) && parsed.variants.length
      ? parsed.variants.filter(v => v && v.whatsapp_version)
      : null;
    if (!variants || !variants.length) throw new Error('variants ausentes');

    const primary = variants[0].whatsapp_version;
    return {
      subject: '',
      body: primary,                       // e-mail usa a variante padrão
      whatsapp_version: primary,           // compat: consumidores leem este campo
      variants,                            // 3 ângulos para o operador escolher (A/B)
      recommended: normalizeRecommended(parsed.recommended),
    };

  } catch (err) {
    // Fallback humanizado se Claude falhar
    return buildFallback(lead, qualification);
  }
}

function normalizeRecommended(r = {}) {
  return {
    diagnosis: r.diagnosis === true,
    video: r.video === true,
    reason: typeof r.reason === 'string' ? r.reason.slice(0, 160) : '',
  };
}

function buildLeadContext(lead, site, qualification) {
  const panelContext = buildPanelContext(loadPanelSettings());
  return `NEGÓCIO ANALISADO:
  Nome: ${lead.name || 'não identificado'}
  Instagram: ${lead.instagram ? '@' + lead.instagram : 'não encontrado'}
  WhatsApp: ${lead.whatsapp || 'não encontrado'}
  Site carrega: ${site?.loads ? 'sim' : 'não'}
  Headline atual: "${site?.headline || 'não encontrada'}"

PROBLEMA PRINCIPAL OBSERVADO: ${qualification.main_problem}
OUTROS PROBLEMAS: ${qualification.problems.slice(1).join(' | ') || 'nenhum adicional'}

${panelContext}

Gere a mensagem de PRIMEIRO CONTATO seguindo o protocolo Etapa 2.
A mensagem vai por WhatsApp — deve soar humana e casual.

Retorne APENAS este JSON:
{
  "recommended": { "diagnosis": true, "video": false, "reason": "motivo curto" },
  "variants": [
    { "id": "A", "angle": "gargalo observado",  "whatsapp_version": "mensagem — máx 4 linhas, termina com pergunta" },
    { "id": "B", "angle": "amplificação",        "whatsapp_version": "mensagem — máx 4 linhas, termina com pergunta" },
    { "id": "C", "angle": "curiosidade leve",    "whatsapp_version": "mensagem — máx 4 linhas, termina com pergunta" }
  ]
}`;
}

function loadPanelSettings() {
  try {
    return JSON.parse(fs.readFileSync(PANEL_SETTINGS_FILE, 'utf8'));
  } catch {
    return null;
  }
}

function buildPanelContext(settings) {
  if (!settings) return '';

  const outputs = settings.outputs || {};
  const copy = settings.copy || {};
  const enabledOutputs = Object.entries(outputs)
    .filter(([, enabled]) => enabled === true)
    .map(([key]) => key)
    .join(', ') || 'whatsapp';

  return `DIRECAO DO PAINEL DE ENVIOS:
  Outputs planejados apos resposta: ${enabledOutputs}
  Angulo da copy: ${copy.angle || 'Nomear gargalo real observado.'}
  Tom: ${copy.tone || 'Direto, humano e casual.'}
  CTA: ${copy.cta || 'Terminar com pergunta simples.'}
  Modelo WhatsApp de referencia: "${copy.whatsapp || ''}"
  Observacoes: ${copy.notes || 'Nao enviar links, demos ou pitch no primeiro contato.'}

IMPORTANTE:
Mesmo que existam outputs planejados, o primeiro contato continua sem link, sem demo e sem pitch.
Use a direcao acima apenas para calibrar angulo, tom e pergunta.`;
}

function buildFallback(lead, qualification) {
  const problem = qualification?.main_problem || 'algo no posicionamento de vocês que pode estar travando conversas novas';
  const variants = [
    { id: 'A', angle: 'gargalo observado',
      whatsapp_version: `Oi! Dei uma olhada no perfil de vocês e reparei ${problem}. Costuma acontecer de cliente novo esbarrar nisso antes de chamar?` },
    { id: 'B', angle: 'amplificação',
      whatsapp_version: `Oi! Vi que vocês já têm um trabalho bom rodando — só senti que ${problem} pode estar segurando o quanto isso poderia crescer. Faz sentido pra vocês?` },
    { id: 'C', angle: 'curiosidade leve',
      whatsapp_version: `Oi! Passei pelo perfil de vocês e fiquei com uma dúvida: hoje cliente novo chega mais por indicação ou tem vindo de fora também?` },
  ];
  return {
    subject: '',
    body: variants[0].whatsapp_version,
    whatsapp_version: variants[0].whatsapp_version,
    variants,
    recommended: { diagnosis: Boolean(lead.website || lead.domain), video: false, reason: 'fallback' },
  };
}

module.exports = { build };
