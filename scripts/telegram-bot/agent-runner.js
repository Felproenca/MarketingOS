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

function findCodexExecutable() {
  if (process.env.CODEX_EXECUTABLE) return process.env.CODEX_EXECUTABLE;
  if (process.platform !== 'win32') return 'codex';
  const extensionsDir = path.join(process.env.USERPROFILE || '', '.vscode', 'extensions');
  if (fs.existsSync(extensionsDir)) {
    const installations = fs.readdirSync(extensionsDir)
      .filter((name) => name.startsWith('openai.chatgpt-'))
      .sort()
      .reverse();
    for (const installation of installations) {
      const executable = path.join(extensionsDir, installation, 'bin', 'windows-x86_64', 'codex.exe');
      if (fs.existsSync(executable)) return executable;
    }
  }
  throw new Error('Executavel nativo do Codex nao encontrado. Configure CODEX_EXECUTABLE.');
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
    const executable = findCodexExecutable();
    const args = [
      'exec', '-',
      '--cd', ROOT,
      '--sandbox', 'workspace-write',
      '--color', 'never',
      '--output-last-message', outputFile,
    ];
    const child = spawn(executable, args, {
      cwd: ROOT,
      env: { ...process.env, CODEX_NON_INTERACTIVE: '1' },
      windowsHide: true,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    let logs = '';
    const collect = (chunk) => {
      logs += chunk.toString();
      if (logs.length > 100000) logs = logs.slice(-100000);
    };
    child.stdout.on('data', collect);
    child.stderr.on('data', collect);
    child.stdin.end(buildPrompt(job), 'utf8');

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
      fs.writeFileSync(logFile, logs, 'utf8');
      if (code !== 0) {
        reject(new Error(`Codex encerrou com codigo ${code}. Consulte ${path.relative(ROOT, logFile)}.`));
        return;
      }
      const result = fs.existsSync(outputFile) ? fs.readFileSync(outputFile, 'utf8').trim() : '';
      if (!result) return reject(new Error('Codex terminou sem mensagem final.'));
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
