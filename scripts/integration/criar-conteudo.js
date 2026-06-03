#!/usr/bin/env node
'use strict';

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { buildBrief } = require('./brief-builder');
const { requestContent, downloadPNGs } = require('./content-client');
const { rememberContent } = require('./state');

const args = process.argv.slice(2);
const slug = args.find(arg => !arg.startsWith('--'));

if (!slug) {
  console.error('Uso: npm run criar-conteudo -- <slug> [--objetivo=autoridade] [--plataforma=instagram] [--tema="texto"] [--format=1:1] [--dry-run]');
  process.exit(1);
}

const opts = {
  objetivo: getArg('objetivo') || 'autoridade',
  plataforma: getArg('plataforma') || 'instagram',
  tema: getArg('tema') || null,
  format: getArg('format') || '1:1',
  dryRun: args.includes('--dry-run'),
};

async function run() {
  const brief = buildBrief(slug, opts);
  const outputDir = path.join(process.cwd(), 'clients', slug, 'outputs', 'posts', today());

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(path.join(outputDir, 'brief.json'), JSON.stringify(brief, null, 2) + '\n', 'utf8');

  if (opts.dryRun) {
    console.log('\n[DRY-RUN] Brief montado sem chamar social-content-agents.');
    console.log(`Arquivo: ${path.join(outputDir, 'brief.json')}`);
    return;
  }

  const result = await requestContent(brief);
  fs.writeFileSync(path.join(outputDir, 'content-response.json'), JSON.stringify(result, null, 2) + '\n', 'utf8');

  if (result.content_id) {
    rememberContent(result.content_id, {
      slug,
      outputDir,
      tema: opts.tema,
      objetivo: opts.objetivo,
      plataforma: opts.plataforma,
      format: opts.format,
    });
  }

  if (result.status === 'pronto_para_publicar') {
    const pngs = await downloadPNGs(result.content_id, outputDir);
    console.log(`\n${pngs.length} arquivo(s) pronto(s) em: ${outputDir}`);
    console.log('\nProximos passos:');
    console.log('  1. Revisar os arquivos gerados');
    console.log('  2. Publicar com npm run publicar');
    console.log('  3. Depois de ~48h: npm run insights -- --slug ' + slug);
    console.log('  4. Enviar aprendizado: npm run aprender -- --slug ' + slug);
  } else {
    console.log(`\nStatus: ${result.status || 'desconhecido'}`);
    console.log(`Arquivos salvos em: ${outputDir}`);
  }
}

function getArg(name) {
  const prefix = `--${name}=`;
  const inline = args.find(arg => arg.startsWith(prefix));
  if (inline) return inline.slice(prefix.length);
  const idx = args.indexOf(`--${name}`);
  return idx >= 0 ? args[idx + 1] : null;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

run().catch(err => {
  console.error('\nErro:', err.message);
  process.exit(1);
});
