#!/usr/bin/env node
'use strict';

/**
 * plan-week.js — Planejador da agenda semanal de conteúdo (70/20/10).
 *
 * NÃO inventa tema: rotaciona o banco de temas da DOUTRINA (virada-aquisicao.md
 * — problemas universais, build in public, casos). Pondera o FORMATO pelo que
 * as métricas reais mostraram (metrics.json: formato com mais alcance entra
 * primeiro). Escreve em clients/<slug>/agenda.json preservando peças que já
 * saíram de 'planned' (prepared/published/measured/drafted).
 *
 * Uso: node scripts/agenda/plan-week.js --slug felipe-proenca [--week 2026-W26] [--n 5] [--dry-run]
 *
 * Regra "tudo é verdade": sem métricas, usa rotação default — não estima
 * performance que não existe.
 */

const fs = require('fs');
const path = require('path');

function arg(name, def) { const i = process.argv.indexOf(name); return i !== -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : def; }
const hasFlag = name => process.argv.includes(name);

// Banco de temas — direto da doutrina (virada-aquisicao.md). Não é invenção.
const THEMES = {
  universal: [
    'Aquisição imprevisível — você não sabe de onde vem o próximo cliente',
    'Marketing desconectado — peças soltas que nunca viram sistema',
    'Falta de posicionamento — competir por preço sem querer',
    'Dependência de indicação — crescimento que você não controla',
    'Falhas de follow-up — o lead que esfria e some',
    'Ausência de sistema — operar no escuro, sem medir aquisição',
    'Previsibilidade — transformar aquisição em algo que se planeja',
  ],
  'build-in-public': [
    'Build in public — uma decisão do sistema esta semana',
    'Build in public — um aprendizado de aquisição',
    'Build in public — bastidores de como o MarketingOS opera',
    'Build in public — um diagnóstico real (anonimizado)',
  ],
  caso: [
    'Caso — clínica: agenda cheia, zero previsibilidade',
    'Caso — advogado: autoridade sem captação',
    'Caso — consultor: dependência total de indicação',
  ],
};
const FORMATS = ['carrossel', 'reel', 'post'];

function isoWeek(d) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = date.getUTCDay() || 7; date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const wk = Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(wk).padStart(2, '0')}`;
}
function isoWeekMonday(weekStr) {
  const [y, w] = weekStr.split('-W').map(Number);
  const simple = new Date(Date.UTC(y, 0, 1 + (w - 1) * 7));
  const dow = simple.getUTCDay();
  const monday = new Date(simple);
  if (dow <= 4) monday.setUTCDate(simple.getUTCDate() - dow + 1);
  else monday.setUTCDate(simple.getUTCDate() + 8 - dow);
  return monday;
}

// Preferência de formato a partir de métricas reais (alcance por tipo).
function formatPreference(metricsPath) {
  try {
    const m = JSON.parse(fs.readFileSync(metricsPath, 'utf8'));
    const posts = (m.instagram_organic && m.instagram_organic.top_posts) || [];
    if (!posts.length) return null;
    const reach = {};
    for (const p of posts) { const t = (p.type || '').toLowerCase(); reach[t] = (reach[t] || 0) + (p.reach || 0); }
    const map = { feed: 'carrossel', carousel: 'carrossel', reel: 'reel', reels: 'reel', video: 'reel' };
    const best = Object.entries(reach).sort((a, b) => b[1] - a[1])[0];
    return best ? (map[best[0]] || null) : null;
  } catch { return null; }
}

function main() {
  const slug = arg('--slug', 'felipe-proenca');
  const N = parseInt(arg('--n', '5'), 10);
  const root = path.resolve(__dirname, '../..');
  const agendaPath = path.join(root, 'clients', slug, 'agenda.json');
  const metricsPath = path.join(root, 'clients', slug, 'metrics.json');
  const week = arg('--week', isoWeek(new Date()));

  const agenda = fs.existsSync(agendaPath) ? JSON.parse(fs.readFileSync(agendaPath, 'utf8')) : { _meta: {}, week, items: [] };
  agenda.items = agenda.items || [];

  // Preserva peças reais (já saíram de planned) desta semana; regenera as planned.
  const keep = agenda.items.filter(i => i.week === week && i.status !== 'planned');
  const others = agenda.items.filter(i => i.week !== week);
  const usedThemes = new Set(keep.map(i => i.problema));

  // Distribuição 70/20/10.
  const caso = Math.round(0.1 * N), bip = Math.round(0.2 * N), universal = N - caso - bip;
  const need = { universal, 'build-in-public': bip, caso };
  for (const k of keep) need[k.bucket] = Math.max(0, (need[k.bucket] || 0) - 1);

  const prefFmt = formatPreference(metricsPath);
  const fmtRotation = prefFmt ? [prefFmt, ...FORMATS.filter(f => f !== prefFmt)] : FORMATS;

  const monday = isoWeekMonday(week);
  const dayOffsets = [0, 2, 4, 5, 6]; // seg, qua, sex, sáb, dom
  const now = new Date();
  const generated = [];
  let slot = keep.length, fmtI = 0;
  for (const bucket of ['universal', 'build-in-public', 'caso']) {
    const pool = THEMES[bucket].filter(t => !usedThemes.has(t));
    for (let c = 0; c < (need[bucket] || 0); c++) {
      const problema = pool[(c) % pool.length] || THEMES[bucket][c % THEMES[bucket].length];
      usedThemes.add(problema);
      const when = new Date(monday); when.setUTCDate(monday.getUTCDate() + (dayOffsets[slot % dayOffsets.length])); when.setUTCHours(22, 0, 0, 0); // 19:00 BRT
      if (when < now) when.setTime(now.getTime() + (generated.length + 1) * 3600000);
      generated.push({
        id: `${week.toLowerCase()}-${String(slot + 1).padStart(2, '0')}`,
        week, bucket, problema,
        formato: bucket === 'build-in-public' ? 'reel' : fmtRotation[fmtI++ % fmtRotation.length],
        hook: null, status: 'planned', draftPath: null, caption: null,
        scheduledAt: when.toISOString().slice(0, 16), publishedAt: null, postId: null, metrics: null,
      });
      slot++;
    }
  }

  agenda.week = week;
  agenda._meta = { ...(agenda._meta || {}), slug, doctrine: 'virada-aquisicao.md 70/20/10', distribution: { universal: 0.7, 'build-in-public': 0.2, caso: 0.1 }, updatedAt: new Date().toISOString().slice(0, 10), formatPreference: prefFmt || 'rotação default (sem métricas)' };
  agenda.items = [...others, ...keep, ...generated].sort((a, b) => String(a.scheduledAt).localeCompare(String(b.scheduledAt)));

  console.log(`\n🗓️  Agenda ${week} — ${slug}`);
  console.log(`   Distribuição: ${universal} universal · ${bip} build-in-public · ${caso} caso  (mantidas ${keep.length} peças reais)`);
  console.log(`   Formato preferido (métricas): ${prefFmt || 'sem dado — rotação default'}`);
  generated.forEach(i => console.log(`   + [${i.bucket}] ${i.formato} · ${i.problema.slice(0, 56)}`));

  if (hasFlag('--dry-run')) { console.log('\n   [DRY-RUN] nada gravado.'); return; }
  fs.writeFileSync(agendaPath, JSON.stringify(agenda, null, 2), 'utf8');
  console.log(`\n   ✓ Gravado: clients/${slug}/agenda.json`);
}

main();
