import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { sitePages, renderNotFound, renderManifest } from './scripts/site.mjs';
import { siteIcons } from './scripts/icons.mjs';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const UI_DIR = path.join(ROOT, 'src', 'ui');
const TYPES = { '.css': 'text/css; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml' };

const pages = new Map(sitePages().map(([name, html]) => ['/' + name, html]));
pages.set('/', pages.get('/index.html'));
pages.set('/links', pages.get('/links.html'));
// The built site ships 404.html as a real file (the service worker pre-caches it), so serve it the same way.
pages.set('/404.html', renderNotFound());

const extras = new Map([
  ['/manifest.webmanifest', ['application/manifest+json; charset=utf-8', renderManifest()]],
  ['/sw.js', ['text/javascript; charset=utf-8', () => fs.readFileSync(path.join(ROOT, 'src', 'sw.js'))]],
  ...[...siteIcons()].map(([name, png]) => ['/' + name, ['image/png', png]])
]);

// Only files that exist in src/ui with a known type are served; nothing else on disk is reachable.
const assets = new Map(fs.readdirSync(UI_DIR)
  .filter(name => TYPES[path.extname(name)])
  .map(name => ['/src/ui/' + name, TYPES[path.extname(name)]]));

export function handleRequest(req, res) {
  const { pathname } = new URL(req.url || '/', 'http://localhost');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  const page = pages.get(pathname);
  if (page) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(page);
    return;
  }
  const extra = extras.get(pathname);
  if (extra) {
    const [type, body] = extra;
    res.writeHead(200, { 'Content-Type': type, ...(pathname === '/sw.js' ? { 'Service-Worker-Allowed': '/', 'Cache-Control': 'no-cache' } : {}) });
    res.end(typeof body === 'function' ? body() : body);
    return;
  }
  const type = assets.get(pathname);
  if (type) {
    res.writeHead(200, { 'Content-Type': type });
    res.end(fs.readFileSync(path.join(ROOT, pathname.slice(1))));
    return;
  }
  res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(renderNotFound());
}

export const createServer = () => http.createServer(handleRequest);

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const port = Number(process.env.PORT || 4180);
  const host = process.env.HOST || '127.0.0.1';
  createServer().listen(port, host, () => console.log(`Stay Single running at http://${host}:${port}`));
}
