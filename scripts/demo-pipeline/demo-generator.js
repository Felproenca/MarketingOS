'use strict';

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { analyze } = require('./diagnostic-analyzer');

const TEMPLATE_DIR = path.join(__dirname, 'templates');

const COPY = {
  clinica: {
    eyebrow: 'Para clínicas que querem crescer',
    headline: 'Sua agenda<br>merece estar<br><em>sempre cheia.</em>',
    sub: 'Cada paciente que chega por indicação poderia ter chegado pelo digital. <strong>Com sistema — não com sorte.</strong>',
    card1: 'Por que sua agenda ainda depende de indicação?',
    card2: '3 sinais de que seu digital não está convertendo',
    card3: 'O que muda quando você tem captação própria',
  },
  b2b: {
    eyebrow: 'Para negócios que já entregam bem',
    headline: 'Sua expertise<br>precisa ser<br><em>vista.</em>',
    sub: 'Você entrega. Mas quem não aparece não é considerado. <strong>Autoridade se constrói — não se declara.</strong>',
    card1: 'Por que seu concorrente aparece antes de você',
    card2: 'Como transformar expertise em captação previsível',
    card3: 'O que separa quem cresce de quem espera indicação',
  },
};

function buildHtml(segment, brand, lead) {
  const templateFile = path.join(TEMPLATE_DIR, 'post.html');
  if (!fs.existsSync(templateFile)) {
    throw new Error('Template post.html não encontrado');
  }

  const copy = COPY[segment] || COPY.b2b;
  let html = fs.readFileSync(templateFile, 'utf8');

  const name = brand.name || lead.name || 'Sua Empresa';
  const color = brand.color || '#2563eb';

  const handle = '@' + name
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 20);

  html = html.replace(/\{\{NAME\}\}/g, name);
  html = html.replace(/\{\{COLOR\}\}/g, color);
  html = html.replace(/\{\{HANDLE\}\}/g, handle);
  html = html.replace(/\{\{EYEBROW\}\}/g, copy.eyebrow);
  html = html.replace(/\{\{HEADLINE\}\}/g, copy.headline);
  html = html.replace(/\{\{SUB\}\}/g, copy.sub);
  html = html.replace(/\{\{CARD_1\}\}/g, copy.card1);
  html = html.replace(/\{\{CARD_2\}\}/g, copy.card2);
  html = html.replace(/\{\{CARD_3\}\}/g, copy.card3);

  return html;
}

function buildDiagnosticHtml(lead) {
  const templateFile = path.join(TEMPLATE_DIR, 'diagnostico.html');
  if (!fs.existsSync(templateFile)) throw new Error('Template diagnostico.html não encontrado');

  const findings = analyze(lead);
  const niche = require('./diagnostic-analyzer').detectNiche(lead.category);
  const NICHE_COPY = {
    clinica: 'paciente', estetica: 'cliente', odonto: 'paciente',
    advogado: 'cliente', contabil: 'cliente', seguro: 'cliente',
    pet: 'tutor', default: 'cliente',
  };
  const paciente = NICHE_COPY[niche] || 'cliente';
  const nomeShort = (lead.name || 'empresa').split(/[,\-\|(\[]/)[0].trim().slice(0, 30);

  let html = fs.readFileSync(templateFile, 'utf8');
  html = html.replace(/\{\{FINDING_COUNT\}\}/g, String(findings.length));
  html = html.replace(/\{\{PACIENTE\}\}/g, paciente);
  html = html.replace(/\{\{NOME_SHORT\}\}/g, nomeShort);

  findings.forEach((f, i) => {
    const n = i + 1;
    html = html.replace(new RegExp(`\\{\\{F${n}_SEVERITY\\}\\}`, 'g'), f.severity);
    html = html.replace(new RegExp(`\\{\\{F${n}_ICON\\}\\}`, 'g'), f.icon);
    html = html.replace(new RegExp(`\\{\\{F${n}_TITLE\\}\\}`, 'g'), f.title);
    html = html.replace(new RegExp(`\\{\\{F${n}_DETAIL\\}\\}`, 'g'), f.detail);
  });

  return html;
}

async function generateDemo(segment, brand, outputDir, prefix, lead = {}) {
  fs.mkdirSync(outputDir, { recursive: true });

  const isDiagnostico = segment === 'diagnostico';
  const html = isDiagnostico ? buildDiagnosticHtml(lead) : buildHtml(segment, brand, lead);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.setViewportSize({ width: 1080, height: 1080 });
  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  const suffix = isDiagnostico ? 'diagnostico' : 'post';
  const outPath = path.join(outputDir, `${prefix}-${suffix}.png`);
  await page.screenshot({ path: outPath });
  await browser.close();

  return [outPath];
}

module.exports = { generateDemo };
