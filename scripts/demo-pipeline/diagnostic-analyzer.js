'use strict';

/**
 * diagnostic-analyzer.js — MarketingOS
 *
 * Recebe um lead enriquecido e retorna 3 achados reais baseados nos sinais
 * detectados no digital daquele negócio: Instagram, WhatsApp, site, categoria.
 *
 * Cada achado é diferente por lead — não é template genérico.
 */

// Mapa de categorias para linguagem de nicho
const NICHE_COPY = {
  clinica:    { paciente: 'paciente',   setor: 'clínica' },
  estetica:   { paciente: 'cliente',    setor: 'clínica' },
  odonto:     { paciente: 'paciente',   setor: 'consultório' },
  advogado:   { paciente: 'cliente',    setor: 'escritório' },
  contabil:   { paciente: 'cliente',    setor: 'escritório' },
  seguro:     { paciente: 'cliente',    setor: 'corretora' },
  pet:        { paciente: 'tutor',      setor: 'clínica' },
  default:    { paciente: 'cliente',    setor: 'negócio' },
};

function detectNiche(category) {
  const c = (category || '').toLowerCase();
  if (/clínica|médic|saúde|dermato|estética|estet/i.test(c)) return 'clinica';
  if (/odonto|dentist/i.test(c)) return 'odonto';
  if (/advogad|advocaci|jurídic/i.test(c)) return 'advogado';
  if (/contábil|contabilidade|contador/i.test(c)) return 'contabil';
  if (/seguro|corretora/i.test(c)) return 'seguro';
  if (/pet|veterinár/i.test(c)) return 'pet';
  return 'default';
}

/**
 * Gera 3 achados prioritários baseados no que foi encontrado no digital do lead.
 * Retorna array de { id, title, detail, severity: 'alta'|'media'|'baixa', icon }
 */
function analyze(lead) {
  const niche = detectNiche(lead.category);
  const { paciente, setor } = NICHE_COPY[niche] || NICHE_COPY.default;
  const nome = (lead.name || 'o negócio').split(/[,\-\|(\[]/)[0].trim();

  const findings = [];

  // ── Instagram ───────────────────────────────────────────────────────────────
  if (!lead.instagram) {
    findings.push({
      id: 'no_instagram',
      title: 'Sem Instagram ativo detectado',
      detail: `${paciente.charAt(0).toUpperCase() + paciente.slice(1)}s pesquisam no digital antes de ligar. Sem perfil ativo, a ${setor} depende 100% de indicação — crescimento imprevisível.`,
      severity: 'alta',
      icon: '⚡',
    });
  } else {
    findings.push({
      id: 'has_instagram',
      title: `Instagram encontrado — mas presença não é captação`,
      detail: `O perfil ${lead.instagram} existe. Mas ter Instagram não garante ${paciente} novo. A maioria das contas publica sem estratégia de conversão.`,
      severity: 'media',
      icon: '📱',
    });
  }

  // ── Site / WhatsApp CTA ─────────────────────────────────────────────────────
  if (!lead.website) {
    findings.push({
      id: 'no_website',
      title: 'Sem site próprio',
      detail: `Sem página própria, ${paciente}s que pesquisam no Google não encontram a ${setor} — chegam no concorrente primeiro.`,
      severity: 'alta',
      icon: '⚡',
    });
  } else if (!lead.hasWhatsappCta) {
    findings.push({
      id: 'no_whatsapp_cta',
      title: 'Site sem botão de WhatsApp',
      detail: `O site existe mas não converte. ${paciente.charAt(0).toUpperCase() + paciente.slice(1)} chega na página e não tem um próximo passo claro — abandona sem entrar em contato.`,
      severity: 'alta',
      icon: '⚡',
    });
  } else {
    findings.push({
      id: 'has_whatsapp',
      title: 'WhatsApp no site detectado — mas falta o topo do funil',
      detail: `Bom: o site captura quem já chegou. O problema é atrair quem ainda não chegou. Sem captação ativa, o botão de WhatsApp fica subutilizado.`,
      severity: 'media',
      icon: '📲',
    });
  }

  // ── Captação previsível (sempre terceiro achado) ─────────────────────────────
  findings.push({
    id: 'no_predictable_acquisition',
    title: 'Crescimento depende de indicação — não de sistema',
    detail: `Cada novo ${paciente} é uma variável fora do controle do ${setor}. Sem captação própria ativa, não dá para prever o próximo mês — nem escalar.`,
    severity: 'alta',
    icon: '⚡',
  });

  return findings.slice(0, 3);
}

/**
 * Gera a mensagem de WhatsApp personalizada para o lead.
 */
function whatsappMessage(lead) {
  const nome = (lead.name || 'vocês').split(/[,\-\|(\[]/)[0].trim();
  const niche = detectNiche(lead.category);
  const { paciente } = NICHE_COPY[niche] || NICHE_COPY.default;

  return (
    `Analisei o digital ${lead.instagram ? `(${lead.instagram})` : 'da ' + nome} e encontrei 3 pontos que estão impedindo novos ${paciente}s de chegar.\n\n` +
    `Separei aqui 👇\n\n` +
    `Posso mostrar como resolver em 15 minutos?`
  );
}

module.exports = { analyze, whatsappMessage, detectNiche };
