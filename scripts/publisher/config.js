'use strict';

/**
 * config.js — Carrega credenciais Meta de clients/[slug]/instagram-config.json.
 * Compartilhado entre o publisher e o puxador de insights.
 * Variáveis de ambiente têm precedência sobre o arquivo.
 */

const fs = require('fs');
const path = require('path');

function loadConfig(slug) {
  const configPath = path.resolve(__dirname, '../../clients', slug, 'instagram-config.json');

  if (!fs.existsSync(configPath)) {
    throw new Error(
      `Config não encontrado: clients/${slug}/instagram-config.json\n\n` +
      `Copie o template:\n` +
      `  cp clients/_template/instagram-config.json clients/${slug}/instagram-config.json\n` +
      `\nPreencha com:\n` +
      `  accessToken — Graph API Explorer com permissões instagram_content_publish + instagram_manage_insights\n` +
      `  igUserId    — ID numérico da conta Instagram Business`
    );
  }

  const raw = JSON.parse(fs.readFileSync(configPath, 'utf8'));

  return {
    accessToken: process.env.INSTAGRAM_ACCESS_TOKEN || raw.accessToken,
    igUserId:    process.env.INSTAGRAM_USER_ID      || raw.igUserId,
    pageId:      process.env.FACEBOOK_PAGE_ID       || raw.pageId      || null,
    imgbbApiKey: process.env.IMGBB_API_KEY          || raw.imgbbApiKey || null,
  };
}

module.exports = { loadConfig };
