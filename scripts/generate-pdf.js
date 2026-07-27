#!/usr/bin/env node
// generate-pdf.js — converte um arquivo Markdown em PDF com o design system
// do MarketingOS (Cormorant Garamond + Inter, paleta configurável via --palette).
// Uso: node scripts/generate-pdf.js <input.md> <output.pdf> [--title "Título"] [--accent "#C9763A"]

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      args[a.slice(2)] = argv[i + 1];
      i++;
    } else {
      args._.push(a);
    }
  }
  return args;
}

function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function inline(md) {
  let s = escapeHtml(md);
  s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  return s;
}

function markdownToHtml(md) {
  const lines = md.split(/\r?\n/);
  let html = '';
  let inCodeBlock = false;
  let codeBuffer = [];
  let inList = false;
  let inQuote = false;

  const closeList = () => { if (inList) { html += '</ul>\n'; inList = false; } };
  const closeQuote = () => { if (inQuote) { html += '</blockquote>\n'; inQuote = false; } };

  for (const raw of lines) {
    const line = raw;

    if (line.trim().startsWith('```')) {
      if (!inCodeBlock) {
        closeList(); closeQuote();
        inCodeBlock = true;
        codeBuffer = [];
      } else {
        html += `<pre><code>${escapeHtml(codeBuffer.join('\n'))}</code></pre>\n`;
        inCodeBlock = false;
      }
      continue;
    }
    if (inCodeBlock) { codeBuffer.push(line); continue; }

    if (line.trim() === '---') { closeList(); closeQuote(); html += '<hr/>\n'; continue; }
    if (line.trim() === '') { closeList(); closeQuote(); continue; }

    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      closeList(); closeQuote();
      const level = h[1].length;
      html += `<h${level}>${inline(h[2])}</h${level}>\n`;
      continue;
    }

    if (line.trim().startsWith('>')) {
      closeList();
      if (!inQuote) { html += '<blockquote>\n'; inQuote = true; }
      html += `<p>${inline(line.replace(/^\s*>\s?/, ''))}</p>\n`;
      continue;
    }
    closeQuote();

    const li = line.match(/^\s*[-*]\s+(.*)$/);
    if (li) {
      if (!inList) { html += '<ul>\n'; inList = true; }
      html += `<li>${inline(li[1])}</li>\n`;
      continue;
    }
    closeList();

    html += `<p>${inline(line)}</p>\n`;
  }
  closeList(); closeQuote();
  if (inCodeBlock) html += `<pre><code>${escapeHtml(codeBuffer.join('\n'))}</code></pre>\n`;
  return html;
}

function buildDocument(bodyHtml, title, accent) {
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8"/>
<title>${escapeHtml(title)}</title>
<style>
  @page { size: A4; margin: 22mm 18mm; }
  * { box-sizing: border-box; }
  body {
    font-family: 'Inter', Arial, sans-serif;
    color: #2B2320;
    line-height: 1.55;
    font-size: 12.5px;
  }
  h1, h2, h3, h4 {
    font-family: 'Cormorant Garamond', Georgia, serif;
    color: ${accent};
    font-weight: 700;
    margin: 1.4em 0 0.4em;
    line-height: 1.2;
  }
  h1 { font-size: 30px; border-bottom: 2px solid ${accent}; padding-bottom: 8px; margin-top: 0; }
  h2 { font-size: 21px; margin-top: 1.8em; }
  h3 { font-size: 16px; }
  h4 { font-size: 13.5px; text-transform: uppercase; letter-spacing: 0.03em; }
  p { margin: 0.5em 0; }
  ul { margin: 0.4em 0 0.8em; padding-left: 1.3em; }
  li { margin: 0.25em 0; }
  code { background: #F3EDE3; padding: 1px 5px; border-radius: 3px; font-size: 0.92em; }
  pre {
    background: #2B2320;
    color: #FAF6EF;
    padding: 12px 14px;
    border-radius: 6px;
    overflow-x: auto;
    font-size: 11.5px;
    white-space: pre-wrap;
  }
  pre code { background: none; color: inherit; padding: 0; }
  blockquote {
    border-left: 3px solid ${accent};
    margin: 0.8em 0;
    padding: 2px 14px;
    color: #6B5E52;
    font-style: italic;
  }
  hr { border: none; border-top: 1px solid #D4C5A9; margin: 1.6em 0; }
  strong { color: #2B2320; }
  .footer {
    margin-top: 2em;
    padding-top: 10px;
    border-top: 1px solid #D4C5A9;
    font-size: 9.5px;
    color: #9A8C7A;
  }
</style>
</head>
<body>
${bodyHtml}
<div class="footer">Gerado por MarketingOS — ${new Date().toLocaleDateString('pt-BR')}</div>
</body>
</html>`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const [inputPath, outputPath] = args._;
  if (!inputPath || !outputPath) {
    console.error('Uso: node scripts/generate-pdf.js <input.md> <output.pdf> [--title "Título"] [--accent "#C9763A"]');
    process.exit(1);
  }
  const md = fs.readFileSync(inputPath, 'utf-8');
  const title = args.title || path.basename(inputPath, '.md');
  const accent = args.accent || '#C9763A';
  const bodyHtml = markdownToHtml(md);
  const doc = buildDocument(bodyHtml, title, accent);

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent(doc, { waitUntil: 'networkidle' });
  await page.pdf({ path: outputPath, format: 'A4', printBackground: true, margin: { top: '0', bottom: '0', left: '0', right: '0' } });
  await browser.close();
  console.log(`PDF gerado: ${outputPath}`);
}

main().catch((err) => { console.error(err); process.exit(1); });
