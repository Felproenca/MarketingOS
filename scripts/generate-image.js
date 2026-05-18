#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const ROOT_DIR = path.resolve(__dirname, '..');

function printUsageAndExit() {
  console.error('Uso: node scripts/generate-image.js <client-slug> "<prompt>"');
  console.error('Exemplo: node scripts/generate-image.js shana-joias "imagem premium de joia em fundo escuro"');
  process.exit(1);
}

function getNowParts() {
  const now = new Date();
  const iso = now.toISOString();
  const ymd = iso.slice(0, 10);
  const stamp = iso.replace(/[-:]/g, '').replace(/\..+/, '').replace('T', '-');
  return { ymd, stamp };
}

function ensureExistsOrThrow(targetPath, label) {
  if (!fs.existsSync(targetPath)) {
    throw new Error(`Estrutura obrigatoria ausente: ${label} (${targetPath})`);
  }
}

function sanitizeSlug(value) {
  return String(value || '').trim();
}

function sanitizeFilePart(value, maxLen) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, maxLen || 40) || 'image';
}

function readJsonFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(`JSON invalido em ${filePath}: ${error.message}`);
  }
}

function toTextList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item)).filter(Boolean).join(', ');
  }
  if (value && typeof value === 'object') {
    return Object.entries(value)
      .map(([key, val]) => `${key}: ${typeof val === 'string' ? val : JSON.stringify(val)}`)
      .join('; ');
  }
  return value ? String(value) : '';
}

function buildFinalPrompt(userPrompt, brandKit) {
  const visualStyle = toTextList(brandKit.visual_style);
  const colors = toTextList(brandKit.colors);
  const doNotUse = toTextList(brandKit.do_not_use);
  const rules = toTextList(brandKit.image_generation_rules);

  const parts = [
    `Pedido do cliente: ${userPrompt}.`,
    visualStyle ? `Estilo visual da marca: ${visualStyle}.` : '',
    colors ? `Paleta de cores da marca: ${colors}.` : '',
    rules ? `Regras de geracao de imagem da marca: ${rules}.` : '',
    doNotUse ? `Elementos proibidos: ${doNotUse}.` : '',
    'Sem texto na imagem, sem tipografia, sem logos e sem marcas d agua.',
    'Composicao profissional, iluminacao refinada, acabamento premium, alta definicao e foco no produto/tema principal.',
  ];

  return parts.filter(Boolean).join(' ');
}

function appendPromptLog(promptsFilePath, slug, userPrompt, finalPrompt) {
  const { ymd, stamp } = getNowParts();
  const block = [
    `## ${stamp} - ${slug}`,
    '',
    `Prompt original: ${userPrompt}`,
    '',
    `Prompt final: ${finalPrompt}`,
    '',
    `Data: ${ymd}`,
    '',
    '---',
    '',
  ].join('\n');

  fs.appendFileSync(promptsFilePath, block, 'utf8');
}

function getUniqueFilePath(baseDir, fileName) {
  const ext = path.extname(fileName);
  const base = path.basename(fileName, ext);

  let candidate = path.join(baseDir, fileName);
  let counter = 1;
  while (fs.existsSync(candidate)) {
    candidate = path.join(baseDir, `${base}-${counter}${ext}`);
    counter += 1;
  }
  return candidate;
}

async function generateImageWithOpenAI(apiKey, prompt) {
  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-image-1',
      prompt,
      size: '1024x1024',
    }),
  });

  if (!response.ok) {
    let details = '';
    try {
      const payload = await response.json();
      details = payload && payload.error && payload.error.message ? payload.error.message : '';
    } catch (_) {
      details = '';
    }
    throw new Error(`Falha na API de imagem (${response.status}). ${details}`.trim());
  }

  const payload = await response.json();
  const first = payload && payload.data && payload.data[0] ? payload.data[0] : null;
  if (!first) {
    throw new Error('Resposta da API sem imagem retornada.');
  }

  if (first.b64_json) {
    return Buffer.from(first.b64_json, 'base64');
  }

  if (first.url) {
    const imgResponse = await fetch(first.url);
    if (!imgResponse.ok) {
      throw new Error(`Nao foi possivel baixar imagem da URL retornada (${imgResponse.status}).`);
    }
    const arrayBuffer = await imgResponse.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  throw new Error('Resposta da API sem b64_json ou url de imagem.');
}

async function main() {
  const args = process.argv.slice(2);
  const clientSlug = sanitizeSlug(args[0]);
  const inputPrompt = args.slice(1).join(' ').trim();

  if (!clientSlug || !inputPrompt) {
    printUsageAndExit();
  }

  const clientDir = path.join(ROOT_DIR, 'clients', clientSlug);
  const clientMdPath = path.join(clientDir, 'client.md');
  const brandKitPath = path.join(clientDir, 'brand-kit.json');
  const generatedImagesDir = path.join(clientDir, 'assets', 'generated', 'images');
  const outputsImagesDir = path.join(clientDir, 'outputs', 'images');
  const promptsMdPath = path.join(outputsImagesDir, 'prompts.md');

  ensureExistsOrThrow(clientMdPath, 'client.md');
  ensureExistsOrThrow(brandKitPath, 'brand-kit.json');
  ensureExistsOrThrow(generatedImagesDir, 'assets/generated/images');

  if (!fs.existsSync(outputsImagesDir)) {
    fs.mkdirSync(outputsImagesDir, { recursive: true });
  }

  const brandKit = readJsonFile(brandKitPath);
  const finalPrompt = buildFinalPrompt(inputPrompt, brandKit);
  appendPromptLog(promptsMdPath, clientSlug, inputPrompt, finalPrompt);

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.log('Modo mock: OPENAI_API_KEY nao configurada. Prompt final salvo, imagem nao foi gerada.');
    return;
  }

  const { stamp } = getNowParts();
  const promptPart = sanitizeFilePart(inputPrompt, 48);
  const fileName = `${stamp}-${promptPart}.png`;
  const imagePath = getUniqueFilePath(generatedImagesDir, fileName);

  const imageBuffer = await generateImageWithOpenAI(apiKey, finalPrompt);
  fs.writeFileSync(imagePath, imageBuffer);

  console.log(`Imagem gerada com sucesso: ${imagePath}`);
  console.log(`Prompt salvo em: ${promptsMdPath}`);
}

main().catch((error) => {
  console.error(`Erro: ${error.message}`);
  process.exit(1);
});
