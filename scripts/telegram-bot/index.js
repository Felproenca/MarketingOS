#!/usr/bin/env node
'use strict';

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { TelegramApi } = require('./api');
const store = require('./store');
const { CLIENTS, resolveClient } = require('./operations');
const agentRunner = require('./agent-runner');

const token = process.env.TELEGRAM_BOT_TOKEN;
const allowedIds = new Set(
  String(process.env.TELEGRAM_ALLOWED_USER_IDS || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean),
);
const api = token ? new TelegramApi(token) : null;
let running = true;

function fail(message) {
  console.error(message);
  process.exit(1);
}

function authorized(userId) {
  return allowedIds.size > 0 && allowedIds.has(String(userId));
}

function activeClient(userId) {
  return store.getUser(userId).activeClient;
}

function requireClient(userId) {
  const client = activeClient(userId);
  if (!client) throw new Error('Escolha primeiro: /cliente toque ou /cliente fortunato');
  return client;
}

function helpText() {
  return [
    'MarketingOS operacional',
    '',
    '/cliente toque | fortunato - define o contexto',
    '/hoje - prioridades e tarefas abertas',
    '/status - objetivo, metrica e funil',
    '/pedir texto - cria uma tarefa',
    '/tarefas - lista tarefas abertas',
    '/feito ID - conclui uma tarefa',
    '/bloqueios - mostra o que impede resultado',
    '/evidencia texto - registra uma entrega ou resultado',
    '/acessos - checklist seguro de acessos',
    '',
    'Pedidos em linguagem natural acionam o executor local do Codex.',
    'Tambem aceito audio: salvo no cliente ativo para transcricao e analise.',
    'Nunca envie senhas pelo Telegram; use acesso delegado.',
  ].join('\n');
}

async function sendLongMessage(chatId, text) {
  const content = String(text || '');
  const chunks = [];
  let remaining = content;
  while (remaining.length > 3900) {
    let splitAt = remaining.lastIndexOf('\n', 3900);
    if (splitAt < 1000) splitAt = 3900;
    chunks.push(remaining.slice(0, splitAt));
    remaining = remaining.slice(splitAt).trimStart();
  }
  if (remaining) chunks.push(remaining);
  for (const chunk of chunks) await api.sendMessage(chatId, chunk);
}

function statusText(client) {
  const operation = CLIENTS[client];
  return [
    operation.label,
    `Objetivo: ${operation.objective}`,
    `Metrica primaria: ${operation.primaryMetric}`,
    `Funil: ${operation.funnel.join(' -> ')}`,
    '',
    'Nota: campo zero sem coleta e "nao medido", nao prova de resultado zero.',
  ].join('\n');
}

function todayText(client) {
  const operation = CLIENTS[client];
  const tasks = store.listTasks(client);
  return [
    `${operation.label} - foco operacional`,
    '',
    ...operation.priorities.map((item, index) => `${index + 1}. ${item}`),
    '',
    `Tarefas abertas: ${tasks.length}`,
    ...(tasks.length ? tasks.slice(0, 8).map((task) => `- ${task.id}: ${task.text}`) : ['- nenhuma; use /pedir']),
  ].join('\n');
}

async function saveVoice(message, userId) {
  const client = requireClient(userId);
  const media = message.voice || message.audio;
  if (Number(media.file_size || 0) > 20 * 1024 * 1024) {
    throw new Error('O audio excede o limite de download de 20 MB do Bot API.');
  }
  const { file, buffer } = await api.downloadFile(media.file_id);
  const extension = path.extname(file.file_path || '') || (message.voice ? '.ogg' : '.audio');
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const dir = path.resolve(__dirname, '../../clients', client, 'inputs', 'audio', 'telegram');
  fs.mkdirSync(dir, { recursive: true });
  const target = path.join(dir, `${stamp}${extension}`);
  fs.writeFileSync(target, buffer);
  const task = store.addTask({
    client,
    text: `Transcrever e analisar audio do Telegram: ${path.relative(path.resolve(__dirname, '../..'), target)}`,
    source: 'telegram_audio',
    createdBy: userId,
  });
  return `Audio salvo em ${CLIENTS[client].label}. Tarefa ${task.id} criada para transcricao e analise.`;
}

async function runCommand(message) {
  const userId = message.from.id;
  const chatId = message.chat.id;
  const raw = String(message.text || '').trim();
  const [commandWithBot, ...parts] = raw.split(/\s+/);
  const command = commandWithBot.toLowerCase().split('@')[0];
  const value = parts.join(' ').trim();

  if (['/start', '/help', '/ajuda'].includes(command)) return api.sendMessage(chatId, helpText());

  if (command === '/cliente') {
    const client = resolveClient(value);
    if (!client) throw new Error('Use /cliente toque ou /cliente fortunato');
    store.setActiveClient(userId, client);
    return api.sendMessage(chatId, `Contexto ativo: ${CLIENTS[client].label}\n\n${statusText(client)}`);
  }

  const client = requireClient(userId);
  if (command === '/status') return api.sendMessage(chatId, statusText(client));
  if (command === '/hoje') return api.sendMessage(chatId, todayText(client));
  if (command === '/bloqueios') {
    return api.sendMessage(chatId, `${CLIENTS[client].label} - bloqueios\n\n${CLIENTS[client].blockers.map((item) => `- ${item}`).join('\n')}`);
  }
  if (command === '/tarefas') {
    const tasks = store.listTasks(client);
    return api.sendMessage(chatId, tasks.length ? tasks.map((task) => `${task.id} - ${task.text}`).join('\n') : 'Nenhuma tarefa aberta.');
  }
  if (command === '/pedir') {
    if (!value) throw new Error('Uso: /pedir descreva a tarefa');
    const task = store.addTask({ client, text: value, source: 'telegram', createdBy: userId });
    return api.sendMessage(chatId, `Tarefa ${task.id} criada para ${CLIENTS[client].label}.`);
  }
  if (command === '/feito') {
    if (!value) throw new Error('Uso: /feito ID');
    const task = store.completeTask(value, client);
    if (!task) throw new Error('Tarefa nao encontrada no cliente ativo.');
    return api.sendMessage(chatId, `${task.id} concluida: ${task.text}`);
  }
  if (command === '/evidencia') {
    if (!value) throw new Error('Uso: /evidencia descreva a entrega ou resultado');
    const evidence = store.addEvidence({ client, text: value, createdBy: userId });
    return api.sendMessage(chatId, `Evidencia ${evidence.id} registrada para ${CLIENTS[client].label}.`);
  }
  if (command === '/acessos') {
    return api.sendMessage(chatId, [
      `${CLIENTS[client].label} - acessos necessarios`,
      '',
      '- Meta Business Suite: parceiro/usuario, sem compartilhar senha',
      '- Instagram: permissoes via Meta',
      '- GA4 e Search Console: acesso de leitura',
      '- Site/CMS: usuario individual com 2FA',
      '- WhatsApp: relatorio de conversas e pedidos; API apenas quando aprovada',
      '',
      'Nunca envie senha ou codigo de 2FA neste chat.',
    ].join('\n'));
  }

  return api.sendMessage(chatId, `Comando nao reconhecido.\n\n${helpText()}`);
}

function inferClientFromText(text) {
  const lower = String(text).toLowerCase();
  if (/\bfortunato\b/.test(lower)) return 'fortunato';
  if (/\btoque\s*indiano\b|\btoqueindiano\b/.test(lower)) return 'toqueindiano';
  return null;
}

async function handleNaturalMessage(message) {
  const userId = message.from.id;
  const chatId = message.chat.id;
  const text = String(message.text || '').trim();
  const lower = text.toLowerCase();
  const inferredClient = inferClientFromText(text);

  if (inferredClient && inferredClient !== activeClient(userId)) {
    store.setActiveClient(userId, inferredClient);
  }
  const client = inferredClient || requireClient(userId);

  if (/^(oi|ola|olá|bom dia|boa tarde|boa noite)[!. ]*$/.test(lower)) {
    return api.sendMessage(chatId, `Ola. Estou no contexto de ${CLIENTS[client].label}. Pode pedir normalmente o que precisa.`);
  }
  if (/\b(status|situacao|situação|como estamos)\b/.test(lower)) {
    return api.sendMessage(chatId, statusText(client));
  }
  if (/\b(hoje|prioridades?|o que fazer|proximos passos|próximos passos|pendencias|pendências)\b/.test(lower)) {
    return api.sendMessage(chatId, todayText(client));
  }
  if (/\b(bloqueios?|impedimentos?|travando)\b/.test(lower)) {
    return api.sendMessage(chatId, `${CLIENTS[client].label} - bloqueios\n\n${CLIENTS[client].blockers.map((item) => `- ${item}`).join('\n')}`);
  }

  const doneMatch = text.match(/(?:feito|concluir|conclua|finalizar)\s+(T[A-Z0-9]+)/i);
  if (doneMatch) {
    const task = store.completeTask(doneMatch[1], client);
    if (!task) throw new Error('Tarefa nao encontrada no cliente identificado.');
    return api.sendMessage(chatId, `${task.id} concluida: ${task.text}`);
  }

  const task = store.addTask({ client, text, source: 'telegram_natural', createdBy: userId });
  const position = agentRunner.enqueue({
    taskId: task.id,
    client,
    text,
    onComplete: async (result) => {
      await sendLongMessage(chatId, `Entrega ${task.id} - ${CLIENTS[client].label}\n\n${result}`);
    },
    onError: async (error) => {
      await api.sendMessage(chatId, `A execucao ${task.id} falhou: ${error.message}`);
    },
  });
  return api.sendMessage(chatId, [
    `Solicitacao ${task.id} recebida para ${CLIENTS[client].label}.`,
    `Posicao de processamento: ${position}.`,
    'O Codex local vai executar e devolver a entrega aqui. Acoes externas permanecem bloqueadas.',
  ].join('\n'));
}

async function handleUpdate(update) {
  const message = update.message;
  const callback = update.callback_query;
  const user = message?.from || callback?.from;
  const chatId = message?.chat?.id || callback?.message?.chat?.id;
  if (!user || !chatId) return;

  if (!authorized(user.id)) {
    console.warn(`Acesso negado para Telegram user_id=${user.id}`);
    await api.sendMessage(chatId, `Acesso nao autorizado. Seu user ID e ${user.id}. Adicione-o em TELEGRAM_ALLOWED_USER_IDS.`);
    return;
  }

  if (callback) {
    await api.answerCallbackQuery(callback.id, 'Recebido');
    return;
  }

  try {
    if (message.voice || message.audio) {
      await api.sendMessage(chatId, await saveVoice(message, user.id));
      return;
    }
    if (!message.text?.startsWith('/')) return await handleNaturalMessage(message);
    await runCommand(message);
  } catch (error) {
    await api.sendMessage(chatId, `Nao consegui executar: ${error.message}`);
  }
}

async function check() {
  if (!token) fail('TELEGRAM_BOT_TOKEN nao configurado no .env');
  if (!allowedIds.size) fail('TELEGRAM_ALLOWED_USER_IDS nao configurado no .env');
  const me = await api.getMe();
  console.log(`Telegram OK: @${me.username} | ${allowedIds.size} usuario(s) autorizado(s)`);
}

async function main() {
  if (process.argv.includes('--check')) return check();
  if (!token) fail('Configure TELEGRAM_BOT_TOKEN no .env');
  if (!allowedIds.size) fail('Configure TELEGRAM_ALLOWED_USER_IDS no .env');

  const me = await api.getMe();
  console.log(`MarketingOS Telegram ativo como @${me.username}`);
  console.log(`Usuarios autorizados: ${allowedIds.size}`);
  console.log('Long polling iniciado. Ctrl+C para encerrar.');

  let offset = 0;
  while (running) {
    try {
      const updates = await api.getUpdates(offset, 30);
      for (const update of updates) {
        offset = Math.max(offset, update.update_id + 1);
        await handleUpdate(update);
      }
    } catch (error) {
      console.error(`[telegram] ${error.message}`);
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }
}

process.on('SIGINT', () => { running = false; });
process.on('SIGTERM', () => { running = false; });

main().catch((error) => fail(error.stack || error.message));
