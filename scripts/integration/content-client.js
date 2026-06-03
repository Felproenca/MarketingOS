'use strict';

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const AGENT_URL = process.env.SOCIAL_AGENT_URL || 'http://localhost:8000';
const API_KEY = process.env.SOCIAL_AGENT_KEY || '';

async function requestContent(brief) {
  console.log('\nEnviando brief para social-content-agents...');
  console.log(`  Cliente: ${brief.client_slug}`);
  console.log(`  Nicho: ${brief.nicho}`);
  console.log(`  Objetivo: ${brief.objetivo}`);
  console.log(`  Plataforma: ${brief.plataforma}`);

  const response = await post('/api/brief', brief);

  if (response.status === 'aguardando_imagens') {
    printImagePrompts(response);
  }

  return response;
}

async function uploadImage(contentId, slideNumber, imagePath) {
  if (!fs.existsSync(imagePath)) {
    throw new Error(`Imagem nao encontrada: ${imagePath}`);
  }

  console.log(`\nUpload de imagem - content ${contentId}, slide ${slideNumber}`);
  const imageBuffer = fs.readFileSync(imagePath);

  return post('/api/upload-image', {
    content_id: contentId,
    slide_number: Number(slideNumber),
    image_base64: imageBuffer.toString('base64'),
    image_name: path.basename(imagePath),
  });
}

async function checkStatus(contentId) {
  return get(`/api/status/${encodeURIComponent(contentId)}`);
}

async function downloadPNGs(contentId, outputDir) {
  console.log(`\nBaixando PNGs do conteudo ${contentId}...`);
  const status = await checkStatus(contentId);

  if (status.status !== 'pronto_para_publicar') {
    console.log(`  Status atual: ${status.status || 'desconhecido'}`);
    if (status.status === 'aguardando_imagens') printImagePrompts(status);
    return [];
  }

  fs.mkdirSync(outputDir, { recursive: true });
  const localPaths = [];

  for (const pngUrl of status.png_urls || []) {
    const resolvedUrl = new URL(pngUrl, AGENT_URL).toString();
    const fileName = path.basename(new URL(resolvedUrl).pathname) || `slide-${localPaths.length + 1}.png`;
    const localPath = path.join(outputDir, fileName);
    await downloadFile(resolvedUrl, localPath);
    localPaths.push(localPath);
    console.log(`  ok ${fileName}`);
  }

  return localPaths;
}

async function sendMetrics(contentId, metrics) {
  return post('/api/learn', {
    content_id: contentId,
    metrics,
    source: 'marketingos',
  });
}

async function post(endpoint, data) {
  return request('POST', endpoint, data);
}

async function get(endpoint) {
  return request('GET', endpoint);
}

function request(method, endpoint, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, AGENT_URL);
    const isHttps = url.protocol === 'https:';
    const lib = isHttps ? https : http;
    const body = data ? JSON.stringify(data) : null;

    const headers = { Accept: 'application/json' };
    if (body) {
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = Buffer.byteLength(body);
    }
    if (API_KEY) headers.Authorization = `Bearer ${API_KEY}`;

    const req = lib.request({
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method,
      headers,
    }, (res) => {
      let rawData = '';
      res.setEncoding('utf8');
      res.on('data', chunk => rawData += chunk);
      res.on('end', () => {
        const parsed = parseJSON(rawData);
        if (res.statusCode >= 400) {
          const message = parsed?.error || parsed?.message || rawData || `HTTP ${res.statusCode}`;
          reject(new Error(message));
          return;
        }
        resolve(parsed);
      });
    });

    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

function downloadFile(fileUrl, dest, redirects = 0) {
  return new Promise((resolve, reject) => {
    const url = new URL(fileUrl);
    const lib = url.protocol === 'https:' ? https : http;

    const req = lib.get(url, (res) => {
      if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
        if (redirects >= 5) {
          reject(new Error('Redirecionamentos demais ao baixar arquivo.'));
          return;
        }
        resolve(downloadFile(new URL(res.headers.location, fileUrl).toString(), dest, redirects + 1));
        return;
      }

      if (res.statusCode >= 400) {
        reject(new Error(`Download falhou (${res.statusCode}): ${fileUrl}`));
        return;
      }

      fs.mkdirSync(path.dirname(dest), { recursive: true });
      const stream = fs.createWriteStream(dest);
      res.pipe(stream);
      stream.on('finish', () => stream.close(resolve));
      stream.on('error', reject);
    });

    req.on('error', reject);
  });
}

function printImagePrompts(response) {
  const prompts = response?.pipeline_status?.image_prompts || response?.image_prompts || [];
  if (!prompts.length) return;

  console.log('\nPipeline pausado - imagens necessarias:');
  for (const prompt of prompts) {
    console.log(`\n  Slide ${prompt.slide_number || prompt.slide || '?'}`);
    console.log(`  ${prompt.prompt_en || prompt.prompt || ''}`);
    console.log(`  Proporcao: ${prompt.aspect_ratio || prompt.ratio || 'n/a'}`);
  }
  console.log('\nDepois de gerar as imagens:');
  console.log('  npm run upload-image -- --content <content_id> --slide <N> --file <caminho>');
}

function parseJSON(rawData) {
  if (!rawData) return {};
  try {
    return JSON.parse(rawData);
  } catch {
    return { raw: rawData };
  }
}

module.exports = {
  requestContent,
  uploadImage,
  checkStatus,
  downloadPNGs,
  sendMetrics,
};
