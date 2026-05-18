#!/usr/bin/env node

/**
 * create-client.js — MarketingOS
 *
 * Objetivo:
 * Instalar um novo cliente a partir de /clients/_template.
 *
 * Uso:
 * node scripts/create-client.js 
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CLIENTS_DIR = path.join(ROOT, 'clients');
const TEMPLATE_DIR = path.join(CLIENTS_DIR, '_template');

const REQUIRED_TEMPLATE_FILES = [
  'client.md',
  'metrics.json',
  'campaigns.md',
  'notes.md',
  'brand-kit.json',
];

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
  'assets/generated',
  'assets/generated/images',
  'assets/generated/carousels',
  'assets/approved',

];

function log(message) {
  console.log(message);
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

function validateTemplateStructure() {
  if (!fs.existsSync(TEMPLATE_DIR)) {
    throw new Error(
      'A pasta /clients/_template não existe. Crie a estrutura base antes de continuar.'
    );
  }

  for (const file of REQUIRED_TEMPLATE_FILES) {
    const filePath = path.join(TEMPLATE_DIR, file);

    if (!fs.existsSync(filePath)) {
      throw new Error(
        `Arquivo obrigatório ausente em _template: ${file}`
      );
    }
  }
}

function copyTemplateFiles(destinationDir) {
  for (const file of REQUIRED_TEMPLATE_FILES) {
    const source = path.join(TEMPLATE_DIR, file);
    const destination = path.join(destinationDir, file);

    fs.copyFileSync(source, destination);

    log(`✓ Copiado: ${file}`);
  }
}
main();