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
 *   DM_KEYWORD            palavra-chave principal (padrão DIAGNOSTICO)
 *   DM_KEYWORDS           lista opcional separada por vírgula (ex.: DIAGNOSTICO,DIAGNÓSTICO,DIAG)
 *   MAGNET_URL            URL pública da isca (o link que vai na DM)
 *   DM_AUTO_SEND          'true' envia automático; senão só registra (rascunho)
 */

try { require('dotenv').config(); } catch {}
const fs = require('fs');
const http = require('http');
const path = require('path');
const crypto = require('crypto');
const { loadConfig } = require('../publisher/config');
const { apiPost, validateToken } = require('../publisher/instagram');

const ROOT = path.resolve(__dirname, '../..');
const PORT = parseInt(process.env.DM_ENGINE_PORT || process.env.PORT || '4280', 10);
const SLUG = process.env.DM_SLUG || 'felipe-proenca';
const APP_SECRET = process.env.META_APP_SECRET || '';
const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN || '';
const KEYWORD = (process.env.DM_KEYWORD || 'DIAGNOSTICO').toUpperCase();
const KEYWORDS = (process.env.DM_KEYWORDS || KEYWORD)
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);
const MAGNET_URL = process.env.MAGNET_URL || '';
const AUTO_SEND = process.env.DM_AUTO_SEND === 'true';

const MAGNET_FILE = path.join(ROOT, 'clients', SLUG, 'outputs', 'lead-magnet', 'diagnostico.html');
const PACKAGED_MAGNET_FILE = path.join(__dirname, 'diagnostico.html');
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

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

// ── Normaliza texto e detecta a palavra-chave ────────────────────────────────
function normalizeKeywordText(value) {
  return String(value || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();
}

function squeezeRepeats(value) {
  return String(value || '').replace(/(.)\1{2,}/g, '$1$1');
}

function editDistance(a, b) {
  const rows = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) rows[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      rows[i][j] = Math.min(
        rows[i - 1][j] + 1,
        rows[i][j - 1] + 1,
        rows[i - 1][j - 1] + cost
      );
    }
  }
  return rows[a.length][b.length];
}

function matchOneKeyword(text, rawKeyword) {
  const keyword = normalizeKeywordText(rawKeyword).replace(/[^A-Z0-9]/g, '');
  const normalized = normalizeKeywordText(text);
  const compact = normalized.replace(/[^A-Z0-9]/g, '');
  if (!keyword) return { hit: false, mode: 'empty', keyword: rawKeyword, candidate: null, distance: null };
  if (compact.includes(keyword)) return { hit: true, keyword: rawKeyword, normalizedKeyword: keyword, mode: 'exact_compact', candidate: keyword, distance: 0 };

  const maxDistance = keyword.length >= 8 ? 2 : 1;
  const candidates = normalized
    .split(/[^A-Z0-9]+/)
    .map(squeezeRepeats)
    .filter((token) => token.length >= Math.max(4, keyword.length - maxDistance));

  for (const candidate of candidates) {
    const distance = editDistance(candidate, keyword);
    if (distance <= maxDistance) return { hit: true, keyword: rawKeyword, normalizedKeyword: keyword, mode: 'fuzzy_token', candidate, distance };
  }

  const compactCandidate = squeezeRepeats(compact);
  if (compactCandidate.length >= keyword.length - maxDistance) {
    const start = Math.max(0, keyword.length - maxDistance);
    const end = keyword.length + maxDistance;
    for (let size = start; size <= end; size++) {
      for (let i = 0; i + size <= compactCandidate.length; i++) {
        const candidate = compactCandidate.slice(i, i + size);
        const distance = editDistance(candidate, keyword);
        if (distance <= maxDistance) return { hit: true, keyword: rawKeyword, normalizedKeyword: keyword, mode: 'fuzzy_compact', candidate, distance };
      }
    }
  }

  return { hit: false, keyword: rawKeyword, normalizedKeyword: keyword, mode: 'none', candidate: null, distance: null };
}

function keywordMatch(text) {
  const misses = [];
  for (const keyword of KEYWORDS) {
    const match = matchOneKeyword(text, keyword);
    if (match.hit) return match;
    misses.push(match.normalizedKeyword);
  }
  return { hit: false, keyword: null, keywords: misses, mode: 'none', candidate: null, distance: null };
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

  if (!commentId || !text) return { ok: false, reason: 'comentário sem id/texto' };
  const match = keywordMatch(text);
  if (!match.hit) { log('comment.ignored', { commentId, from, note: 'sem palavra-chave' }); return { ok: true, matched: false, match }; }

  log('comment.keyword_hit', { commentId, from, text, keyword: match.keyword || KEYWORD, matchMode: match.mode, matchCandidate: match.candidate, matchDistance: match.distance });

  if (!AUTO_SEND) {
    log('dm.queued', { commentId, from, note: 'DM_AUTO_SEND=false — registrado para aprovação, não enviado' });
    return { ok: true, matched: true, queued: true, match };
  }
  try {
    const res = await sendPrivateReply(cfg.igUserId, commentId, cfg.accessToken);
    log('dm.sent', { commentId, from, messageId: res.message_id || null, note: 'resposta privada enviada' });
    return { ok: true, matched: true, sent: true, match };
  } catch (e) {
    log('dm.failed', { commentId, from, note: e.message });
    return { ok: false, matched: true, error: e.message, match };
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
const sendCorsText = (res, status, text) => {
  res.writeHead(status, {
    'content-type': 'text/plain; charset=utf-8',
    'cache-control': 'no-store',
    'access-control-allow-origin': '*',
  });
  res.end(text);
};

// ── Server ───────────────────────────────────────────────────────────────────
let CFG = null;

function readiness() {
  const missing = [];
  if (!AUTO_SEND) missing.push('DM_AUTO_SEND=true');
  if (!MAGNET_URL) missing.push('MAGNET_URL');
  if (!APP_SECRET) missing.push('META_APP_SECRET');
  if (!VERIFY_TOKEN) missing.push('WEBHOOK_VERIFY_TOKEN');
  if (!CFG || !CFG.igUserId) missing.push('igUserId');
  if (!CFG || !CFG.accessToken) missing.push('Instagram access token');
  return { readyToSend: missing.length === 0, missing };
}

function magnetFile() {
  return fs.existsSync(MAGNET_FILE) ? MAGNET_FILE : PACKAGED_MAGNET_FILE;
}

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
    if (!lead.nome || !lead.whatsapp || !lead.email || !lead.site || !lead.negocio) return sendJson(res, 400, { error: 'campos obrigatórios ausentes' });
    const entry = { ...lead, receivedAt: new Date().toISOString(), source: lead.origem || 'lead-magnet' };
    const n = appendJson(CAPTURE_FILE, entry);
    log('lead.captured', { nome: lead.nome, negocio: lead.negocio, indice: lead.diagnostico && lead.diagnostico.index, note: `lead #${n}` });
    return sendJson(res, 201, { ok: true, id: n });
  }

  if (req.method === 'POST' && url.pathname === '/api/test-comment') {
    const raw = await readRaw(req);
    let body; try { body = JSON.parse(raw.toString('utf8')); } catch { return sendJson(res, 400, { error: 'json invalido' }); }
    const change = {
      field: 'comments',
      value: {
        id: body.commentId || `test-${Date.now()}`,
        text: body.text || KEYWORD,
        from: { username: body.from || 'teste-local' },
      },
    };
    const result = await handleComment(change, CFG);
    return sendJson(res, 202, { ok: true, keyword: KEYWORD, autoSend: AUTO_SEND, result });
  }

  if (req.method === 'GET' && url.pathname === '/api/match') {
    const text = url.searchParams.get('text') || '';
    return sendJson(res, 200, { ok: true, text, keywords: KEYWORDS, match: keywordMatch(text) });
  }

  if (req.method === 'GET' && url.pathname === '/api/logs') {
    const limit = Math.max(1, Math.min(200, Number(url.searchParams.get('limit')) || 50));
    const logs = readJson(LOG_FILE, []);
    return sendJson(res, 200, { ok: true, count: logs.length, items: logs.slice(-limit).reverse() });
  }

  if (req.method === 'GET' && url.pathname === '/api/captures') {
    const limit = Math.max(1, Math.min(200, Number(url.searchParams.get('limit')) || 50));
    const captures = readJson(CAPTURE_FILE, []);
    return sendJson(res, 200, { ok: true, count: captures.length, items: captures.slice(-limit).reverse() });
  }

  if (req.method === 'GET' && url.pathname === '/ping') {
    return sendCorsText(res, 200, 'ok');
  }

  // Serve a isca.
  if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/diagnostico' || url.pathname === '/diagnostico.html')) {
    fs.readFile(magnetFile(), (e, data) => {
      if (e) { res.writeHead(404); res.end('isca não encontrada'); return; }
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' }); res.end(data);
    });
    return;
  }

  if (url.pathname === '/health') {
    return sendJson(res, 200, {
      ok: true,
      slug: SLUG,
      keyword: KEYWORD,
      keywords: KEYWORDS,
      autoSend: AUTO_SEND,
      magnet: !!MAGNET_URL,
      magnetUrl: MAGNET_URL || null,
      appSecret: !!APP_SECRET,
      verifyToken: !!VERIFY_TOKEN,
      leadMagnetFile: fs.existsSync(magnetFile()),
      leadMagnetSource: fs.existsSync(MAGNET_FILE) ? 'client' : 'packaged',
      dm: readiness(),
      logs: readJson(LOG_FILE, []).length,
      captures: readJson(CAPTURE_FILE, []).length,
    });
  }

  res.writeHead(404); res.end('not found');
});

async function boot() {
  console.log('\n🛰️  MarketingOS — Motor de DM (comentário → DM)');
  console.log(`   Cliente: ${SLUG} · palavras-chave: ${KEYWORDS.join(', ')} · auto-send: ${AUTO_SEND}`);
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
