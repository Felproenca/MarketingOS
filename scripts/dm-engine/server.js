#!/usr/bin/env node
'use strict';

/**
 * MarketingOS — Motor de DM (Conteúdo → Comentário → DM).
 *
 * Operacionaliza o funil da Doutrina de Aquisição 2026: o dono comenta a
 * palavra-chave num Reel → recebe a isca (diagnóstico) por DM → conversa humana.
 *
 * Faz três coisas num só servidor (deployam juntos):
 *   1. GET  /webhook      — verificação do webhook da Meta (challenge).
 *   2. POST /webhook      — recebe comentários, valida assinatura, detecta a
 *                           palavra-chave e dispara a resposta privada (DM).
 *   3. POST /api/capture  — recebe o lead capturado no fim do diagnóstico.
 *   +  GET  /             — serve a própria isca (diagnostico.html).
 *
 * REGRA — "saber de tudo": cada evento e cada envio vai pro ledger
 * (clients/<slug>/leads/dm-engine-log.json). Nada acontece sem rastro.
 * REGRA — "tudo é verdade": só envia com token/permissão reais; falha honesta.
 *
 * Config (env, ou clients/<slug>/instagram-config.json para o token):
 *   DM_ENGINE_PORT        porta (padrão 4280)
 *   DM_SLUG               cliente (padrão felipe-proenca)
 *   META_APP_SECRET       segredo do app Meta — valida X-Hub-Signature-256
 *   WEBHOOK_VERIFY_TOKEN  token de verificação do webhook (você define)
 *   DM_KEYWORD            palavra-chave (padrão DIAGNOSTICO)
 *   MAGNET_URL            URL pública da isca (o link que vai na DM)
 *   DM_AUTO_SEND          'true' envia automático; senão só registra (rascunho)
 */

require('dotenv').config();
const fs = require('fs');
const http = require('http');
const path = require('path');
const crypto = require('crypto');
const { loadConfig } = require('../publisher/config');
const { apiPost, validateToken } = require('../publisher/instagram');

const ROOT = path.resolve(__dirname, '../..');
const PORT = parseInt(process.env.DM_ENGINE_PORT || '4280', 10);
const SLUG = process.env.DM_SLUG || 'felipe-proenca';
const APP_SECRET = process.env.META_APP_SECRET || '';
const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN || '';
const KEYWORD = (process.env.DM_KEYWORD || 'DIAGNOSTICO').toUpperCase();
const MAGNET_URL = process.env.MAGNET_URL || '';
const AUTO_SEND = process.env.DM_AUTO_SEND === 'true';

const MAGNET_FILE = path.join(ROOT, 'clients', SLUG, 'outputs', 'lead-magnet', 'diagnostico.html');
const LOG_FILE = path.join(ROOT, 'clients', SLUG, 'leads', 'dm-engine-log.json');
const CAPTURE_FILE = path.join(ROOT, 'clients', SLUG, 'leads', 'captured.json');

// ── Ledger (saber de tudo) ───────────────────────────────────────────────────
function appendJson(file, entry) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  let arr = [];
  try { arr = JSON.parse(fs.readFileSync(file, 'utf8')); } catch {}
  if (!Array.isArray(arr)) arr = [];
  arr.push(entry);
  fs.writeFileSync(file, JSON.stringify(arr, null, 2), 'utf8');
  return arr.length;
}
const log = (event, data) => {
  const entry = { at: new Date().toISOString(), event, ...data };
  const n = appendJson(LOG_FILE, entry);
  console.log(`  [${entry.at}] ${event}${data && data.note ? ' — ' + data.note : ''} (#${n})`);
  return entry;
};

// ── Normaliza texto e detecta a palavra-chave ────────────────────────────────
function hasKeyword(text) {
  const norm = String(text || '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // tira acentos
    .toUpperCase();
  return norm.includes(KEYWORD.normalize('NFD').replace(/[̀-ͯ]/g, ''));
}

// ── Resposta privada (a DM disparada pelo comentário) ────────────────────────
// Instagram permite UMA resposta privada por comentário, via /{ig-id}/messages
// com recipient.comment_id. É o mecanismo legítimo de comentário→DM.
async function sendPrivateReply(igUserId, commentId, token) {
  if (!MAGNET_URL) throw new Error('MAGNET_URL não configurada — recuso enviar link vazio (tudo é verdade).');
  const text =
    `Oi! Vi que você comentou — aqui está o diagnóstico que prometi 👇\n\n${MAGNET_URL}\n\n` +
    `São 6 perguntas, 2 minutos, e no final você vê qual gargalo está travando sua aquisição. ` +
    `Quando terminar, me conta o que apareceu?`;
  return apiPost(`/${igUserId}/messages`, {
    recipient: { comment_id: commentId },
    message: { text },
    access_token: token,
  });
}

// ── Processa um comentário recebido ──────────────────────────────────────────
async function handleComment(change, cfg) {
  const v = change.value || {};
  const commentId = v.id;
  const text = v.text;
  const from = v.from && (v.from.username || v.from.id);

  if (!commentId || !text) return;
  if (!hasKeyword(text)) { log('comment.ignored', { commentId, from, note: 'sem palavra-chave' }); return; }

  log('comment.keyword_hit', { commentId, from, text, keyword: KEYWORD });

  if (!AUTO_SEND) {
    log('dm.queued', { commentId, from, note: 'DM_AUTO_SEND=false — registrado para aprovação, não enviado' });
    return;
  }
  try {
    const res = await sendPrivateReply(cfg.igUserId, commentId, cfg.accessToken);
    log('dm.sent', { commentId, from, messageId: res.message_id || null, note: 'resposta privada enviada' });
  } catch (e) {
    log('dm.failed', { commentId, from, note: e.message });
  }
}

// ── HTTP helpers ─────────────────────────────────────────────────────────────
function readRaw(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', c => { chunks.push(c); if (chunks.reduce((s, b) => s + b.length, 0) > 2e6) { req.destroy(); reject(new Error('payload grande')); } });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}
function validSignature(raw, header) {
  if (!APP_SECRET) return { ok: false, reason: 'META_APP_SECRET não configurado' };
  if (!header) return { ok: false, reason: 'sem X-Hub-Signature-256' };
  const expected = 'sha256=' + crypto.createHmac('sha256', APP_SECRET).update(raw).digest('hex');
  const ok = header.length === expected.length && crypto.timingSafeEqual(Buffer.from(header), Buffer.from(expected));
  return { ok, reason: ok ? null : 'assinatura inválida' };
}
const sendJson = (res, status, obj) => { res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' }); res.end(JSON.stringify(obj)); };

// ── Server ───────────────────────────────────────────────────────────────────
let CFG = null;

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  // Verificação do webhook (Meta faz um GET com hub.challenge).
  if (req.method === 'GET' && url.pathname === '/webhook') {
    const mode = url.searchParams.get('hub.mode');
    const token = url.searchParams.get('hub.verify_token');
    const challenge = url.searchParams.get('hub.challenge');
    if (mode === 'subscribe' && token && token === VERIFY_TOKEN) {
      log('webhook.verified', { note: 'challenge respondido' });
      res.writeHead(200, { 'content-type': 'text/plain' }); res.end(challenge || '');
    } else {
      log('webhook.verify_failed', { note: 'verify_token não bateu' });
      res.writeHead(403); res.end('forbidden');
    }
    return;
  }

  // Eventos do webhook.
  if (req.method === 'POST' && url.pathname === '/webhook') {
    const raw = await readRaw(req);
    const sig = validSignature(raw, req.headers['x-hub-signature-256']);
    if (!sig.ok) { log('webhook.bad_signature', { note: sig.reason }); res.writeHead(403); res.end('bad signature'); return; }
    res.writeHead(200); res.end('EVENT_RECEIVED'); // responde rápido; processa depois
    let body; try { body = JSON.parse(raw.toString('utf8')); } catch { return; }
    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        if (change.field === 'comments') { try { await handleComment(change, CFG); } catch (e) { log('comment.error', { note: e.message }); } }
      }
    }
    return;
  }

  // Captura do lead vinda do diagnóstico.
  if (req.method === 'POST' && url.pathname === '/api/capture') {
    const raw = await readRaw(req);
    let lead; try { lead = JSON.parse(raw.toString('utf8')); } catch { return sendJson(res, 400, { error: 'json inválido' }); }
    if (!lead.nome || !lead.whatsapp || !lead.negocio) return sendJson(res, 400, { error: 'campos obrigatórios ausentes' });
    const entry = { ...lead, receivedAt: new Date().toISOString(), source: lead.origem || 'lead-magnet' };
    const n = appendJson(CAPTURE_FILE, entry);
    log('lead.captured', { nome: lead.nome, negocio: lead.negocio, indice: lead.diagnostico && lead.diagnostico.index, note: `lead #${n}` });
    return sendJson(res, 201, { ok: true, id: n });
  }

  // Serve a isca.
  if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/diagnostico' || url.pathname === '/diagnostico.html')) {
    fs.readFile(MAGNET_FILE, (e, data) => {
      if (e) { res.writeHead(404); res.end('isca não encontrada'); return; }
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' }); res.end(data);
    });
    return;
  }

  if (url.pathname === '/health') return sendJson(res, 200, { ok: true, keyword: KEYWORD, autoSend: AUTO_SEND, magnet: !!MAGNET_URL });

  res.writeHead(404); res.end('not found');
});

async function boot() {
  console.log('\n🛰️  MarketingOS — Motor de DM (comentário → DM)');
  console.log(`   Cliente: ${SLUG} · palavra-chave: ${KEYWORD} · auto-send: ${AUTO_SEND}`);
  try {
    CFG = loadConfig(SLUG);
    const me = await validateToken(CFG.accessToken);
    console.log(`   Token: válido (conta ${me.name || me.id}).`);
  } catch (e) {
    console.error(`   ⚠ Token inválido/expirado: ${e.message}`);
    console.error('   O servidor sobe (responde webhook/captura), mas DMs falharão até renovar o token.');
    CFG = CFG || { igUserId: null, accessToken: null };
  }
  const warn = [];
  if (!APP_SECRET) warn.push('META_APP_SECRET ausente — webhook recusará eventos (sem validar assinatura).');
  if (!VERIFY_TOKEN) warn.push('WEBHOOK_VERIFY_TOKEN ausente — verificação do webhook falhará.');
  if (!MAGNET_URL) warn.push('MAGNET_URL ausente — DM não envia link (recusa honesta).');
  warn.forEach(w => console.log(`   ⚠ ${w}`));

  server.listen(PORT, () => console.log(`\n   ✓ ouvindo em http://localhost:${PORT}  (/webhook · /api/capture · /)\n`));
}

boot();
