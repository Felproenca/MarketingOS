#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const STATE_DIR = path.join(ROOT, '.marketingos');
const STATE_FILE = path.join(STATE_DIR, 'state.json');
const CLIENTS_DIR = path.join(ROOT, 'clients');

function print(message) {
  console.log(message);
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

function ensureStateDir() {
  if (!fs.existsSync(STATE_DIR)) {
    fs.mkdirSync(STATE_DIR, { recursive: true });
  }
}

function readState() {
  if (!fs.existsSync(STATE_FILE)) {
    return { activeClient: null, updatedAt: null };
  }
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  } catch {
    return { activeClient: null, updatedAt: null };
  }
}

function writeState(state) {
  ensureStateDir();
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf8');
}

function listClientSlugs() {
  if (!fs.existsSync(CLIENTS_DIR)) {
    return [];
  }
  return fs
    .readdirSync(CLIENTS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('_'))
    .map((entry) => entry.name);
}

function clientDir(slug) {
  return path.join(CLIENTS_DIR, slug);
}

function requireActiveClient() {
  const state = readState();
  if (!state.activeClient) {
    fail('Nenhum cliente ativo. Use: /cliente [slug]');
  }

  const dir = clientDir(state.activeClient);
  if (!fs.existsSync(dir)) {
    fail(`Cliente ativo nao encontrado em disco: ${state.activeClient}`);
  }
  return state.activeClient;
}

function runCreateClient(slug) {
  const scriptPath = path.join(ROOT, 'scripts', 'create-client.js');
  const result = spawnSync('node', [scriptPath, slug], {
    cwd: ROOT,
    stdio: 'inherit',
  });
  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

function runScript(scriptName, args) {
  const scriptPath = path.join(ROOT, 'scripts', scriptName);
  const result = spawnSync('node', [scriptPath, ...args], {
    cwd: ROOT,
    stdio: 'inherit',
  });
  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

function setActiveClient(slug) {
  const dir = clientDir(slug);
  if (!fs.existsSync(dir)) {
    fail(`Cliente nao encontrado: ${slug}`);
  }
  writeState({ activeClient: slug, updatedAt: new Date().toISOString() });
  print(`Cliente ativo: ${slug}`);
}

function fileStatus(filePath) {
  if (!fs.existsSync(filePath)) {
    return 'ausente';
  }
  const stat = fs.statSync(filePath);
  return `ok (atualizado em ${stat.mtime.toISOString().slice(0, 10)})`;
}

function showStatus() {
  const slug = requireActiveClient();
  const dir = clientDir(slug);
  const files = ['client.md', 'notes.md', 'campaigns.md', 'metrics.json', 'estrategia.md', 'brand-kit.json'];

  print(`Cliente: ${slug}`);
  for (const file of files) {
    print(`${file}: ${fileStatus(path.join(dir, file))}`);
  }
}

function showUpdateChecklist() {
  const slug = requireActiveClient();
  const dir = clientDir(slug);

  const checks = [
    { file: 'client.md', required: true },
    { file: 'notes.md', required: true },
    { file: 'campaigns.md', required: true },
    { file: 'metrics.json', required: true },
    { file: 'estrategia.md', required: false },
  ];

  print(`Cliente ativo: ${slug}`);
  print('Checklist de atualizacao:');

  for (const item of checks) {
    const fullPath = path.join(dir, item.file);
    const exists = fs.existsSync(fullPath);
    if (!exists && item.required) {
      print(`- ${item.file}: ausente (precisa criar)`);
      continue;
    }
    if (!exists && !item.required) {
      print(`- ${item.file}: opcional (nao existe)`);
      continue;
    }
    const daysSinceUpdate = Math.floor((Date.now() - fs.statSync(fullPath).mtimeMs) / (1000 * 60 * 60 * 24));
    const stale = daysSinceUpdate > 30 ? 'desatualizado' : 'ok';
    print(`- ${item.file}: ${stale} (${daysSinceUpdate} dias)`);
  }
}

function printCommandHelp() {
  print('Comandos disponiveis:');
  print('/novo [slug]');
  print('/cliente [slug]');
  print('/status');
  print('/atualizar');
  print('/demo /carrossel /post /imagem /site /oferta /captacao /relatorio /funil /retencao /reativacao /salvar');
}

function routeMappedCommand(command) {
  const map = {
    '/demo': 'workflows/client-demo.md',
    '/post': 'skills/skill-post.md',
    '/imagem': 'skills/skill-image-generation.md',
    '/site': 'skills/skill-site-builder.md',
    '/oferta': 'skills/skill-offer-positioning.md',
    '/captacao': 'skills/skill-lead-capture.md',
    '/relatorio': 'skills/skill-dashboard.md',
    '/funil': 'skills/skill-funnel-analysis.md',
    '/retencao': 'skills/skill-retention.md',
    '/reativacao': 'skills/skill-reactivation.md',
    '/salvar': 'scripts/save.js',
  };

  if (!map[command]) {
    return false;
  }

  if (command !== '/salvar') {
    requireActiveClient();
  }

  print(`Comando reconhecido: ${command}`);
  print(`Execute: ${map[command]}`);
  return true;
}

function runCarouselCommand(rawArgs) {
  const slug = requireActiveClient();
  const hasTema = rawArgs.includes('--tema');
  if (!hasTema) {
    fail('Uso: /carrossel --tema [tema] [--objetivo ...] [--slides 7] [--cta ...]');
  }

  const args = ['--slug', slug, ...rawArgs];
  runScript('generate-carousel.js', args);
}

function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const value = args[1];
  const rawArgs = args.slice(1);

  if (!command) {
    printCommandHelp();
    process.exit(0);
  }

  if (command === '/novo') {
    if (!value) {
      fail('Uso: /novo [slug]');
    }
    runCreateClient(value);
    setActiveClient(value);
    return;
  }

  if (command === '/cliente') {
    if (!value) {
      fail('Uso: /cliente [slug]');
    }
    setActiveClient(value);
    return;
  }

  if (command === '/status') {
    showStatus();
    return;
  }

  if (command === '/atualizar') {
    showUpdateChecklist();
    return;
  }

  if (command === '/carrossel') {
    runCarouselCommand(rawArgs);
    return;
  }

  if (routeMappedCommand(command)) {
    return;
  }

  print('Comando desconhecido.');
  printCommandHelp();
  process.exit(1);
}

main();
