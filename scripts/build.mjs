import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { sitePages, renderNotFound } from './site.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const DIST = path.join(ROOT, 'dist');

export function build() {
  fs.rmSync(DIST, { recursive: true, force: true });
  fs.mkdirSync(DIST, { recursive: true });
  for (const [name, html] of [...sitePages(), ['404.html', renderNotFound()]]) {
    fs.writeFileSync(path.join(DIST, name), html, 'utf8');
  }
  fs.cpSync(path.join(ROOT, 'src', 'ui'), path.join(DIST, 'src', 'ui'), { recursive: true });
  return fs.readdirSync(DIST);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  console.log(`[build] wrote ${build().join(', ')} to dist/`);
}
