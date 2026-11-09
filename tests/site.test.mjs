import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { BRAND, videoIdOf } from '../src/data/brand.mjs';
import { renderHome, renderLinks, renderNotFound, renderManifest, sitePages } from '../scripts/site.mjs';
import { siteIcons } from '../scripts/icons.mjs';
import { build, DIST } from '../scripts/build.mjs';
import { createServer } from '../server.mjs';

const pages = [['home', renderHome()], ['links', renderLinks()], ['404', renderNotFound()]];
const withBrand = changes => ({ ...BRAND, ...changes, newsletter: { ...BRAND.newsletter, ...(changes.newsletter || {}) } });

describe('pages', () => {
  it('share the shell: header, one h1, main, footer, brand styles and script', () => {
    for (const [name, html] of pages) {
      assert.match(html, /<header class="ss-header" data-header>/, name);
      assert.match(html, /aria-label="Main navigation"/, name);
      assert.equal(html.match(/<h1[\s>]/g)?.length, 1, `${name} has exactly one h1`);
      assert.match(html, /<main id="main" tabindex="-1">/, name);
      assert.match(html, /<footer class="ss-footer">/, name);
      assert.match(html, /src\/ui\/brand\.css/, name);
      assert.match(html, /<script type="module" src="\.\/src\/ui\/site\.mjs"><\/script>/, name);
      assert.doesNotMatch(html, /is-hidden/, name);
      assert.doesNotMatch(html, /undefined|\[object Object\]/, name);
    }
  });

  it('points at the right TikTok account', () => {
    assert.equal(BRAND.tiktokUrl, 'https://www.tiktok.com/@stay_single_men');
    for (const [name, html] of pages) assert.ok(html.includes('href="https://www.tiktok.com/@stay_single_men"'), name);
  });

  it('loads nothing from TikTok until the visitor asks', () => {
    const home = renderHome();
    assert.doesNotMatch(home, /<script[^>]+tiktok\.com/);
    assert.match(home, /data-load-embed/);
    assert.match(home, /<template data-embed-template><blockquote class="tiktok-embed" cite="https:\/\/www\.tiktok\.com\/@stay_single_men" data-unique-id="stay_single_men" data-embed-type="creator"/);
    assert.match(home, /data-embed-src="https:\/\/www\.tiktok\.com\/embed\.js"/);
  });

  it('features videos only when they are configured', () => {
    assert.doesNotMatch(renderHome(), /class="featured"/);
    const url = 'https://www.tiktok.com/@stay_single_men/video/7300000000000000001';
    assert.equal(videoIdOf(url), '7300000000000000001');
    assert.equal(videoIdOf('https://www.tiktok.com/@stay_single_men'), null);
    const html = renderHome(withBrand({ featuredVideos: [url, 'not a video url'] }));
    assert.match(html, /data-video-id="7300000000000000001"/);
    assert.equal(html.match(/data-video-id=/g).length, 1);
  });

  it('shows the newsletter fallback until a provider is set, then a real form', () => {
    const soon = renderHome();
    assert.match(soon, /The list opens soon/);
    assert.doesNotMatch(soon, /<form class="join-form"/);
    const live = renderHome(withBrand({ newsletter: { action: 'https://example.com/subscribe', emailField: 'email_address' } }));
    assert.match(live, /<form class="join-form" action="https:\/\/example\.com\/subscribe" method="post" data-join>/);
    assert.match(live, /type="email" name="email_address" autocomplete="email" required/);
    assert.doesNotMatch(live, /The list opens soon/);
  });

  it('builds the link hub with TikTok first and only the socials that are filled in', () => {
    const html = renderLinks();
    const first = html.indexOf('class="link-btn is-primary"');
    assert.ok(first > 0 && first < html.indexOf('class="link-btn"'));
    for (const label of ['Instagram', 'YouTube', 'Threads']) assert.doesNotMatch(html, new RegExp(`<strong>${label}</strong>`));
    const filled = renderLinks(withBrand({ socials: [...BRAND.socials.slice(0, 1), { label: 'Instagram', url: 'https://instagram.com/example', note: 'Behind the clips' }] }));
    assert.match(filled, /<strong>Instagram<\/strong>/);
  });

  it('escapes brand copy', () => {
    const html = renderHome(withBrand({ line: '<script>alert(1)</script>' }));
    assert.doesNotMatch(html, /<script>alert/);
    assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  });

  it('has well-formed feature content', () => {
    assert.ok(BRAND.quotes.length >= 24, 'at least 24 truths');
    assert.equal(new Set(BRAND.quotes).size, BRAND.quotes.length, 'truths are unique');
    assert.ok(BRAND.flags.length >= 6);
    for (const flag of BRAND.flags) {
      assert.ok(['red', 'green'].includes(flag.verdict), flag.scenario);
      assert.ok(flag.take.length > 10, flag.scenario);
    }
    assert.ok(BRAND.flags.some(f => f.verdict === 'red') && BRAND.flags.some(f => f.verdict === 'green'));
    for (const item of BRAND.quiz) {
      assert.equal(item.answers.length, 4, item.question);
      for (const [, type] of item.answers) assert.ok(BRAND.archetypes[type], `${item.question} → ${type}`);
    }
    for (const type of Object.keys(BRAND.archetypes)) assert.ok(BRAND.quiz.some(item => item.answers.some(([, t]) => t === type)), `${type} is reachable`);
    assert.equal(BRAND.habits.length, 6);
  });

  it('has a 30-day Season and an ex test where every answer leads somewhere', () => {
    assert.equal(BRAND.season.flatMap(stage => stage.days).length, 30);
    const { start, questions, verdicts } = BRAND.exTest;
    assert.ok(questions[start]);
    assert.deepEqual(Object.keys(questions).filter(key => key in verdicts), [], 'question and verdict names never collide');
    const reached = new Set();
    const walk = id => {
      if (verdicts[id]) return reached.add(id);
      assert.ok(questions[id], `unknown step ${id}`);
      walk(questions[id].yes);
      walk(questions[id].no);
    };
    walk(start);
    assert.deepEqual([...reached].sort(), Object.keys(verdicts).sort(), 'every verdict is reachable');
    const home = renderHome();
    assert.equal(home.match(/<li data-day="\d+">/g).length, 30);
    assert.match(home, /<section class="season" id="season"/);
    assert.match(home, /data-ex-stage/);
    for (const hook of ['data-heatmap', 'data-reminder', 'data-install', 'data-deck-image', 'data-image-quiz', 'data-image-flags', 'data-image-daily']) assert.ok(home.includes(hook), hook);
  });

  it('is installable: manifest, icons and app metadata', () => {
    const manifest = JSON.parse(renderManifest());
    assert.equal(manifest.name, 'Stay Single');
    assert.equal(manifest.display, 'standalone');
    assert.ok(manifest.icons.some(icon => icon.sizes === '512x512' && icon.purpose === 'maskable'));
    assert.ok(manifest.shortcuts.some(shortcut => shortcut.url.endsWith('#daily')));
    for (const [, html] of pages) {
      assert.match(html, /<link rel="manifest" href="\.\/manifest\.webmanifest">/);
      assert.match(html, /<link rel="apple-touch-icon" href="\.\/icons\/apple-touch-icon\.png">/);
    }
    for (const [name, png] of siteIcons()) {
      assert.equal(png.subarray(1, 4).toString('ascii'), 'PNG', name);
      const size = Number(name.match(/(\d+)\.png$/)?.[1] || 180);
      assert.equal(png.readUInt32BE(16), size, `${name} width`);
    }
  });

  it('renders the features as usable content before any script runs', () => {
    const home = renderHome();
    assert.equal(home.match(/<li class="truth truth-\d" data-index=/g).length, BRAND.quotes.length);
    assert.match(home, /<q data-today>/);
    assert.equal(home.match(/<li class="flag-card" data-verdict="(red|green)">/g).length, BRAND.flags.length);
    assert.equal(home.match(/<details class="flag-answer"><summary>Our take<\/summary>/g).length, BRAND.flags.length);
    assert.equal(home.match(/<fieldset class="quiz-step"/g).length, BRAND.quiz.length);
    assert.equal(home.match(/<input type="checkbox" data-habit=/g).length, BRAND.habits.length);
    for (const id of ['truths', 'play', 'daily', 'watch', 'join']) assert.match(home, new RegExp(`<section class="[^"]+" id="${id}"`), id);
    assert.match(home, /<script type="module" src="\.\/src\/ui\/features\.mjs"><\/script>/);
    assert.doesNotMatch(renderLinks(), /features\.mjs/);
    const json = JSON.parse(home.match(/<script type="application\/json" id="ss-data">([\s\S]*?)<\/script>/)[1]);
    assert.deepEqual(json.quotes, BRAND.quotes);
  });

  it('keeps copy positive', () => {
    const copy = JSON.stringify(BRAND).toLowerCase();
    for (const word of ['women are', 'females', 'gold digger', 'hate']) assert.ok(!copy.includes(word), word);
  });
});

describe('build and server', () => {
  let server;
  let base;
  before(async () => {
    build();
    server = createServer();
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    base = `http://127.0.0.1:${server.address().port}`;
  });
  after(() => new Promise(resolve => server.close(resolve)));

  it('writes every page and the assets to dist/', () => {
    for (const name of ['index.html', 'links.html', '404.html', 'manifest.webmanifest', 'sw.js', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/maskable-512.png', 'icons/apple-touch-icon.png', 'src/ui/brand.css', 'src/ui/nav.css', 'src/ui/features.css', 'src/ui/site.mjs', 'src/ui/features.mjs', 'src/ui/storycard.mjs', 'src/ui/motion.mjs', 'src/ui/favicon.svg']) {
      assert.ok(fs.existsSync(path.join(DIST, name)), name);
    }
  });

  it('serves the same pages as the static build, with security headers', async () => {
    for (const [name] of sitePages()) {
      const response = await fetch(`${base}/${name}`);
      assert.equal(response.status, 200, name);
      assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
      assert.equal(await response.text(), fs.readFileSync(path.join(DIST, name), 'utf8'), name);
    }
    assert.equal((await fetch(`${base}/`)).status, 200);
  });

  it('serves the app files, and the service worker only pre-caches files that exist', async () => {
    for (const [asset, type] of [['/manifest.webmanifest', 'application/manifest+json; charset=utf-8'], ['/sw.js', 'text/javascript; charset=utf-8'], ['/icons/icon-512.png', 'image/png']]) {
      const response = await fetch(base + asset);
      assert.equal(response.status, 200, asset);
      assert.equal(response.headers.get('content-type'), type);
    }
    const worker = await (await fetch(base + '/sw.js')).text();
    for (const file of [...worker.matchAll(/'\.\/([^']*)'/g)].map(match => match[1])) {
      const response = await fetch(`${base}/${file}`);
      assert.equal(response.status, 200, `pre-cached ${file || '/'}`);
    }
  });

  it('serves assets with the right types and nothing outside src/ui', async () => {
    for (const [asset, type] of [['/src/ui/brand.css', 'text/css; charset=utf-8'], ['/src/ui/site.mjs', 'text/javascript; charset=utf-8'], ['/src/ui/favicon.svg', 'image/svg+xml']]) {
      const response = await fetch(base + asset);
      assert.equal(response.status, 200, asset);
      assert.equal(response.headers.get('content-type'), type);
    }
    for (const blocked of ['/server.mjs', '/package.json', '/src/data/brand.mjs', '/src/ui/../../server.mjs', '/nope']) {
      const response = await fetch(base + blocked);
      assert.equal(response.status, 404, blocked);
      assert.match(await response.text(), /Lost\./);
    }
  });
});
