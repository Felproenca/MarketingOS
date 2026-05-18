#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CLIENTS_DIR = path.join(ROOT, 'clients');
const TEMPLATE_DIR = path.join(CLIENTS_DIR, '_template');

const OUTPUT_DIRS = [
  'outputs/site',
  'outputs/posts',
  'outputs/carousels',
  'outputs/dashboard',
  'outputs/demo',
  'outputs/images',
  'assets/logos',
  'assets/products',
  'assets/people',
  'assets/references',
  'assets/generated/images',
  'assets/generated/carousels',
  'assets/approved',
];

function log(message) {
  console.log(message);
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

function slugify(text) {
  return text
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

function copyIfExists(from, to) {
  if (!fs.existsSync(from)) {
    return false;
  }
  fs.copyFileSync(from, to);
  return true;
}

function resolveTemplateFile(fileName) {
  const directPath = path.join(TEMPLATE_DIR, fileName);
  const nestedPath = path.join(TEMPLATE_DIR, '[slug-do-cliente]', fileName);

  if (fs.existsSync(directPath)) {
    return directPath;
  }
  if (fs.existsSync(nestedPath)) {
    return nestedPath;
  }
  return null;
}

function main() {
  const rawSlug = process.argv[2];
  if (!rawSlug) {
    fail('Uso: node scripts/create-client.js [slug-do-cliente]');
  }

  const slug = slugify(rawSlug);
  if (!slug) {
    fail('Slug invalido.');
  }

  const clientDir = path.join(CLIENTS_DIR, slug);
  if (fs.existsSync(clientDir)) {
    fail(`Cliente ja existe: /clients/${slug}`);
  }

  ensureDir(clientDir);

  const fileMap = [
    ['client.md', 'client.md'],
    ['metrics.json', 'metrics.json'],
    ['notes.md', 'notes.md'],
    ['campaigns.md', 'campaigns.md'],
    ['campaings.md', 'campaigns.md'],
    ['brand-kit.json', 'brand-kit.json'],
  ];

  for (const [templateName, outputName] of fileMap) {
    const src = resolveTemplateFile(templateName);
    if (!src) {
      continue;
    }
    const dest = path.join(clientDir, outputName);
    if (fs.existsSync(dest)) {
      continue;
    }
    copyIfExists(src, dest);
    log(`Copiado: ${outputName}`);
  }

  const requiredFiles = ['client.md', 'metrics.json', 'notes.md', 'campaigns.md', 'brand-kit.json'];
  for (const requiredFile of requiredFiles) {
    if (!fs.existsSync(path.join(clientDir, requiredFile))) {
      fail(`Template incompleto: faltou ${requiredFile} em /clients/_template`);
    }
  }

  for (const outDir of OUTPUT_DIRS) {
    ensureDir(path.join(clientDir, outDir));
  }

  log(`Cliente criado com sucesso: /clients/${slug}`);
}

main();
