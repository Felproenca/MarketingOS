#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CLIENTS_DIR = path.join(ROOT, 'clients');

function fail(message) {
  console.error(message);
  process.exit(1);
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function readJsonIfExists(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function isHexColor(value) {
  return typeof value === 'string' && /^#([0-9A-Fa-f]{6})$/.test(value.trim());
}

function pickColor(value, fallback) {
  return isHexColor(value) ? value.trim() : fallback;
}

function pickFont(value, fallback) {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}

function parseArgs(argv) {
  const result = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) {
      continue;
    }
    const key = token.slice(2);
    const value = argv[i + 1];
    if (!value || value.startsWith('--')) {
      result[key] = 'true';
      continue;
    }
    result[key] = value;
    i += 1;
  }
  return result;
}

function formatDate() {
  const now = new Date();
  return now.toISOString().slice(0, 10);
}

function nowTimestamp() {
  return new Date().toISOString().replace('T', ' ').slice(0, 16);
}

function buildSlides(tema, objetivo, cta, slidesCount) {
  const slides = [];
  slides.push({
    type: 'GANCHO',
    title: `Pare de perder resultado com ${tema}`,
    body: 'Quando o assunto e crescimento, consistencia vence improviso.',
  });
  slides.push({
    type: 'CONTEXTO',
    title: `O erro mais comum em ${tema}`,
    body: 'Publicar sem narrativa clara gera alcance vazio e pouca conversao.',
  });

  for (let i = 3; i <= slidesCount - 2; i += 1) {
    slides.push({
      type: `PONTO ${i - 2}`,
      title: `Passo ${i - 2}: ajuste pratico`,
      body: `Conecte o tema "${tema}" com uma dor real da persona e um proximo passo objetivo.`,
    });
  }

  slides.push({
    type: 'INSIGHT',
    title: `Sem processo, ${objetivo.toLowerCase()} vira loteria`,
    body: 'Um bom carrossel guia a pessoa da identificacao para a acao.',
  });

  slides.push({
    type: 'CTA',
    title: cta,
    body: 'Se isso fez sentido, salve e aplique no proximo conteudo.',
  });

  return slides.slice(0, slidesCount);
}

function buildCopyMd(meta, slides) {
  const lines = [];
  lines.push(`# Carrossel - ${meta.tema}`);
  lines.push('');
  lines.push(`- Cliente: ${meta.slug}`);
  lines.push(`- Objetivo: ${meta.objetivo}`);
  lines.push(`- Slides: ${meta.slides}`);
  lines.push(`- CTA: ${meta.cta}`);
  lines.push('');

  slides.forEach((slide, index) => {
    lines.push(`## Slide ${String(index + 1).padStart(2, '0')} - ${slide.type}`);
    lines.push('');
    lines.push(`**Titulo:** ${slide.title}`);
    lines.push('');
    lines.push(`**Corpo:** ${slide.body}`);
    lines.push('');
  });

  return lines.join('\n');
}

function buildLegenda(meta) {
  return `# legenda.md

${meta.tema} nao precisa virar mais um post esquecido no feed.

Quando a mensagem segue uma sequencia clara, o publico entende mais rapido, salva mais e age mais.

${meta.cta}

#marketing #conteudo #carrossel #instagram #negocios`;
}

function buildPromptsMd(meta, styleSuffix) {
  const prompts = [];
  for (let i = 1; i <= meta.slides; i += 1) {
    prompts.push(`## Prompt slide ${String(i).padStart(2, '0')}`);
    prompts.push('');
    prompts.push(`Prompt: professional editorial background for instagram carousel about "${meta.tema}", brand-safe composition, no text, no letters, high contrast subject separation, ${styleSuffix || 'clean visual hierarchy'}, cinematic lighting`);
    prompts.push('');
  }
  return `# prompts.md

Uso: imagem de fundo opcional. O texto final continua no HTML/CSS.

Formato alvo: 1080x1350
Tema: ${meta.tema}
Objetivo: ${meta.objetivo}

${prompts.join('\n')}
`;
}

function escapeHtml(text) {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function buildCarouselHtml(meta, slides, visual) {
  const slideSections = slides
    .map((slide, i) => {
      return `<section class="slide" id="slide-${i + 1}">
  <div class="index">${String(i + 1).padStart(2, '0')}</div>
  <h1>${escapeHtml(slide.title)}</h1>
  <p>${escapeHtml(slide.body)}</p>
</section>`;
    })
    .join('\n');

  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Carrossel - ${escapeHtml(meta.tema)}</title>
  <style>
    :root {
      --bg: ${visual.background};
      --fg: ${visual.foreground};
      --accent: ${visual.accent};
      --muted: ${visual.muted};
      --secondary: ${visual.secondary};
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: ${visual.outerBackground};
      color: var(--fg);
      font-family: "${visual.primaryFont}", "${visual.secondaryFont}", "Arial", sans-serif;
      display: grid;
      gap: 24px;
      padding: 24px;
    }
    .slide {
      width: 1080px;
      height: 1350px;
      background: radial-gradient(circle at 20% 20%, var(--secondary) 0%, var(--bg) 58%);
      border: 2px solid var(--accent);
      position: relative;
      padding: 96px 90px;
      display: grid;
      align-content: center;
      gap: 34px;
      overflow: hidden;
    }
    .index {
      color: var(--accent);
      font-size: 42px;
      font-weight: 700;
      letter-spacing: 0;
    }
    h1 {
      margin: 0;
      font-size: 88px;
      line-height: 1.05;
      max-width: 900px;
      letter-spacing: 0;
    }
    p {
      margin: 0;
      color: var(--muted);
      font-size: 42px;
      line-height: 1.25;
      max-width: 850px;
      letter-spacing: 0;
    }
  </style>
</head>
<body>
${slideSections}
</body>
</html>`;
}

function getVisualFromBrandKit(brandKit) {
  const palette = brandKit && brandKit.palette ? brandKit.palette : {};
  const typography = brandKit && brandKit.typography ? brandKit.typography : {};

  return {
    background: pickColor(palette.background && palette.background.hex, '#0f172a'),
    outerBackground: pickColor(palette.neutral && palette.neutral.hex, '#020617'),
    foreground: pickColor(palette.primary && palette.primary.hex, '#e2e8f0'),
    secondary: pickColor(palette.secondary && palette.secondary.hex, '#164e63'),
    accent: pickColor(palette.accent && palette.accent.hex, '#22d3ee'),
    muted: pickColor(palette.neutral && palette.neutral.hex, '#94a3b8'),
    primaryFont: pickFont(typography.primary_font, 'Segoe UI'),
    secondaryFont: pickFont(typography.secondary_font, 'Arial'),
    styleSuffix: brandKit && brandKit.pollinations_defaults && brandKit.pollinations_defaults.style_suffix
      ? String(brandKit.pollinations_defaults.style_suffix).trim()
      : '',
  };
}

function appendCampaignLog(campaignsPath, meta, jobSlug) {
  if (!fs.existsSync(campaignsPath)) {
    return;
  }

  const line = `| ${formatDate()} | Carrossel ${meta.tema} | Gerado job ${jobSlug} (${meta.slides} slides) | Pipeline /carrossel |\n`;
  let content = fs.readFileSync(campaignsPath, 'utf8');
  const marker = '| [ DATA ] | [ CAMPANHA ] | [ O QUE MUDOU ] | [ POR QUE ] |';

  if (content.includes(marker)) {
    content = content.replace(marker, `${marker}\n${line.trimEnd()}`);
  } else {
    content = `${content.trimEnd()}\n\n## Registro automatico\n\n${line}`;
  }
  fs.writeFileSync(campaignsPath, content, 'utf8');
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const slug = args.slug;
  const tema = args.tema;
  const objetivo = args.objetivo || 'Autoridade';
  const slides = Math.max(5, Math.min(12, Number(args.slides || 7)));
  const cta = args.cta || 'Comente "carrossel" para receber o modelo';
  const useIaPrompts = ['true', '1', 'yes', 'sim'].includes(String(args.ia || '').toLowerCase());

  if (!slug) {
    fail('Uso: node scripts/generate-carousel.js --slug [slug] --tema [tema] [--objetivo ...] [--slides 7] [--cta ...]');
  }
  if (!tema) {
    fail('Faltou --tema.');
  }

  const baseClientDir = path.join(CLIENTS_DIR, slug);
  if (!fs.existsSync(baseClientDir)) {
    fail(`Cliente nao encontrado: ${slug}`);
  }

  const jobSlug = `${formatDate()}-${slugify(tema)}`;
  const jobDir = path.join(baseClientDir, 'outputs', 'carousels', jobSlug);
  const instagramDir = path.join(jobDir, 'instagram');
  ensureDir(instagramDir);

  const meta = { slug, tema, objetivo, slides, cta };
  const slideData = buildSlides(tema, objetivo, cta, slides);
  const brandKit = readJsonIfExists(path.join(baseClientDir, 'brand-kit.json'));
  const visual = getVisualFromBrandKit(brandKit);

  fs.writeFileSync(path.join(jobDir, 'copy.md'), buildCopyMd(meta, slideData), 'utf8');
  fs.writeFileSync(path.join(jobDir, 'legenda.md'), buildLegenda(meta), 'utf8');
  fs.writeFileSync(path.join(jobDir, 'carrossel.html'), buildCarouselHtml(meta, slideData, visual), 'utf8');
  if (useIaPrompts) {
    fs.writeFileSync(path.join(jobDir, 'prompts.md'), buildPromptsMd(meta, visual.styleSuffix), 'utf8');
  }

  const renderTemplate = `#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

function findRoot(startDir) {
  let current = startDir;
  while (true) {
    const candidate = path.join(current, 'scripts', 'render-carousel.js');
    if (fs.existsSync(candidate)) {
      return current;
    }
    const parent = path.dirname(current);
    if (parent === current) {
      throw new Error('Nao foi possivel localizar scripts/render-carousel.js');
    }
    current = parent;
  }
}

const root = findRoot(__dirname);
const script = path.join(root, 'scripts', 'render-carousel.js');
const html = path.resolve(__dirname, 'carrossel.html');
const outDir = path.resolve(__dirname, 'instagram');
const count = ${slides};
const result = spawnSync('node', [script, '--html', html, '--out', outDir, '--slides', String(count)], { stdio: 'inherit' });
process.exit(result.status || 0);
`;
  fs.writeFileSync(path.join(jobDir, 'render.js'), renderTemplate, 'utf8');
  appendCampaignLog(path.join(baseClientDir, 'campaigns.md'), meta, jobSlug);

  console.log(`Pipeline criado: ${jobDir}`);
  console.log(`Arquivos: copy.md, legenda.md, carrossel.html, render.js${useIaPrompts ? ', prompts.md' : ''}`);
  console.log('Proximo passo: node <jobDir>/render.js');
  console.log(`Registro atualizado em campaigns.md (${nowTimestamp()})`);
}

main();
