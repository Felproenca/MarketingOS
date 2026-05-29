'use strict';
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

function profileDir(platform) {
  return path.resolve(__dirname, '../../.sherlock/_browser_profile', platform);
}

function hasSession(platform) {
  const dir = profileDir(platform);
  try {
    const entries = fs.readdirSync(dir);
    return entries.length > 0;
  } catch {
    return false;
  }
}

async function launch(platform, headless = true) {
  const dir = profileDir(platform);
  fs.mkdirSync(dir, { recursive: true });

  const ctx = await chromium.launchPersistentContext(dir, {
    headless,
    viewport: { width: 1280, height: 800 },
    userAgent: UA,
    locale: 'pt-BR',
    args: ['--no-sandbox', '--disable-blink-features=AutomationControlled'],
    ignoreDefaultArgs: ['--enable-automation'],
  });

  return ctx;
}

async function getReadyContext(platform, loginCheck) {
  // First try headless with existing session
  if (hasSession(platform)) {
    const ctx = await launch(platform, true);
    const page = await ctx.newPage();
    const loggedIn = await loginCheck(page);
    if (loggedIn) {
      console.log(`✅ Sessão ${platform} ativa.`);
      return { ctx, page };
    }
    await ctx.close();
    console.log(`⚠️  Sessão ${platform} expirada. Abrindo navegador para login...`);
  } else {
    console.log(`🔐 Primeira vez em ${platform}. Abrindo navegador para login...`);
  }

  // Launch visible for manual login
  const ctx = await launch(platform, false);
  const page = await ctx.newPage();

  return { ctx, page, needsLogin: true };
}

async function waitForLogin(page, loginCheck, platform) {
  console.log(`\n   Faça login no ${platform} no navegador aberto.`);
  console.log('   Aguardando autenticação...\n');

  const timeout = 5 * 60 * 1000; // 5 minutes
  const start = Date.now();

  while (Date.now() - start < timeout) {
    await page.waitForTimeout(2000);
    const ok = await loginCheck(page);
    if (ok) {
      console.log(`✅ Login detectado! Sessão salva.\n`);
      return true;
    }
  }

  throw new Error(`Timeout aguardando login no ${platform}.`);
}

module.exports = { getReadyContext, waitForLogin, hasSession };
