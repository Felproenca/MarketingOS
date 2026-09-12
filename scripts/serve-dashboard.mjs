import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { exec } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const PORT = 3333;
const DASHBOARD_FILE = path.join(ROOT, 'site', 'forca-da-terra-competitivo.html');

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

  // Default routes for dashboard
  if (
    urlPath === '/' ||
    urlPath === '/forca-da-terra' ||
    urlPath === '/forca-da-terra-competitivo' ||
    urlPath === '/dashboard' ||
    urlPath === '/dashboard-forca-da-terra' ||
    urlPath === '/index.html' ||
    urlPath === '/forca-da-terra-competitivo.html'
  ) {
    if (fs.existsSync(DASHBOARD_FILE)) {
      const content = fs.readFileSync(DASHBOARD_FILE);
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Length': content.length,
        'Cache-Control': 'no-cache'
      });
      res.end(content);
      return;
    }
  }

  // Check possible directories
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

  // Fallback: serve dashboard if html requested
  if (fs.existsSync(DASHBOARD_FILE)) {
    const content = fs.readFileSync(DASHBOARD_FILE);
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
  console.log(`🚀 DASHBOARD FORÇA DA TERRA RODANDO COM SUCESSO!`);
  console.log(`👉 http://localhost:${PORT}`);
  console.log(`👉 http://localhost:${PORT}/forca-da-terra-competitivo`);
  console.log(`======================================================\n`);

  // Open in browser
  exec(`start http://localhost:${PORT}`);
});
