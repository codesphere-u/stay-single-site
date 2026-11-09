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
    ['truths', 'Truths', `${home}#truths`],
    ['play', 'Play', `${home}#play`],
    ['daily', 'Daily', `${home}#daily`],
    ['season', 'Season', `${home}#season`],
    ['watch', 'Watch', `${home}#watch`],
    ['join', 'Join', `${home}#join`]
  ];
  return `<header class="ss-header" data-header>
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
            <li><a href="${home}#truths">Truths</a></li>
            <li><a href="${home}#play">Play</a></li>
            <li><a href="${home}#daily">Daily</a></li>
            <li><a href="${home}#season">Season</a></li>
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
  <link rel="manifest" href="./manifest.webmanifest">
  <link rel="apple-touch-icon" href="./icons/apple-touch-icon.png">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="${e(brand.name)}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700;800&display=swap">
  <link rel="stylesheet" href="./src/ui/brand.css">
  <link rel="stylesheet" href="./src/ui/nav.css">${page === 'home' ? '\n  <link rel="stylesheet" href="./src/ui/features.css">' : ''}
</head>
<body class="ss ss-${page}">
  <a class="skip-link" href="#main">Skip to content</a>
  ${header(page)}
  <main id="main" tabindex="-1">
${body}
  </main>
  ${footer(page, brand)}
  <script type="module" src="./src/ui/site.mjs"></script>${page === 'home' ? '\n  <script type="module" src="./src/ui/features.mjs"></script>' : ''}
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

const pad = number => String(number).padStart(2, '0');

// The data the interactive features read in the browser.
function featureData(brand) {
  const { handle, tiktokUrl, quotes, flags, quiz, archetypes, habits, season, exTest } = brand;
  return JSON.stringify({ handle, tiktokUrl, quotes, flags, quiz, archetypes, habits, season, exTest }).replace(/</g, '\\u003c');
}

function truthsSection(brand) {
  const total = brand.quotes.length;
  return `    <section class="truths" id="truths" aria-labelledby="truths-title">
      <div class="wrap truths-inner">
        <div class="truths-copy" data-reveal>
          <p class="eyebrow">Single Truths</p>
          <h2 id="truths-title" class="section-title" data-sort>Swipe right on yourself.</h2>
          <p class="section-note">${total} truths for men who are single on purpose. Swipe right to save one, left for the next — or use the buttons and your arrow keys.</p>
          <p class="deck-meta" data-deck-meta hidden><span data-deck-count>01 / ${pad(total)}</span><button type="button" class="saved-open" data-saved-open>Saved <span data-saved-count>0</span></button></p>
        </div>
        <div class="deck-wrap">
          <ol class="deck" data-deck aria-label="Single Truths">
            ${brand.quotes.map((quote, index) => `<li class="truth truth-${index % 3}" data-index="${index}">
              <p class="truth-mark">Stay Single<b>.</b></p>
              <blockquote>${e(quote)}</blockquote>
              <p class="truth-num">No. ${pad(index + 1)}</p>
            </li>`).join('\n            ')}
          </ol>
          <div class="deck-controls" data-deck-controls hidden>
            <button type="button" class="deck-btn deck-skip" data-deck-skip aria-label="Next truth"><span aria-hidden="true">✕</span></button>
            <button type="button" class="deck-btn deck-share" data-deck-share>Share</button>
            <button type="button" class="deck-btn deck-share" data-deck-image>Save image</button>
            <button type="button" class="deck-btn deck-save" data-deck-save aria-label="Save this truth" aria-pressed="false"><span aria-hidden="true">♥</span></button>
          </div>
          <p class="deck-status" role="status" aria-live="polite" data-deck-status></p>
        </div>
      </div>
      <dialog class="saved" data-saved aria-labelledby="saved-title">
        <div class="saved-head"><h3 id="saved-title">Your saved truths</h3><button type="button" class="saved-close" data-saved-close aria-label="Close">✕</button></div>
        <ol class="saved-list" data-saved-list></ol>
        <p class="saved-empty" data-saved-empty>Nothing saved yet. Swipe right on a truth to keep it here.</p>
      </dialog>
    </section>`;
}

function playSection(brand) {
  const label = verdict => (verdict === 'red' ? 'Red flag' : 'Green flag');
  return `    <section class="play" id="play" aria-labelledby="play-title">
      <div class="wrap">
        <div class="section-head" data-reveal>
          <div><p class="eyebrow">Play</p><h2 id="play-title" class="section-title" data-sort>Test yourself.</h2></div>
          <p class="section-note">Two quick ones. Call the flags, then find out what kind of single you are.</p>
        </div>
        <div class="play-grid">
          <article class="game flags-game" data-flags aria-labelledby="flags-title">
            <div class="game-head"><p class="kicker">Game 01</p><h3 id="flags-title">Red flag or green flag?</h3><p class="game-progress" data-flags-progress>${brand.flags.length} scenarios</p></div>
            <ol class="flag-list">
              ${brand.flags.map(flag => `<li class="flag-card" data-verdict="${flag.verdict}">
                <p class="flag-scenario">${e(flag.scenario)}</p>
                <div class="flag-actions" data-flag-actions hidden><button type="button" class="flag-btn flag-red" data-call="red">Red flag</button><button type="button" class="flag-btn flag-green" data-call="green">Green flag</button></div>
                <details class="flag-answer"><summary>Our take</summary><p><strong>${label(flag.verdict)}.</strong> ${e(flag.take)}</p></details>
              </li>`).join('\n              ')}
            </ol>
            <div class="game-result" data-flags-result hidden>
              <p class="result-score"><span data-flags-score>0</span><small>/ ${brand.flags.length}</small></p>
              <p class="result-line" data-flags-verdict></p>
              <div class="actions"><button type="button" class="btn btn-dark" data-flags-again>Play again</button><button type="button" class="btn btn-outline" data-share-flags>Share my score</button><button type="button" class="btn btn-outline" data-image-flags>Save image</button></div>
            </div>
          </article>
          <article class="game quiz-game" data-quiz aria-labelledby="quiz-title">
            <div class="game-head"><p class="kicker">Game 02</p><h3 id="quiz-title">What kind of single are you?</h3><p class="game-progress" data-quiz-progress>${brand.quiz.length} questions</p></div>
            <form class="quiz-form" data-quiz-form>
              ${brand.quiz.map((item, index) => `<fieldset class="quiz-step" data-step="${index}">
                <legend>${e(item.question)}</legend>
                ${item.answers.map(([answer, type]) => `<label class="quiz-option"><input type="radio" name="q${index}" value="${type}" required><span>${e(answer)}</span></label>`).join('\n                ')}
              </fieldset>`).join('\n              ')}
              <button type="submit" class="btn btn-dark quiz-submit">See my result</button>
              <noscript><p class="game-note">Turn on JavaScript to see your result.</p></noscript>
            </form>
            <div class="game-result quiz-result" data-quiz-result hidden>
              <p class="kicker">You’re</p>
              <p class="quiz-type" data-quiz-type></p>
              <p data-quiz-copy></p>
              <p class="quiz-move"><strong>Your move:</strong> <span data-quiz-move></span></p>
              <div class="actions"><button type="button" class="btn btn-dark" data-share-quiz>Share my result</button><button type="button" class="btn btn-outline" data-image-quiz>Save image</button><button type="button" class="btn btn-outline" data-quiz-again>Retake</button></div>
            </div>
          </article>
          ${exSection(brand)}
        </div>
      </div>
    </section>`;
}

// "Should I text my ex?" Without JavaScript it reads as a plain list of questions and verdicts.
function exSection(brand) {
  const { questions, verdicts } = brand.exTest;
  return `<article class="game ex-game" data-ex aria-labelledby="ex-title">
            <div class="game-head"><p class="kicker">Game 03</p><h3 id="ex-title">Should I text my ex?</h3><p class="game-progress" data-ex-progress>A few honest questions</p></div>
            <div class="ex-stage" data-ex-stage>
              <ol class="ex-fallback">${Object.values(questions).map(question => `<li>${e(question.text)}</li>`).join('')}</ol>
              <ul class="ex-fallback ex-verdicts">${Object.values(verdicts).map(verdict => `<li><strong>${e(verdict.title)}</strong> ${e(verdict.copy)}</li>`).join('')}</ul>
            </div>
          </article>`;
}

function dailySection(brand) {
  return `    <section class="daily" id="daily" aria-labelledby="daily-title">
      <div class="wrap daily-inner">
        <div class="daily-copy" data-reveal>
          <p class="eyebrow">The Daily Build</p>
          <h2 id="daily-title" class="section-title" data-sort>Win the day.</h2>
          <p class="section-note">Six small wins. Tick them off as you go. Your progress stays on this device and resets at midnight — four or more keeps your streak alive.</p>
        </div>
        <div class="daily-card" data-daily>
          <div class="daily-top">
            <div class="daily-ring" aria-hidden="true">
              <svg viewBox="0 0 120 120" focusable="false"><circle class="ring-track" cx="60" cy="60" r="52" pathLength="1"/><circle class="ring-fill" cx="60" cy="60" r="52" pathLength="1"/></svg>
              <p class="ring-label"><strong data-daily-done>0</strong><span>/ ${brand.habits.length}</span></p>
            </div>
            <div class="daily-stats">
              <p><span class="daily-stat" data-daily-streak>0</span><span class="daily-stat-label">day streak</span></p>
              <p class="daily-date" data-daily-date>Today</p>
            </div>
          </div>
          <fieldset class="daily-list">
            <legend class="sort-readable">Today’s build</legend>
            ${brand.habits.map((habit, index) => `<label class="habit"><input type="checkbox" data-habit="${index}"><span class="habit-box" aria-hidden="true"></span><span class="habit-label">${e(habit)}</span></label>`).join('\n            ')}
          </fieldset>
          <p class="daily-status" role="status" aria-live="polite" data-daily-status></p>
          <div class="daily-history" data-daily-history hidden>
            <div class="daily-history-head"><p>Last 12 weeks</p><p data-daily-consistency></p></div>
            <div class="heatmap" data-heatmap role="img"></div>
            <p class="daily-rule">One rest day a week never breaks your streak.</p>
          </div>
          <div class="daily-actions" data-daily-actions hidden>
            <button type="button" class="btn btn-primary" data-install hidden>Install the app</button>
            <button type="button" class="btn btn-ghost" data-reminder>Add a daily reminder</button>
            <button type="button" class="btn btn-ghost" data-image-daily>Save image</button>
          </div>
        </div>
      </div>
      <dialog class="install-sheet" data-install-sheet aria-labelledby="install-title">
        <h3 id="install-title">Add Stay Single to your home screen</h3>
        <ol>
          <li>Tap the <strong>Share</strong> button in Safari’s toolbar.</li>
          <li>Choose <strong>Add to Home Screen</strong>.</li>
          <li>Tap <strong>Add</strong>. It opens like an app and works offline.</li>
        </ol>
        <button type="button" class="btn btn-primary" data-install-close>Got it</button>
      </dialog>
    </section>`;
}

// The Single Season: 30 missions in five stages. Without JavaScript it is a readable programme.
function seasonSection(brand) {
  let day = 0;
  return `    <section class="season" id="season" aria-labelledby="season-title">
      <div class="wrap">
        <div class="section-head" data-reveal>
          <div><p class="eyebrow">The Single Season</p><h2 id="season-title" class="section-title" data-sort>Thirty days. One upgrade.</h2></div>
          <p class="section-note">A 30-day challenge in four weeks — Reset, Body, Money &amp; Mind, Standards &amp; People — and a finale. Each mission takes about 15 minutes. A new one unlocks every day, and missing a day never resets anything.</p>
        </div>
        <div class="season-today" data-season-today hidden>
          <div class="season-progress"><p><strong data-season-count>0</strong><span>/ 30 done</span></p><span class="season-bar"><i data-season-bar></i></span></div>
          <div class="season-mission">
            <p class="kicker" data-season-label>Day 01 · Reset</p>
            <p class="season-mission-text" data-season-mission></p>
            <div class="actions">
              <button type="button" class="btn btn-primary" data-season-start>Start my season</button>
              <button type="button" class="btn btn-primary" data-season-done hidden>Mark today done</button>
              <button type="button" class="btn btn-ghost" data-image-season hidden>Save image</button>
            </div>
          </div>
        </div>
        <div class="season-weeks" data-season-weeks>
          ${brand.season.map((stage, index) => `<div class="season-week${stage.days.length < 7 ? ' is-finale' : ''}">
            <p class="kicker">${stage.days.length < 7 ? 'Finale' : `Week ${index + 1}`}</p>
            <h3>${e(stage.week)}</h3>
            <ol>${stage.days.map(mission => {
              day += 1;
              return `<li data-day="${day}"><span class="season-day">${pad(day)}</span><span class="season-text">${e(mission)}</span></li>`;
            }).join('')}</ol>
          </div>`).join('\n          ')}
        </div>
        <p class="season-reset" data-season-reset-row hidden><button type="button" class="text-button" data-season-reset>Restart my season</button></p>
      </div>
    </section>`;
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
            <p class="today"><span class="today-label">Today’s truth</span><q data-today>${e(brand.quotes[0])}</q></p>
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

${truthsSection(brand)}

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

${playSection(brand)}

${dailySection(brand)}

${seasonSection(brand)}

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
    </section>
    <script type="application/json" id="ss-data">${featureData(brand)}</script>`
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
    item({ href: './index.html#truths', title: 'Swipe the Single Truths', note: 'A new truth every day — save your favourites' }),
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

// Installable app: name, colours, icons, and shortcuts straight to the daily tools.
export function renderManifest(brand = BRAND) {
  return JSON.stringify({
    name: brand.name,
    short_name: brand.name,
    description: `${brand.line} The Daily Build, the Single Season and the Single Truths.`,
    id: './',
    start_url: './index.html',
    scope: './',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#0E0E10',
    theme_color: '#0E0E10',
    icons: [
      { src: './icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: './icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: './icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
    ],
    shortcuts: [
      { name: 'The Daily Build', short_name: 'Daily', url: './index.html#daily' },
      { name: 'The Single Season', short_name: 'Season', url: './index.html#season' },
      { name: 'Single Truths', short_name: 'Truths', url: './index.html#truths' }
    ]
  }, null, 2);
}

export function sitePages(brand = BRAND) {
  return [
    ['index.html', renderHome(brand)],
    ['links.html', renderLinks(brand)]
  ];
}
