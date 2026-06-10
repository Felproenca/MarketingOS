#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { buildContext } = require('./context/context-builder');

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

function buildSlides(tema, objetivo, cta, slidesCount, context) {
  const direction = context && context.perception ? context.perception.camada_6_direcao_criativa : null;
  const carouselDirection = direction && direction.por_tipo_de_entrega
    ? direction.por_tipo_de_entrega.carrossel
    : '';
  const coreTension = context && context.perception && context.perception.camada_3_assinatura
    ? context.perception.camada_3_assinatura.tensao_principal
    : '';
  const principle = context && context.reference_summary && context.reference_summary.principles_applied
    ? context.reference_summary.principles_applied[0]
    : '';

  const slides = [];
  slides.push({
    type: 'GANCHO',
    title: coreTension ? `${tema}: ${coreTension}` : `Pare de perder resultado com ${tema}`,
    body: carouselDirection || 'Quando o assunto e crescimento, consistencia vence improviso.',
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
    body: principle || 'Um bom carrossel guia a pessoa da identificacao para a acao.',
  });

  slides.push({
    type: 'CTA',
    title: cta,
    body: 'Se isso fez sentido, salve e aplique no proximo conteudo.',
  });

  return slides.slice(0, slidesCount);
}

function buildCopyMd(meta, slides, context) {
  const lines = [];
  lines.push(`# Carrossel - ${meta.tema}`);
  lines.push('');
  lines.push(`- Cliente: ${meta.slug}`);
  lines.push(`- Objetivo: ${meta.objetivo}`);
  lines.push(`- Slides: ${meta.slides}`);
  lines.push(`- CTA: ${meta.cta}`);
  lines.push('');
  if (context && context.context_report) {
    lines.push('## Contexto aplicado');
    lines.push('');
    lines.push(`- Context source: ${context.context_report.summary.reference_source}`);
    lines.push(`- Arquivos carregados: ${context.context_report.loaded.map((item) => item.path).join(', ') || 'nenhum'}`);
    lines.push(`- Arquivos ausentes: ${context.context_report.missing.map((item) => item.path).join(', ') || 'nenhum'}`);
    if (context.reference_summary && context.reference_summary.principles_applied.length) {
      lines.push(`- Principio dominante: ${context.reference_summary.principles_applied[0]}`);
    }
    lines.push('');
  }

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

function buildCarouselHtml(meta, slides, visual, context) {
  const slideSections = slides
    .map((slide, i) => {
      return `<section class="slide" id="slide-${i + 1}">
  <div class="index">${String(i + 1).padStart(2, '0')}</div>
  <h1>${escapeHtml(slide.title)}</h1>
  <p>${escapeHtml(slide.body)}</p>
</section>`;
    })
    .join('\n');

  const contextComment = context && context.reference_summary
    ? `<!--
Context Builder:
- reference_source: ${context.reference_summary.source}
- principles_applied: ${context.reference_summary.principles_applied.join(' | ')}
- what_to_steal: ${context.reference_summary.what_to_steal.slice(0, 3).join(' | ')}
-->
`
    : '';

  return `${contextComment}<!doctype html>
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
      border: ${visual.borderWidth}px solid var(--accent);
      position: relative;
      padding: ${visual.slidePadding}px;
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

function getVisualFromBrandKit(brandKit, context) {
  const palette = brandKit && brandKit.palette ? brandKit.palette : {};
  const typography = brandKit && brandKit.typography ? brandKit.typography : {};
  const visualDna = context && context.visual_dna && context.visual_dna.visual_dna ? context.visual_dna.visual_dna : {};
  const density = String(visualDna.densidade || '').toLowerCase();
  const contrast = String(visualDna.contraste || '').toLowerCase();

  return {
    background: pickColor(colorValue(palette.background), '#0f172a'),
    outerBackground: pickColor(colorValue(palette.surface || palette.neutral), '#020617'),
    foreground: pickColor(colorValue(palette.text || palette.primary), '#e2e8f0'),
    secondary: pickColor(colorValue(palette.surface_2 || palette.secondary), '#164e63'),
    accent: pickColor(colorValue(palette.gold || palette.accent), '#22d3ee'),
    muted: pickColor(colorValue(palette.muted || palette.neutral), '#94a3b8'),
    primaryFont: pickFont(typography.primary_font || typography.headline, 'Segoe UI'),
    secondaryFont: pickFont(typography.secondary_font || typography.body, 'Arial'),
    slidePadding: density.includes('baixa') || density.includes('esparso') ? 112 : 90,
    borderWidth: contrast.includes('alto') || contrast.includes('extremo') ? 1 : 2,
    styleSuffix: brandKit && brandKit.pollinations_defaults && brandKit.pollinations_defaults.style_suffix
      ? String(brandKit.pollinations_defaults.style_suffix).trim()
      : '',
  };
}

function colorValue(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value.hex || '';
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
  const brandKit = readJsonIfExists(path.join(baseClientDir, 'brand-kit.json'));
  const context = buildCarouselContext(slug);
  const visual = getVisualFromBrandKit(context && context.branding ? context.branding : brandKit, context);
  const slideData = buildSlides(tema, objetivo, cta, slides, context);

  fs.writeFileSync(path.join(jobDir, 'copy.md'), buildCopyMd(meta, slideData, context), 'utf8');
  fs.writeFileSync(path.join(jobDir, 'legenda.md'), buildLegenda(meta), 'utf8');
  fs.writeFileSync(path.join(jobDir, 'carrossel.html'), buildCarouselHtml(meta, slideData, visual, context), 'utf8');
  if (context && context.context_report) {
    fs.writeFileSync(path.join(jobDir, 'context-report.json'), JSON.stringify({
      context_report: context.context_report,
      references_used: context.references,
      reference_summary: context.reference_summary,
      principles_applied: context.reference_summary ? context.reference_summary.principles_applied : [],
    }, null, 2), 'utf8');
  }
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
  console.log(`Arquivos: copy.md, legenda.md, carrossel.html, render.js, context-report.json${useIaPrompts ? ', prompts.md' : ''}`);
  console.log('Proximo passo: node <jobDir>/render.js');
  console.log(`Registro atualizado em campaigns.md (${nowTimestamp()})`);
}

function buildCarouselContext(slug) {
  try {
    return buildContext({
      client_slug: slug,
      output_type: 'carousel',
      rootDir: ROOT,
    });
  } catch (error) {
    console.warn(`Context Builder indisponivel, usando fallback antigo: ${error.message}`);
    return {
      branding: readJsonIfExists(path.join(CLIENTS_DIR, slug, 'brand-kit.json')) || {},
      perception: {},
      visual_dna: {},
      references: [],
      reference_summary: {
        source: 'fallback-brand-kit',
        references_used: [],
        tensions: [],
        transferable_principles: [],
        principles_applied: [],
        what_to_steal: [],
        what_not_to_copy: [],
        translation_for_this_brand: {},
      },
      context_report: {
        loaded: [{ key: 'branding', path: `clients/${slug}/brand-kit.json` }],
        missing: [],
        skipped: [],
        errors: [{ key: 'context_builder', error: error.message }],
        summary: {
          client_slug: slug,
          output_type: 'carousel',
          reference_source: 'fallback-brand-kit',
          references_count: 0,
        },
        generated_at: new Date().toISOString(),
      },
    };
  }
}

main();
