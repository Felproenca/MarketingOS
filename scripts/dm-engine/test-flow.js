#!/usr/bin/env node
'use strict';

/**
 * Teste local do Motor de DM.
 *
 * Pre-requisito: servidor rodando:
 *   DM_ENGINE_PORT=4282 MAGNET_URL=http://localhost:4282/ npm.cmd run dm-engine
 *
 * Uso:
 *   node scripts/dm-engine/test-flow.js [--port 4282]
 */

const portArg = process.argv.indexOf('--port');
const port = portArg !== -1 ? process.argv[portArg + 1] : (process.env.DM_ENGINE_PORT || '4280');
const base = `http://localhost:${port}`;

async function post(path, body) {
  const res = await fetch(`${base}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${path}: ${res.status} ${JSON.stringify(data)}`);
  return data;
}

async function get(path) {
  const res = await fetch(`${base}${path}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${path}: ${res.status} ${JSON.stringify(data)}`);
  return data;
}

(async () => {
  console.log(`\nDM engine test -> ${base}`);

  const health = await get('/health');
  console.log('health:', JSON.stringify(health, null, 2));

  const comment = await post('/api/test-comment', {
    commentId: `local-${Date.now()}`,
    text: 'DIAGNOSTICO',
    from: 'felipe_teste',
  });
  console.log('comment:', JSON.stringify(comment, null, 2));
  if (!comment.result || !comment.result.matched) throw new Error('palavra-chave exata nao foi reconhecida');

  const typoCases = [
    'diagnóstico',
    'Diagnóstico',
    'DIAGNÓSTICO',
    'diagnostico!',
    'diagnostco',
    'diagnotico',
    'diganostico',
    'diag nostico',
    'diagnósticoooo',
    'quero diagnostico',
    'quero meu diagnóstico',
  ];
  for (const text of typoCases) {
    const result = await post('/api/test-comment', {
      commentId: `typo-${Date.now()}-${text.replace(/\W+/g, '')}`,
      text,
      from: 'felipe_teste',
    });
    if (!result.result || !result.result.matched) throw new Error(`variante nao reconhecida: ${text}`);
    console.log(`typo ok: ${text} -> ${result.result.match.mode}/${result.result.match.distance}`);
  }

  const ignored = await post('/api/test-comment', {
    commentId: `ignored-${Date.now()}`,
    text: 'quero saber mais',
    from: 'felipe_teste',
  });
  if (ignored.result && ignored.result.matched) throw new Error('comentario sem palavra-chave foi reconhecido indevidamente');
  console.log('ignored ok: comentario sem palavra-chave nao disparou');

  const capture = await post('/api/capture', {
    nome: 'Lead Teste',
    whatsapp: '11999999999',
    email: 'lead@teste.com',
    site: 'https://negocioteste.com',
    negocio: 'Negocio Teste',
    diagnostico: { index: 42, gargalo: 'Aquisicao a cegas' },
    origem: 'test-flow',
  });
  console.log('capture:', JSON.stringify(capture, null, 2));

  const logs = await get('/api/logs?limit=5');
  const captures = await get('/api/captures?limit=3');
  console.log(`logs: ${logs.count} total`);
  console.log(`captures: ${captures.count} total`);
  console.log('\nOK: comentario -> ledger -> captura operacional.\n');
})().catch((err) => {
  console.error(`\nERRO: ${err.message}`);
  process.exit(1);
});
