#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const ROOT = path.resolve(__dirname, '..');
const CLIENTS_DIR = path.join(ROOT, 'clients');
const TEMPLATE_DIR = path.join(CLIENTS_DIR, '_template');

const OUTPUT_DIRS = [
  'outputs/demo',
  'outputs/site',
  'outputs/branding',
  'outputs/posts',
  'outputs/carousels',
  'outputs/dashboard',
  'outputs/images',
];

const ASSET_DIRS = [
  'assets/logos',
  'assets/products',
  'assets/people',
  'assets/references',
  'assets/generated/images',
  'assets/generated/carousels',
];

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function createDirectories(clientDir) {
  ensureDir(clientDir);
  for (const outDir of OUTPUT_DIRS) {
    ensureDir(path.join(clientDir, outDir));
  }
  for (const assetDir of ASSET_DIRS) {
    ensureDir(path.join(clientDir, assetDir));
  }
}

function resolveTemplateFile(fileName) {
  const direct = path.join(TEMPLATE_DIR, fileName);
  const nested = path.join(TEMPLATE_DIR, '[slug-do-cliente]', fileName);
  if (fs.existsSync(direct)) return direct;
  if (fs.existsSync(nested)) return nested;
  return null;
}

function copyTemplateFiles(clientDir) {
  const copied = [];
  const templateFiles = ['metrics.json', 'campaigns.md', 'notes.md', 'client.md', 'brand-kit.json', 'estrategia.md'];

  for (const fileName of templateFiles) {
    const source = resolveTemplateFile(fileName);
    const destination = path.join(clientDir, fileName);
    if (!source) continue;
    if (fs.existsSync(destination)) continue;
    fs.copyFileSync(source, destination);
    copied.push(fileName);
  }

  return copied;
}

function createReadline() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

function ask(rl, question) {
  return new Promise((resolve) => {
    rl.question(`${question}\n> `, (answer) => {
      const trimmed = String(answer || '').trim();
      resolve(trimmed || 'A definir');
    });
  });
}

async function askQuestions() {
  const rl = createReadline();
  const answers = {};

  try {
    console.log('\n=== Onboarding Interativo - MarketingOS ===\n');

    answers.companyName = await ask(rl, '1. Nome da empresa');
    answers.segment = await ask(rl, '2. Segmento/nicho');
    answers.region = await ask(rl, '3. Cidade/regiao principal');
    answers.instagram = await ask(rl, '4. Instagram');
    answers.website = await ask(rl, '5. Site atual');
    answers.whatsapp = await ask(rl, '6. WhatsApp comercial');
    answers.whatSells = await ask(rl, '7. O que a empresa vende?');
    answers.mainProduct = await ask(rl, '8. Qual produto/servico principal?');
    answers.mainGoal = await ask(rl, '9. Qual principal objetivo atual?');
    answers.mainDifferential = await ask(rl, '10. Qual principal diferencial percebido?');
    answers.idealAudience = await ask(rl, '11. Quem e o publico ideal?');
    answers.mainPain = await ask(rl, '12. Qual principal dor do cliente?');
    answers.mainObjection = await ask(rl, '13. Qual principal objecao?');
    answers.purchaseTrigger = await ask(rl, '14. O que acelera a compra?');
    answers.brandPerception = await ask(rl, '15. Como a marca quer ser percebida?');
    answers.voiceTone = await ask(rl, '16. Qual tom de voz?');
    answers.forbiddenWords = await ask(rl, '17. Existem palavras proibidas?');
    answers.visualReference = await ask(rl, '18. Existe alguma referencia visual?');
    answers.paidTraffic = await ask(rl, '19. Ja roda trafego pago?');
    answers.channels = await ask(rl, '20. Quais canais ja usa?');
    answers.contentCalendar = await ask(rl, '21. Existe calendario de conteudo?');
    answers.hasBranding = await ask(rl, '22. Existe branding definido?');
    answers.mainColors = await ask(rl, '23. Cores principais');
    answers.mainFonts = await ask(rl, '24. Fontes principais');
    answers.visualStyle = await ask(rl, '25. Estilo visual desejado');
    answers.visualAvoid = await ask(rl, '26. O que evitar visualmente?');
    answers.hasLogo = await ask(rl, '27. Possui logo?');
    answers.hasImageBank = await ask(rl, '28. Possui banco de imagens proprio?');
  } finally {
    rl.close();
  }

  return answers;
}

function toArrayFromText(input) {
  const value = String(input || '').trim();
  if (!value || value === 'A definir') return [];
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function populateClientMd(slug, answers, timestamps) {
  return `# client.md - ${answers.companyName}
> Contexto principal do cliente.
> Slug: ${slug}
> created_at: ${timestamps.createdAt}
> updated_at: ${timestamps.updatedAt}

## BLOCO 1 - IDENTIFICACAO
- Nome da empresa: ${answers.companyName}
- Segmento/nicho: ${answers.segment}
- Cidade/regiao principal: ${answers.region}
- Instagram: ${answers.instagram}
- Site atual: ${answers.website}
- WhatsApp comercial: ${answers.whatsapp}

## BLOCO 2 - NEGOCIO
- O que a empresa vende: ${answers.whatSells}
- Produto/servico principal: ${answers.mainProduct}
- Objetivo atual: ${answers.mainGoal}
- Diferencial percebido: ${answers.mainDifferential}

## BLOCO 3 - PUBLICO
- Publico ideal: ${answers.idealAudience}
- Principal dor: ${answers.mainPain}
- Principal objecao: ${answers.mainObjection}
- O que acelera a compra: ${answers.purchaseTrigger}

## BLOCO 4 - POSICIONAMENTO
- Como a marca quer ser percebida: ${answers.brandPerception}
- Tom de voz: ${answers.voiceTone}
- Palavras proibidas: ${answers.forbiddenWords}
- Referencia visual: ${answers.visualReference}

## BLOCO 5 - MARKETING
- Trafego pago: ${answers.paidTraffic}
- Canais atuais: ${answers.channels}
- Calendario de conteudo: ${answers.contentCalendar}
- Branding definido: ${answers.hasBranding}

## BLOCO 6 - VISUAL / BRAND KIT
- Cores principais: ${answers.mainColors}
- Fontes principais: ${answers.mainFonts}
- Estilo visual desejado: ${answers.visualStyle}
- O que evitar visualmente: ${answers.visualAvoid}
- Possui logo: ${answers.hasLogo}
- Possui banco de imagens proprio: ${answers.hasImageBank}
`;
}

function populateBrandKit(slug, answers, timestamps) {
  const colors = toArrayFromText(answers.mainColors);
  const fonts = toArrayFromText(answers.mainFonts);
  const forbidden = toArrayFromText(answers.forbiddenWords);
  const visualRefs = toArrayFromText(answers.visualReference);
  const avoid = toArrayFromText(answers.visualAvoid);

  return {
    _meta: {
      description: 'Identidade visual do cliente para operacoes do MarketingOS.',
      client: slug,
      created_at: timestamps.createdAt,
      updated_at: timestamps.updatedAt,
    },
    identity: {
      brand_name: answers.companyName,
      tagline: 'A definir',
      personality: [answers.voiceTone || 'A definir'],
      archetype: answers.brandPerception,
    },
    palette: {
      primary: { hex: colors[0] || 'A definir', usage: 'cor dominante' },
      secondary: { hex: colors[1] || 'A definir', usage: 'cor de apoio' },
      accent: { hex: colors[2] || 'A definir', usage: 'destaques e CTA' },
      neutral: { hex: 'A definir', usage: 'texto e elementos neutros' },
      background: { hex: 'A definir', usage: 'fundo principal' },
    },
    typography: {
      primary_font: fonts[0] || 'A definir',
      secondary_font: fonts[1] || 'A definir',
      style_notes: answers.visualStyle,
    },
    visual_style: {
      mood: answers.brandPerception,
      aesthetic: answers.visualStyle,
      references: visualRefs,
      avoid,
      lighting: 'A definir',
      composition: 'A definir',
      photography_style: 'A definir',
    },
    image_subjects: {
      people: { include: false, profile: 'A definir', style: 'A definir' },
      products: { include: false, presentation: 'A definir', background: 'A definir' },
      environments: { include: false, type: 'A definir', mood: 'A definir' },
      abstract: { include: false, elements: 'A definir' },
    },
    restrictions: {
      never_use: forbidden,
      content_restrictions: [],
      legal_notes: 'A definir',
    },
    pollinations_defaults: {
      model: 'flux',
      width: 1080,
      height: 1350,
      negative_prompt: 'blurry, low quality, distorted, watermark, text, letters, words',
      style_suffix: answers.visualStyle === 'A definir' ? '' : answers.visualStyle,
    },
    format_specs: {
      feed_square: { width: 1080, height: 1080, ratio: '1:1' },
      feed_portrait: { width: 1080, height: 1350, ratio: '4:5' },
      stories: { width: 1080, height: 1920, ratio: '9:16' },
      carousel_slide: { width: 1080, height: 1350, ratio: '4:5' },
      meta_ads: { width: 1200, height: 628, ratio: '1.91:1' },
    },
  };
}

function saveFiles(clientDir, clientMd, brandKitObject) {
  const clientPath = path.join(clientDir, 'client.md');
  const brandKitPath = path.join(clientDir, 'brand-kit.json');

  if (fs.existsSync(clientPath)) {
    fs.writeFileSync(clientPath, clientMd, 'utf8');
  }
  if (fs.existsSync(brandKitPath)) {
    fs.writeFileSync(brandKitPath, JSON.stringify(brandKitObject, null, 2), 'utf8');
  }
}

function showSummary(slug, clientDir, copiedFiles) {
  console.log('\n=== Resumo da Instalacao ===');
  console.log('✅ Cliente instalado');
  console.log('✅ Estrutura criada');
  console.log('✅ Arquivos preenchidos');
  console.log('✅ Outputs criados');
  console.log('✅ Assets criados');
  console.log(`\nCliente: ${slug}`);
  console.log(`Diretorio: ${clientDir}`);
  if (copiedFiles.length > 0) {
    console.log(`Arquivos base copiados: ${copiedFiles.join(', ')}`);
  }
  console.log('\nProximos passos:');
  console.log('1. revisar client.md');
  console.log('2. revisar brand-kit.json');
  console.log('3. executar workflow: /workflows/client-demo.md\n');
}

async function main() {
  const rawSlug = process.argv[2];
  if (!rawSlug) {
    console.error('Uso: node scripts/create-client.js [slug-do-cliente]');
    process.exit(1);
  }

  const slug = slugify(rawSlug);
  if (!slug) {
    console.error('Slug invalido.');
    process.exit(1);
  }

  const clientDir = path.join(CLIENTS_DIR, slug);
  if (fs.existsSync(clientDir)) {
    console.error(`Cliente ja existe: /clients/${slug}`);
    process.exit(1);
  }

  createDirectories(clientDir);
  const copiedFiles = copyTemplateFiles(clientDir);

  const answers = await askQuestions();
  const nowIso = new Date().toISOString();
  const timestamps = { createdAt: nowIso, updatedAt: nowIso };

  const clientMd = populateClientMd(slug, answers, timestamps);
  const brandKit = populateBrandKit(slug, answers, timestamps);
  saveFiles(clientDir, clientMd, brandKit);
  showSummary(slug, clientDir, copiedFiles);
}

main().catch((error) => {
  console.error(`Erro na instalacao: ${error.message}`);
  process.exit(1);
});
