'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const MARKETING_ROOT = path.resolve(__dirname, '../..');
try { require('dotenv').config({ path: path.join(MARKETING_ROOT, '.env') }); } catch {}
const STATE_DIR = path.join(MARKETING_ROOT, '.marketingos');
const STATE_FILE = path.join(STATE_DIR, 'meta-oauth-state.json');
const GRAPH_VERSION = process.env.META_GRAPH_VERSION || 'v19.0';
const GRAPH = `https://graph.facebook.com/${GRAPH_VERSION}`;

function env(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Variável ${name} não configurada.`);
  return value;
}

function redirectUri() {
  return process.env.META_OAUTH_REDIRECT_URI || 'https://app.mkos.online/api/integrations/meta/callback';
}

function readStates() {
  if (!fs.existsSync(STATE_FILE)) return {};
  try { return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')); } catch { return {}; }
}

function writeStates(states) {
  fs.mkdirSync(STATE_DIR, { recursive: true });
  fs.writeFileSync(STATE_FILE, `${JSON.stringify(states, null, 2)}\n`, { mode: 0o600 });
}

function start(clientId) {
  if (!/^[a-z0-9][a-z0-9_-]{1,80}$/i.test(clientId)) throw new Error('client_id inválido.');
  const state = crypto.randomBytes(32).toString('hex');
  const states = readStates();
  states[state] = { clientId, createdAt: Date.now() };
  writeStates(states);
  const params = new URLSearchParams({
    client_id: env('META_APP_ID'),
    redirect_uri: redirectUri(),
    state,
    response_type: 'code',
    scope: process.env.META_OAUTH_SCOPES || 'instagram_basic,instagram_manage_insights,instagram_content_publish,pages_show_list,pages_read_engagement',
  });
  return { state, url: `https://www.facebook.com/${GRAPH_VERSION}/dialog/oauth?${params}` };
}

async function graph(pathname, params) {
  const url = new URL(`${GRAPH}${pathname}`);
  for (const [key, value] of Object.entries(params || {})) url.searchParams.set(key, value);
  const response = await fetch(url);
  const body = await response.json();
  if (!response.ok || body.error) throw new Error(body.error?.message || `Meta API HTTP ${response.status}`);
  return body;
}

async function exchange(code) {
  const short = await graph('/oauth/access_token', { client_id: env('META_APP_ID'), client_secret: env('META_APP_SECRET'), redirect_uri: redirectUri(), code });
  const long = await graph('/oauth/access_token', { grant_type: 'fb_exchange_token', client_id: env('META_APP_ID'), client_secret: env('META_APP_SECRET'), fb_exchange_token: short.access_token });
  return { accessToken: long.access_token || short.access_token, expiresIn: Number(long.expires_in || short.expires_in || 0) };
}

function writeClientConfig(clientId, connection) {
  const clientDir = path.join(MARKETING_ROOT, 'clients', clientId);
  if (!fs.existsSync(clientDir)) throw new Error(`Cliente não encontrado: clients/${clientId}`);
  const file = path.join(clientDir, 'instagram-config.json');
  let previous = {};
  if (fs.existsSync(file)) previous = JSON.parse(fs.readFileSync(file, 'utf8'));
  const config = { ...previous, accessToken: connection.accessToken, igUserId: connection.igUserId, igUsername: connection.igUsername || null, pageId: connection.pageId || previous.pageId || null, accessTokenExpiresAt: connection.expiresIn ? new Date(Date.now() + connection.expiresIn * 1000).toISOString() : null, connectedAt: new Date().toISOString(), authSource: 'meta-oauth' };
  const temp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(temp, `${JSON.stringify(config, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 });
  fs.renameSync(temp, file);
  return { file, igUserId: config.igUserId, igUsername: config.igUsername, expiresAt: config.accessTokenExpiresAt };
}

async function callback({ code, state, error, errorDescription }) {
  if (error) throw new Error(errorDescription || error);
  if (!code || !state) throw new Error('Callback Meta incompleto.');
  const states = readStates();
  const entry = states[state];
  delete states[state];
  writeStates(states);
  if (!entry || Date.now() - entry.createdAt > 10 * 60 * 1000) throw new Error('OAuth state inválido ou expirado.');
  const token = await exchange(code);
  const me = await graph('/me', { fields: 'id,name', access_token: token.accessToken });
  const pages = await graph(`/${me.id}/accounts`, { fields: 'id,name,instagram_business_account{id,username}', access_token: token.accessToken });
  const page = (pages.data || []).find((item) => item.instagram_business_account?.id);
  if (!page) throw new Error('Nenhuma conta Instagram Business/Creator vinculada foi encontrada.');
  const ig = page.instagram_business_account;
  const saved = writeClientConfig(entry.clientId, { accessToken: token.accessToken, expiresIn: token.expiresIn, pageId: page.id, igUserId: ig.id, igUsername: ig.username });
  return { clientId: entry.clientId, ...saved };
}

function status(clientId) {
  const file = path.join(MARKETING_ROOT, 'clients', clientId, 'instagram-config.json');
  if (!fs.existsSync(file)) return { clientId, connected: false, reason: 'config_missing' };
  const config = JSON.parse(fs.readFileSync(file, 'utf8'));
  return { clientId, connected: Boolean(config.accessToken && config.igUserId), igUserId: config.igUserId || null, igUsername: config.igUsername || null, expiresAt: config.accessTokenExpiresAt || null, authSource: config.authSource || 'manual' };
}

module.exports = { start, callback, status, redirectUri };
