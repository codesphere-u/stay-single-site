import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { BRAND, videoIdOf } from '../src/data/brand.mjs';
import { renderHome, renderLinks, renderNotFound, sitePages } from '../scripts/site.mjs';
import { build, DIST } from '../scripts/build.mjs';
import { createServer } from '../server.mjs';

const pages = [['home', renderHome()], ['links', renderLinks()], ['404', renderNotFound()]];
const withBrand = changes => ({ ...BRAND, ...changes, newsletter: { ...BRAND.newsletter, ...(changes.newsletter || {}) } });

describe('pages', () => {
  it('share the shell: header, one h1, main, footer, brand styles and script', () => {
    for (const [name, html] of pages) {
      assert.match(html, /<header class="ss-header is-hidden" data-header>/, name);
      assert.match(html, /aria-label="Main navigation"/, name);
      assert.equal(html.match(/<h1[\s>]/g)?.length, 1, `${name} has exactly one h1`);
      assert.match(html, /<main id="main" tabindex="-1">/, name);
      assert.match(html, /<footer class="ss-footer">/, name);
      assert.match(html, /src\/ui\/brand\.css/, name);
      assert.match(html, /<script type="module" src="\.\/src\/ui\/site\.mjs"><\/script>/, name);
      assert.match(html, /<noscript><style>\.ss-header\.is-hidden \.dock/, name);
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
    for (const name of ['index.html', 'links.html', '404.html', 'src/ui/brand.css', 'src/ui/nav.css', 'src/ui/site.mjs', 'src/ui/motion.mjs', 'src/ui/favicon.svg']) {
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
