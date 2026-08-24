'use strict';

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const store = require('./store');
const { CLIENTS } = require('./operations');

const ROOT = path.resolve(__dirname, '../..');
const JOBS_DIR = path.join(store.DATA_DIR, 'jobs');
const TIMEOUT_MS = Number(process.env.TELEGRAM_AGENT_TIMEOUT_MS || 15 * 60 * 1000);
const queue = [];
let processing = false;

const PI_CLI = process.env.PI_CLI_PATH
  || path.join(
      process.env.USERPROFILE || '',
      'AppData', 'Roaming', 'npm', 'node_modules',
      '@earendil-works', 'pi-coding-agent', 'dist', 'cli.js',
    );

function findNodeExecutable() {
  return process.env.NODE_EXECUTABLE || 'node';
}

function buildPrompt(job) {
  const operation = CLIENTS[job.client];
  return [
    'Voce e o executor local do MarketingOS acionado por uma fila privada do Telegram.',
    `Cliente ativo: ${operation.label} (${job.client}).`,
    `Pasta do cliente: clients/${job.client}.`,
    '',
    'Regras obrigatorias:',
    '- Siga AGENTS.md, CLAUDE.md e as instrucoes do repositorio.',
    '- Trabalhe apenas dentro deste workspace.',
    '- Pode analisar e criar artefatos locais necessarios para atender ao pedido.',
    '- Nao publique, envie mensagens a terceiros, compre, implante, apague dados, altere credenciais ou execute outra acao externa.',
    '- Quando uma acao externa for necessaria, prepare o material e indique claramente que aguarda aprovacao.',
    '- Nao trate dados ausentes ou nao coletados como resultado zero.',
    '- Termine com um resumo curto em portugues, incluindo entregas, arquivos criados e bloqueios reais.',
    '',
    '<solicitacao_telegram>',
    job.text,
    '</solicitacao_telegram>',
  ].join('\n');
}

function execute(job) {
  return new Promise((resolve, reject) => {
    fs.mkdirSync(JOBS_DIR, { recursive: true });
    const outputFile = path.join(JOBS_DIR, `${job.taskId}.md`);
    const logFile = path.join(JOBS_DIR, `${job.taskId}.log`);
    const promptFile = path.join(JOBS_DIR, `${job.taskId}.prompt.txt`);

    if (!fs.existsSync(PI_CLI)) {
      return reject(new Error(`PI CLI nao encontrado em ${PI_CLI}. Configure PI_CLI_PATH.`));
    }
    fs.writeFileSync(promptFile, buildPrompt(job), 'utf8');

    const args = [
      PI_CLI,
      '-p', `@${promptFile}`,
      '--provider', process.env.PI_PROVIDER || 'deepseek',
      '--model', process.env.PI_MODEL || 'deepseek-v4-pro',
      '--no-session',
    ];

    const child = spawn(findNodeExecutable(), args, {
      cwd: ROOT,
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';
    const collectOut = (chunk) => {
      stdout += chunk.toString();
      if (stdout.length > 200000) stdout = stdout.slice(-200000);
    };
    const collectErr = (chunk) => {
      stderr += chunk.toString();
      if (stderr.length > 100000) stderr = stderr.slice(-100000);
    };
    child.stdout.on('data', collectOut);
    child.stderr.on('data', collectErr);

    const timer = setTimeout(() => {
      child.kill();
      reject(new Error(`Execucao excedeu ${Math.round(TIMEOUT_MS / 60000)} minutos.`));
    }, TIMEOUT_MS);

    child.on('error', (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      fs.writeFileSync(logFile, `STDOUT:\n${stdout}\n\nSTDERR:\n${stderr}`, 'utf8');
      if (code !== 0) {
        reject(new Error(`PI encerrou com codigo ${code}. Consulte ${path.relative(ROOT, logFile)}.`));
        return;
      }
      const result = stdout.trim();
      if (!result) return reject(new Error('PI terminou sem resposta.'));
      fs.writeFileSync(outputFile, result, 'utf8');
      resolve({ result, outputFile: path.relative(ROOT, outputFile) });
    });
  });
}

async function drain() {
  if (processing) return;
  processing = true;
  while (queue.length) {
    const job = queue.shift();
    store.updateTask(job.taskId, { status: 'running', startedAt: new Date().toISOString() });
    try {
      const delivery = await execute(job);
      store.updateTask(job.taskId, {
        status: 'done',
        completedAt: new Date().toISOString(),
        deliveryFile: delivery.outputFile,
      });
      await job.onComplete(delivery.result);
    } catch (error) {
      store.updateTask(job.taskId, { status: 'failed', error: error.message });
      await job.onError(error);
    }
  }
  processing = false;
}

function enqueue(job) {
  queue.push(job);
  setImmediate(drain);
  return queue.length + (processing ? 1 : 0);
}

module.exports = { enqueue };
