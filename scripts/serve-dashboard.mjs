import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { exec } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const PORT = 3333;
const TI_DASHBOARD = path.join(ROOT, 'site', 'toque-indiano-competitivo.html');
const FT_DASHBOARD = path.join(ROOT, 'site', 'forca-da-terra-competitivo.html');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split('?')[0]);

  // Routes for Toque Indiano
  if (
    urlPath === '/toque-indiano' ||
    urlPath === '/toque-indiano-competitivo' ||
    urlPath === '/toque-indiano.html' ||
    urlPath === '/toqueindiano'
  ) {
    if (fs.existsSync(TI_DASHBOARD)) {
      const content = fs.readFileSync(TI_DASHBOARD);
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Length': content.length,
        'Cache-Control': 'no-cache'
      });
      res.end(content);
      return;
    }
  }

  // Routes for Força da Terra
  if (
    urlPath === '/forca-da-terra' ||
    urlPath === '/forca-da-terra-competitivo' ||
    urlPath === '/forca-da-terra.html' ||
    urlPath === '/forcadaterra'
  ) {
    if (fs.existsSync(FT_DASHBOARD)) {
      const content = fs.readFileSync(FT_DASHBOARD);
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Length': content.length,
        'Cache-Control': 'no-cache'
      });
      res.end(content);
      return;
    }
  }

  // Root / or default: Toque Indiano if requested now, or fallback to TI
  if (urlPath === '/' || urlPath === '/index.html') {
    const defaultFile = fs.existsSync(TI_DASHBOARD) ? TI_DASHBOARD : FT_DASHBOARD;
    const content = fs.readFileSync(defaultFile);
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Length': content.length,
      'Cache-Control': 'no-cache'
    });
    res.end(content);
    return;
  }

  // Check possible directories for static assets/html
  const candidateDirs = [
    path.join(ROOT, 'site'),
    path.join(ROOT, 'public'),
    path.join(ROOT, 'dashboard'),
    path.join(ROOT, 'cockpit', 'public')
  ];

  for (const dir of candidateDirs) {
    const filePath = path.join(dir, urlPath.replace(/^\//, ''));
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      const content = fs.readFileSync(filePath);
      res.writeHead(200, {
        'Content-Type': contentType,
        'Content-Length': content.length
      });
      res.end(content);
      return;
    }
  }

  // Fallback
  if (fs.existsSync(TI_DASHBOARD)) {
    const content = fs.readFileSync(TI_DASHBOARD);
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Length': content.length
    });
    res.end(content);
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('404 Not Found');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n======================================================`);
  console.log(`🚀 SERVIDOR MARKETINGOS BI RODANDO COM SUCESSO!`);
  console.log(`👉 Toque Indiano: http://localhost:${PORT}/toque-indiano`);
  console.log(`👉 Força da Terra: http://localhost:${PORT}/forca-da-terra`);
  console.log(`======================================================\n`);
});
