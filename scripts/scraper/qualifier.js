'use strict';

/**
 * qualifier.js — Score de 0 a 10 baseado na análise do site + Instagram.
 * Problema = oportunidade. Mais gaps visíveis → maior score.
 */

function score(analysis) {
  let points = 0;
  const problems = [];

  const site = analysis.site;
  const ig   = analysis.instagram;

  // ── SITE ──────────────────────────────────────────────────────────────────
  if (site) {
    if (!site.loads) {
      points += 3;
      problems.push('Site fora do ar ou muito lento');
    } else {
      if (!site.has_cta) {
        points += 2;
        problems.push('Sem CTA visível no site');
      }
      if (!site.has_whatsapp) {
        points += 1;
        problems.push('Sem botão WhatsApp');
      }
      if (!site.has_form) {
        points += 1;
        problems.push('Sem formulário de captação');
      }
      if (site.problems.includes('headline_generica')) {
        points += 1;
        problems.push('Headline genérica — não diferencia');
      }
      if (site.problems.includes('seo_fraco')) {
        points += 1;
        problems.push('SEO fraco — invisível no Google');
      }
      if (!site.has_team_photo) {
        points += 0.5;
        problems.push('Sem rosto humano no site');
      }
    }
  } else {
    points += 4;
    problems.push('Sem site — completamente invisível no digital');
  }

  // ── INSTAGRAM ─────────────────────────────────────────────────────────────
  // Só pontuamos o que VERIFICAMOS de fato. Instagram não encontrado no site,
  // privado, bloqueado por login ou não analisado = DESCONHECIDO — não vira
  // score nem observação. Evita afirmar uma ausência que não confirmamos
  // (e que apareceria como observação falsa na copy de 1º contato).
  if (ig && ig.accessible) {
    if (!ig.has_bio_link) {
      points += 1;
      problems.push('Instagram sem link na bio');
    }
    if (!ig.has_cta_bio) {
      points += 0.5;
      problems.push('Bio sem CTA');
    }
  }

  points = Math.min(Math.round(points * 10) / 10, 10);

  // Régua recalibrada após remover o bônus fantasma de Instagram (+1.5):
  // a escala real de um site que carrega mas tem gargalos mora em ~2.5–6.5.
  // Mantém DESCARTAR só para quem quase não tem gap explorável.
  let label, priority;
  if (points >= 5)        { label = 'QUENTE';    priority = 1; }
  else if (points >= 3.5) { label = 'MORNO';     priority = 2; }
  else if (points >= 2.5) { label = 'FRIO';      priority = 3; }
  else                    { label = 'DESCARTAR'; priority = 4; }

  const main_problem = problems[0] || 'presença digital fraca';

  return {
    score: points,
    label,
    priority,
    problems,
    main_problem,
    recommendation: getRecommendation(label, main_problem),
  };
}

function getRecommendation(label, firstProblem) {
  if (label === 'DESCARTAR') return null;

  if (/fora do ar|offline/i.test(firstProblem)) {
    return 'Abordagem de urgência — site offline é dor imediata';
  }
  if (/sem site/i.test(firstProblem)) {
    return 'Proposta de entrada simples — landing page';
  }
  if (/CTA|WhatsApp/i.test(firstProblem)) {
    return 'Mostrar como captura de lead funciona na prática';
  }
  return 'Diagnóstico completo — mostrar o que está impedindo crescimento';
}

module.exports = { score };
