#!/usr/bin/env node
'use strict';

require('dotenv').config();

const { uploadImage, checkStatus, downloadPNGs } = require('./content-client');
const path = require('path');

const args = process.argv.slice(2);
const contentId = getArg('content');
const slideNumber = getArg('slide');
const file = getArg('file');
const slug = getArg('slug');

if (!contentId || !slideNumber || !file) {
  console.error('Uso: npm run upload-image -- --content <content_id> --slide <N> --file <caminho> [--slug <slug>]');
  process.exit(1);
}

async function run() {
  const response = await uploadImage(contentId, slideNumber, path.resolve(file));
  console.log(JSON.stringify(response, null, 2));

  const status = await checkStatus(contentId);
  if (status.status === 'pronto_para_publicar' && slug) {
    const outputDir = path.join(process.cwd(), 'clients', slug, 'outputs', 'posts', new Date().toISOString().slice(0, 10));
    const pngs = await downloadPNGs(contentId, outputDir);
    console.log(`\n${pngs.length} arquivo(s) baixado(s) em: ${outputDir}`);
  } else {
    console.log(`\nStatus atual: ${status.status || 'desconhecido'}`);
  }
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
