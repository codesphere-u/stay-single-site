import { BRAND, videoIdOf } from '../src/data/brand.mjs';

export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}

const e = escapeHtml;
const EMBED_SCRIPT = 'https://www.tiktok.com/embed.js';
const liveSocials = brand => brand.socials.filter(({ url }) => url);
const newsletterOpen = brand => Boolean(brand.newsletter.action);

// The rotating stamp: "SINGLE BY CHOICE · EST. 2026 ·" around the brand's full stop.
function stamp(brand, className = '') {
  const text = `Single by choice · Est. ${brand.established} · `.repeat(2);
  return `<div class="stamp ${className}" aria-hidden="true">
    <svg viewBox="0 0 200 200" focusable="false"><defs><path id="ring-${className || 'main'}" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0"/></defs>
      <text textLength="486" lengthAdjust="spacing"><textPath href="#ring-${className || 'main'}">${e(text.toUpperCase())}</textPath></text></svg>
    <span class="stamp-dot"></span>
  </div>`;
}

function header(page) {
  const home = page === 'home' ? '' : './index.html';
  const links = [
    ['manifesto', 'Manifesto', `${home}#manifesto`],
    ['watch', 'Watch', `${home}#watch`],
    ['join', 'Join', `${home}#join`],
    ['links', 'Links', './links.html']
  ];
  return `<header class="ss-header is-hidden" data-header>
    <div class="wrap header-inner">
      <button class="nav-toggle" type="button" aria-controls="ss-nav" aria-expanded="false" hidden>Menu <span aria-hidden="true"></span></button>
      <button class="nav-orb" type="button" aria-controls="ss-nav" aria-expanded="false" aria-label="Open navigation" inert>
        <span class="nav-orb-core" aria-hidden="true">
          <svg class="nav-orb-ring" viewBox="0 0 62 62" focusable="false"><circle cx="31" cy="31" r="29.5" pathLength="1"/><circle class="nav-orb-progress" cx="31" cy="31" r="29.5" pathLength="1"/></svg>
          <span class="nav-orb-lines"><i></i><i></i></span>
        </span>
      </button>
      <nav id="ss-nav" class="dock" aria-label="Main navigation">
        <ul class="nav-pages">
          ${links.map(([key, label, href]) => `<li><a href="${href}" data-section="${key}"${page === key ? ' aria-current="page"' : ''}>${label}</a></li>`).join('\n          ')}
          <li class="nav-follow"><a href="${e(BRAND.tiktokUrl)}">Follow <span aria-hidden="true">↗</span></a></li>
        </ul>
      </nav>
    </div>
  </header>`;
}

function footer(page, brand) {
  const home = page === 'home' ? '' : './index.html';
  return `<footer class="ss-footer">
    <div class="wrap">
      <div class="footer-top">
        <p class="footer-line">${e(brand.line)}</p>
        <nav class="footer-nav" aria-label="Footer">
          <ul>
            <li><a href="${home}#manifesto">Manifesto</a></li>
            <li><a href="${home}#watch">Watch</a></li>
            <li><a href="${home}#join">Join</a></li>
            <li><a href="./links.html">Links</a></li>
            ${liveSocials(brand).map(({ label, url }) => `<li><a href="${e(url)}">${e(label)} ↗</a></li>`).join('')}
          </ul>
        </nav>
      </div>
      <p class="footer-wordmark" aria-hidden="true">Stay Single<span>.</span></p>
      <div class="footer-legal">
        <span>© ${brand.established} ${e(brand.name)} · @${e(brand.handle)}</span>
        <span>Not affiliated with TikTok.</span>
        <a href="#main">Back to top <span aria-hidden="true">↑</span></a>
      </div>
    </div>
  </footer>`;
}

export function frame({ page, title, description, body, brand = BRAND }) {
  const fullTitle = title ? `${title} | ${brand.name}` : `${brand.name} — ${brand.line}`;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${e(fullTitle)}</title>
  <meta name="description" content="${e(description)}">
  <meta name="theme-color" content="#0E0E10">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${e(fullTitle)}">
  <meta property="og:description" content="${e(description)}">
  <meta name="twitter:card" content="summary">
  <link rel="icon" href="./src/ui/favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700;800&display=swap">
  <link rel="stylesheet" href="./src/ui/brand.css">
  <link rel="stylesheet" href="./src/ui/nav.css">
  <noscript><style>.ss-header.is-hidden .dock { opacity: 1; translate: none; pointer-events: auto; }</style></noscript>
</head>
<body class="ss ss-${page}">
  <a class="skip-link" href="#main">Skip to content</a>
  ${header(page)}
  <main id="main" tabindex="-1">
${body}
  </main>
  ${footer(page, brand)}
  <script type="module" src="./src/ui/site.mjs"></script>
</body>
</html>
`;
}

function embedTemplate(brand) {
  const creator = `<blockquote class="tiktok-embed" cite="${e(brand.tiktokUrl)}" data-unique-id="${e(brand.handle)}" data-embed-type="creator" style="max-width: 780px; min-width: 288px;"><section><a target="_blank" href="${e(brand.tiktokUrl)}?refer=creator_embed">@${e(brand.handle)}</a></section></blockquote>`;
  const videos = brand.featuredVideos.map(url => [url, videoIdOf(url)]).filter(([, id]) => id);
  const featured = videos.length ? `<div class="featured"><p class="eyebrow">Featured</p><div class="featured-grid">${videos.map(([url, id]) =>
    `<blockquote class="tiktok-embed" cite="${e(url)}" data-video-id="${e(id)}" style="max-width: 605px; min-width: 325px;"><section><a target="_blank" href="${e(url)}">Watch on TikTok</a></section></blockquote>`).join('')}</div></div>` : '';
  return creator + featured;
}

function joinBlock(brand, { compact = false } = {}) {
  const { newsletter } = brand;
  if (!newsletterOpen(brand)) {
    return `<div class="join-soon" role="note">
        <p><strong>The list opens soon.</strong> Follow on TikTok so you catch the launch.</p>
        <a class="btn ${compact ? 'btn-primary' : 'btn-dark'}" href="${e(brand.tiktokUrl)}">Follow @${e(brand.handle)} <span class="arrow" aria-hidden="true">↗</span></a>
      </div>`;
  }
  return `<form class="join-form" action="${e(newsletter.action)}" method="${e(newsletter.method)}" data-join>
        <label for="join-email-${compact ? 'links' : 'home'}">Email address</label>
        <div class="join-row">
          <input id="join-email-${compact ? 'links' : 'home'}" type="email" name="${e(newsletter.emailField)}" autocomplete="email" required placeholder="you@example.com">
          <button class="btn ${compact ? 'btn-primary' : 'btn-dark'}" type="submit">${e(newsletter.button)}</button>
        </div>
        <p class="join-consent">${e(newsletter.consent)}</p>
      </form>`;
}

export function renderHome(brand = BRAND) {
  const marqueeRun = brand.themes.map(theme => `<span class="marquee-item">${e(theme)}</span><span class="marquee-dot"></span>`).join('');
  return frame({
    page: 'home', brand,
    description: `${brand.name} (@${brand.handle}) — ${brand.line} ${brand.intro}`,
    body: `    <section class="hero" aria-labelledby="hero-title">
      <div class="wrap hero-inner">
        <p class="eyebrow eyebrow-live"><span class="live-dot" aria-hidden="true"></span>@${e(brand.handle)} · on TikTok</p>
        <h1 id="hero-title" class="hero-title" data-sort data-sort-hero><span>Stay</span> <span>Single.</span></h1>
        <div class="hero-foot">
          <div class="hero-copy">
            <p class="hero-line">${e(brand.line)}</p>
            <p class="hero-intro">${e(brand.intro)}</p>
          </div>
          <div class="actions">
            <a class="btn btn-primary" href="${e(brand.tiktokUrl)}" data-magnetic>Follow on TikTok <span class="arrow" aria-hidden="true">↗</span></a>
            <a class="btn btn-ghost" href="#join" data-magnetic>Join the list <span class="arrow" aria-hidden="true">↓</span></a>
          </div>
        </div>
      </div>
      ${stamp(brand)}
    </section>
    <div class="marquee" aria-hidden="true"><div class="marquee-track" data-marquee>${marqueeRun}${marqueeRun}</div></div>

    <section class="manifesto" id="manifesto" aria-labelledby="manifesto-title" data-manifesto>
      <div class="manifesto-pin">
        <div class="wrap">
          <h2 id="manifesto-title" class="eyebrow">The manifesto</h2>
          <p class="manifesto-text" data-scrub data-keys="${e(brand.manifestoKeys.join(' '))}">${e(brand.manifesto)}</p>
        </div>
      </div>
    </section>

    <section class="pillars" aria-labelledby="pillars-title">
      <div class="wrap">
        <div class="section-head" data-reveal>
          <div><p class="eyebrow">What we talk about</p><h2 id="pillars-title" class="section-title" data-sort>Three things.</h2></div>
          <p class="section-note">A mix of building yourself, laughing at single life, and dating with standards.</p>
        </div>
        <ol class="pillar-list">
          ${brand.pillars.map((pillar, index) => `<li class="pillar pillar-${index + 1}" data-reveal>
            <span class="pillar-num" aria-hidden="true">0${index + 1}</span>
            <p class="kicker">${e(pillar.kicker)}</p>
            <h3>${e(pillar.title)}</h3>
            <p>${e(pillar.copy)}</p>
          </li>`).join('\n          ')}
        </ol>
      </div>
    </section>

    <section class="watch" id="watch" aria-labelledby="watch-title">
      <div class="wrap watch-inner">
        <div class="watch-copy" data-reveal>
          <p class="eyebrow">Watch</p>
          <h2 id="watch-title">Straight from <span>the feed.</span></h2>
          <p>Clips on building yourself, laughing at single life, and dating with standards — straight from @${e(brand.handle)}.</p>
          <a class="btn btn-primary" href="${e(brand.tiktokUrl)}">Open on TikTok <span class="arrow" aria-hidden="true">↗</span></a>
        </div>
        <div class="watch-stage" data-embed data-embed-src="${EMBED_SCRIPT}" tabindex="-1" aria-label="TikTok videos">
          <div class="embed-facade">
            <div class="phone" aria-hidden="true">
              <div class="phone-screen">
                <span class="phone-handle">@${e(brand.handle)}</span>
                <span class="phone-mark">Stay<br>Single<b>.</b></span>
                <span class="phone-play"></span>
                <span class="phone-tags">${brand.pillars.map(({ title }) => `<i>${e(title)}</i>`).join('')}</span>
              </div>
            </div>
            <button class="btn btn-primary" type="button" data-load-embed>Load videos from TikTok</button>
            <p class="embed-note">Loads TikTok’s official player, which sets TikTok cookies. Prefer not to? <a href="${e(brand.tiktokUrl)}">Open on TikTok</a>.</p>
          </div>
          <template data-embed-template>${embedTemplate(brand)}</template>
        </div>
      </div>
    </section>

    <section class="join" id="join" aria-labelledby="join-title">
      <div class="wrap join-inner">
        <p class="eyebrow">The list</p>
        <h2 id="join-title" data-sort>${e(brand.newsletter.title)}</h2>
        <p class="join-promise">${e(brand.newsletter.promise)}</p>
        ${joinBlock(brand)}
      </div>
      <span class="join-dot" aria-hidden="true"></span>
    </section>`
  });
}

export function renderLinks(brand = BRAND) {
  const others = liveSocials(brand).filter(({ label }) => label !== 'TikTok');
  const item = ({ href, title, note, primary = false }) => `<li><a class="link-btn${primary ? ' is-primary' : ''}" href="${e(href)}">
            <span><strong>${e(title)}</strong><small>${e(note)}</small></span>
            <span class="arrow" aria-hidden="true">↗</span>
          </a></li>`;
  const list = [
    item({ href: brand.tiktokUrl, title: 'Follow on TikTok', note: `@${brand.handle} · watch the latest clips`, primary: true }),
    item({ href: './index.html#join', title: newsletterOpen(brand) ? brand.newsletter.button : 'Join the list', note: newsletterOpen(brand) ? 'The weekly single-man playbook' : 'Opening soon — get notified on TikTok' }),
    ...others.slice(0, 5).map(({ label, url, note }) => item({ href: url, title: label, note })),
    item({ href: './index.html', title: 'Visit the site', note: 'The manifesto, the videos and the list' })
  ];
  return frame({
    page: 'links', brand, title: 'Links',
    description: `Every ${brand.name} link in one place: TikTok, the list, and more.`,
    body: `    <section class="links-page" aria-labelledby="links-title">
      <div class="links-card">
        ${stamp(brand, 'stamp-links')}
        <h1 id="links-title" class="links-title" data-sort data-sort-hero><span>Stay</span> <span>Single.</span></h1>
        <p class="links-handle">@${e(brand.handle)}</p>
        <p class="links-line">${e(brand.line)}</p>
        <ul class="links-list">
          ${list.join('\n          ')}
        </ul>
      </div>
    </section>`
  });
}

export function renderNotFound(brand = BRAND) {
  return frame({
    page: 'lost', brand, title: 'Page not found',
    description: 'This page does not exist. Head back to Stay Single.',
    body: `    <section class="lost" aria-labelledby="lost-title">
      <div class="wrap lost-inner">
        <p class="eyebrow">Error 404</p>
        <h1 id="lost-title" class="lost-title" data-sort data-sort-hero>Lost.</h1>
        <p class="hero-line">Single, not stranded.</p>
        <p class="hero-intro">This page doesn’t exist. Head back home, or catch the latest clips on TikTok.</p>
        <div class="actions">
          <a class="btn btn-primary" href="./index.html">Back home <span class="arrow" aria-hidden="true">←</span></a>
          <a class="btn btn-ghost" href="${e(brand.tiktokUrl)}">Open TikTok <span class="arrow" aria-hidden="true">↗</span></a>
        </div>
      </div>
    </section>`
  });
}

export function sitePages(brand = BRAND) {
  return [
    ['index.html', renderHome(brand)],
    ['links.html', renderLinks(brand)]
  ];
}
