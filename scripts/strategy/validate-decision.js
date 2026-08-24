#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { validateStrategyDecision } = require('./decision-record');

const args = parseArgs(process.argv.slice(2));
const slug = args.slug || args.client;
if (!slug) fail('Uso: node scripts/strategy/validate-decision.js --slug [slug]');

const root = path.resolve(__dirname, '..', '..');
const file = path.join(root, 'clients', slug, 'outputs', 'strategy', 'strategy-decision.json');
if (!fs.existsSync(file)) {
  fail(`Registro ausente: ${path.relative(root, file)}\nUse templates/strategy-decision.template.json como ponto de partida.`);
}

const result = validateStrategyDecision(JSON.parse(fs.readFileSync(file, 'utf8')), slug);
if (!result.valid) {
  fail([
    `Strategic decision reprovado: ${path.relative(root, file)}`,
    ...result.missing.map((item) => `- missing: ${item}`),
    ...result.invalid.map((item) => `- invalid: ${item}`),
  ].join('\n'));
}
console.log(`Strategic decision aprovado: ${path.relative(root, file)}`);

function parseArgs(argv) {
  const result = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith('--')) continue;
    const key = token.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith('--')) {
      result[key] = true;
      continue;
    }
    result[key] = next;
    index += 1;
  }
  return result;
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
