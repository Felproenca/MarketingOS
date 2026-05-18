#!/usr/bin/env node

const { spawnSync } = require('child_process');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function run(command, args) {
  const result = spawnSync(command, args, { cwd: ROOT, stdio: 'inherit' });
  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

function getOutput(command, args) {
  const result = spawnSync(command, args, { cwd: ROOT, encoding: 'utf8' });
  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
  return result.stdout.trim();
}

function main() {
  const status = getOutput('git', ['status', '--porcelain']);
  if (!status) {
    console.log('Nada para salvar. Working tree limpo.');
    return;
  }

  const message = process.argv.slice(2).join(' ').trim() || `chore(session): save changes ${new Date().toISOString()}`;
  run('git', ['add', '-A']);
  run('git', ['commit', '-m', message]);
  console.log('Commit criado com sucesso.');
  console.log('Push nao executado automaticamente por seguranca.');
}

main();
