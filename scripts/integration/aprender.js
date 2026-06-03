#!/usr/bin/env node
'use strict';

require('dotenv').config();

const { sendLearnData } = require('./learn-sender');

const args = process.argv.slice(2);
const slug = getArg('slug') || args.find(arg => !arg.startsWith('--'));

if (!slug) {
  console.error('Uso: npm run aprender -- --slug <slug> [--content-id <id>] [--min-age-hours 48] [--dry-run]');
  process.exit(1);
}

async function run() {
  const result = await sendLearnData(slug, getArg('content-id'), {
    minAgeHours: Number(getArg('min-age-hours') || 48),
    dryRun: args.includes('--dry-run'),
  });

  console.log(`\nAprendizado concluido: ${result.sent} enviado(s), ${result.skipped} pulado(s).`);
}

function getArg(name) {
  const prefix = `--${name}=`;
  const inline = args.find(arg => arg.startsWith(prefix));
  if (inline) return inline.slice(prefix.length);
  const idx = args.indexOf(`--${name}`);
  return idx >= 0 ? args[idx + 1] : null;
}

run().catch(err => {
  console.error('\nErro:', err.message);
  process.exit(1);
});
