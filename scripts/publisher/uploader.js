'use strict';

const fs = require('fs');
const path = require('path');

// Upload local file to imgbb → returns public URL
// imgbb is free, requires an API key (api.imgbb.com)
async function uploadToImgbb(filePath, apiKey) {
  const buffer = fs.readFileSync(filePath);
  const base64 = buffer.toString('base64');

  const body = new URLSearchParams();
  body.append('key', apiKey);
  body.append('image', base64);
  body.append('name', path.basename(filePath, path.extname(filePath)));

  const res = await fetch('https://api.imgbb.com/1/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  const data = await res.json();
  if (!data.success) throw new Error(`imgbb: ${JSON.stringify(data.error || data)}`);
  return data.data.url;
}

// Resolve a file-or-URL to a publicly accessible URL
// - If already a URL → return as-is
// - If local file + IMGBB key → upload and return
// - If local file + no key → throw with instructions
async function resolveUrl(fileOrUrl, imgbbApiKey) {
  if (/^https?:\/\//i.test(fileOrUrl)) return fileOrUrl;

  const absPath = path.resolve(fileOrUrl);
  if (!fs.existsSync(absPath)) {
    throw new Error(`Arquivo não encontrado: ${absPath}`);
  }

  if (!imgbbApiKey) {
    throw new Error(
      `Arquivo local detectado mas IMGBB_API_KEY não está configurado.\n\n` +
      `Opções:\n` +
      `  1. Adicione "imgbbApiKey" ao clients/[slug]/instagram-config.json\n` +
      `     Obtenha a key gratuita em: https://api.imgbb.com/\n` +
      `  2. Use uma URL pública diretamente (Cloudinary, S3, CDN próprio)\n\n` +
      `  Arquivo: ${absPath}`
    );
  }

  process.stdout.write(`  ↑ Upload: ${path.basename(absPath)}...`);
  const url = await uploadToImgbb(absPath, imgbbApiKey);
  console.log(` ✓`);
  return url;
}

module.exports = { resolveUrl };
