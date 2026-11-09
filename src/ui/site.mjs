import { motion, sortHeadings } from './motion.mjs';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
const compact = matchMedia('(max-width: 760px)');

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

/* ---------- Navigation: hidden at the top (desktop), the orb once the page scrolls ---------- */

const header = document.querySelector('[data-header]');
const nav = header.querySelector('.dock');
const pages = nav.querySelector('.nav-pages');
const toggle = header.querySelector('.nav-toggle');
const orb = header.querySelector('.nav-orb');
const orbCore = orb.querySelector('.nav-orb-core');

// The orb appears as soon as the page scrolls, with a little hysteresis so it never flickers.
const ORB_AT = 32;
const BAR_AT = 12;

let orbMode = false;
let open = false;
let closing;

const navItems = () => [...pages.children];
const centerOf = node => {
  const box = node.getBoundingClientRect();
  return { x: box.left + box.width / 2, y: box.top + box.height / 2, r: box.width / 2 };
};
const settle = nodes => nodes.forEach(node => node.getAnimations().forEach(animation => animation.cancel()));

// The links show as a card when opened from the orb, or from the Menu island on small screens.
function syncCard() {
  const showing = open || header.classList.contains('is-closing');
  header.classList.toggle('is-card', showing && (orbMode || compact.matches));
}

function render() {
  header.classList.toggle('is-orb', orbMode);
  header.classList.toggle('is-hidden', !orbMode);
  header.classList.toggle('is-open', open);
  syncCard();
  for (const control of [toggle, orb]) control.setAttribute('aria-expanded', String(open));
  orb.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  nav.hidden = !orbMode && compact.matches && !open;
  toggle.inert = orbMode;
  orb.inert = !orbMode;
  nav.inert = orbMode && !open;
}

function toOrb(animate) {
  settle([toggle, orbCore]);
  const from = animate && motion.matches && compact.matches ? centerOf(toggle) : null;
  const target = centerOf(orb);
  orbMode = true;
  open = false;
  render();
  placeHighlight(null);
  if (!animate || !motion.matches) return;
  if (from) {
    toggle.animate([
      { visibility: 'visible', opacity: 1, transform: 'none' },
      { visibility: 'visible', opacity: 0, transform: `translate(${target.x - from.x}px, ${target.y - from.y}px) scale(.3)` }
    ], { duration: 380, easing: 'cubic-bezier(.6,0,.75,.3)' });
  }
  orbCore.animate([
    { transform: 'scale(0) rotate(-140deg)' },
    { transform: 'scale(1.14) rotate(8deg)', offset: 0.68 },
    { transform: 'none' }
  ], { duration: 560, delay: from ? 180 : 0, easing: 'cubic-bezier(.2,.8,.3,1)', fill: 'backwards' });
}

function toBar(animate) {
  closeMenu({ instant: true });
  settle([toggle, orbCore]);
  orbMode = false;
  render();
  restHighlight();
  if (!animate || !motion.matches) return;
  orbCore.animate([
    { visibility: 'visible', opacity: 1, transform: 'none' },
    { visibility: 'visible', opacity: 0, transform: 'scale(0) rotate(120deg)' }
  ], { duration: 280, easing: 'cubic-bezier(.5,0,.75,0)' });
  if (compact.matches) {
    toggle.animate([{ opacity: 0, transform: 'translateY(-10px) scale(.9)' }, { opacity: 1, transform: 'none' }],
      { duration: 500, delay: 120, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' });
  }
}

function cardGeometry() {
  const origin = centerOf(orb);
  const card = nav.getBoundingClientRect();
  const x = origin.x - card.left;
  const y = origin.y - card.top;
  return { origin, x, y, reach: Math.hypot(Math.max(x, card.width - x), Math.max(y, card.height - y)) };
}

function finishClosing() {
  if (!closing) return;
  closing.onfinish = null;
  closing.cancel();
  closing = undefined;
  header.classList.remove('is-closing');
  syncCard();
  settle(navItems());
  restHighlight();
}

function openMenu() {
  finishClosing();
  settle([nav, ...navItems()]);
  open = true;
  render();
  placeHighlight(null);
  if (!orbMode || !motion.matches) return;
  // The card pours out of the orb, and the links spill out after it.
  const { origin, x, y, reach } = cardGeometry();
  nav.animate([
    { clipPath: `circle(${origin.r}px at ${x}px ${y}px)` },
    { clipPath: `circle(${reach}px at ${x}px ${y}px)` }
  ], { duration: 640, easing: 'cubic-bezier(.7,0,.15,1)' });
  navItems().forEach((item, index) => {
    const point = centerOf(item);
    item.animate([
      { opacity: 0, transform: `translate(${(origin.x - point.x) * 0.45}px, ${(origin.y - point.y) * 0.45}px) scale(.55) rotate(-5deg)`, filter: 'blur(6px)' },
      { opacity: 1, transform: 'none', filter: 'blur(0)' }
    ], { duration: 700, delay: 110 + index * 55, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' });
  });
}

function closeMenu({ instant = false } = {}) {
  if (!open) {
    if (instant) finishClosing();
    return;
  }
  const animateOut = !instant && orbMode && motion.matches;
  const geometry = animateOut ? cardGeometry() : undefined;
  open = false;
  if (animateOut) header.classList.add('is-closing');
  render();
  if (!animateOut) {
    restHighlight();
    return;
  }
  settle([nav, ...navItems()]);
  const { origin, x, y, reach } = geometry;
  for (const item of navItems()) {
    item.animate([{ opacity: 1 }, { opacity: 0, transform: 'translateY(-6px) scale(.97)' }], { duration: 200, easing: 'ease-in', fill: 'forwards' });
  }
  closing = nav.animate([
    { clipPath: `circle(${reach}px at ${x}px ${y}px)` },
    { clipPath: `circle(${origin.r}px at ${x}px ${y}px)` }
  ], { duration: 460, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'forwards' });
  closing.onfinish = finishClosing;
}

// The dock's highlight rests on the current page or section and slides to whatever is hovered or focused.
const dockItem = target => target?.closest('.nav-pages > li:not(.nav-follow)');
let hovering = false;

function placeHighlight(item) {
  if (!item || orbMode || header.classList.contains('is-card')) {
    pages.style.setProperty('--hl-o', '0');
    return;
  }
  pages.style.setProperty('--hl-x', `${item.offsetLeft}px`);
  pages.style.setProperty('--hl-w', `${item.offsetWidth}px`);
  pages.style.setProperty('--hl-o', '1');
}

function restHighlight() {
  if (!hovering) placeHighlight(dockItem(pages.querySelector('a:is([aria-current], .is-current)')));
}

pages.addEventListener('pointerover', event => {
  const item = dockItem(event.target);
  if (!item) return;
  hovering = true;
  placeHighlight(item);
});
pages.addEventListener('pointerleave', () => {
  hovering = false;
  restHighlight();
});
pages.addEventListener('focusin', event => {
  const item = dockItem(event.target);
  if (item) placeHighlight(item);
  else restHighlight();
});
pages.addEventListener('focusout', event => {
  if (!pages.contains(event.relatedTarget)) restHighlight();
});

// On the home page the dock follows the section in view.
const sections = [...pages.querySelectorAll('a[data-section]')]
  .map(link => [link, document.getElementById(link.dataset.section)])
  .filter(([, section]) => section);
if (sections.length) {
  const spy = new IntersectionObserver(entries => {
    for (const entry of entries) {
      const link = sections.find(([, section]) => section === entry.target)?.[0];
      link?.classList.toggle('is-current', entry.isIntersecting);
    }
    restHighlight();
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(([, section]) => spy.observe(section));
}

function syncLayout() {
  toggle.hidden = !compact.matches;
  closeMenu({ instant: true });
  render();
  restHighlight();
}

toggle.addEventListener('click', () => (open ? closeMenu() : openMenu()));
orb.addEventListener('click', () => (open ? closeMenu() : openMenu()));
compact.addEventListener('change', syncLayout);
nav.addEventListener('click', event => {
  if (event.target.closest('a') && open) closeMenu({ instant: true });
});

orb.addEventListener('pointermove', event => {
  if (!finePointer.matches || !motion.matches) return;
  const { x, y } = centerOf(orb);
  orbCore.style.translate = `${(event.clientX - x) * 0.3}px ${(event.clientY - y) * 0.3}px`;
});
orb.addEventListener('pointerleave', () => { orbCore.style.translate = ''; });

document.addEventListener('keydown', event => {
  if (event.key !== 'Escape' || !open) return;
  event.preventDefault();
  closeMenu();
  (orbMode ? orb : toggle).focus();
});
document.addEventListener('pointerdown', event => {
  if (open && !header.contains(event.target)) closeMenu();
});
document.addEventListener('focusin', event => {
  if (open && !header.contains(event.target)) closeMenu();
});
addEventListener('pagehide', () => closeMenu({ instant: true }));
addEventListener('resize', restHighlight, { passive: true });
document.fonts?.ready.then(restHighlight);
syncLayout();

let scrollFrame;
let primed = false;
function updateScroll() {
  scrollFrame = undefined;
  const pageHeight = document.documentElement.scrollHeight - innerHeight;
  const offset = Math.max(0, scrollY);
  if (!orbMode && offset > ORB_AT) toOrb(primed);
  else if (orbMode && offset < BAR_AT) toBar(primed);
  header.style.setProperty('--reading-progress', (pageHeight > 0 ? clamp(offset / pageHeight, 0, 1) : 0).toFixed(4));
  primed = true;
}
const scheduleScroll = () => { if (scrollFrame === undefined) scrollFrame = requestAnimationFrame(updateScroll); };
addEventListener('scroll', scheduleScroll, { passive: true });
addEventListener('resize', scheduleScroll, { passive: true });
addEventListener('pageshow', scheduleScroll);
scheduleScroll();

/* ---------- Titles: letters sort into place; a closing full stop becomes the ember brand dot ---------- */

sortHeadings(document, {
  decorate(word, text) {
    if (text.endsWith('.')) word.lastElementChild.classList.add('is-period');
  }
});

/* ---------- Manifesto: lights up word by word as you scroll through it ---------- */

const scrub = document.querySelector('[data-scrub]');
if (scrub) {
  const section = scrub.closest('[data-manifesto]');
  const keys = scrub.dataset.keys.split(' ').filter(Boolean);
  scrub.replaceChildren(...scrub.textContent.split(/(\s+)/).filter(Boolean).map(part => {
    if (/^\s+$/.test(part)) return document.createTextNode(part);
    const word = element('span', 'word', part);
    const bare = part.toLowerCase().replace(/[^a-z]/g, '');
    if (keys.some(key => bare.startsWith(key))) word.classList.add('is-key');
    return word;
  }));
  const words = [...scrub.querySelectorAll('.word')];
  let frame;
  const apply = () => {
    frame = undefined;
    if (!motion.matches) {
      section.classList.remove('is-pinned');
      words.forEach(word => word.classList.add('is-lit'));
      return;
    }
    section.classList.add('is-pinned');
    const box = section.getBoundingClientRect();
    const travel = Math.max(1, section.offsetHeight - innerHeight);
    const lit = Math.round(clamp(-box.top / travel, 0, 1) * words.length * 1.15);
    words.forEach((word, index) => word.classList.toggle('is-lit', index < lit));
  };
  const schedule = () => { if (frame === undefined) frame = requestAnimationFrame(apply); };
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule, { passive: true });
  motion.addEventListener('change', schedule);
  apply();
}

/* ---------- Marquee: speeds up with scroll velocity, runs backwards when scrolling up ---------- */

const track = document.querySelector('[data-marquee]');
if (track) {
  let lastY = scrollY;
  let direction = 1;
  let rate = 1;
  let frame;
  let visible = false;
  const tick = () => {
    frame = undefined;
    const animation = track.getAnimations()[0];
    if (!animation || !motion.matches) return;
    const delta = scrollY - lastY;
    lastY = scrollY;
    if (delta) direction = Math.sign(delta);
    const target = direction * (1 + Math.min(9, Math.abs(delta) * 0.32));
    rate += (target - rate) * 0.08;
    if (Math.abs(rate - target) < 0.005) rate = target;
    animation.playbackRate = rate;
    if (visible) frame = requestAnimationFrame(tick);
  };
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    lastY = scrollY;
    if (visible && frame === undefined) frame = requestAnimationFrame(tick);
  }).observe(track);
}

/* ---------- Sections rise into view once ---------- */

if (motion.matches && 'IntersectionObserver' in window) {
  const reveals = new IntersectionObserver((entries, observer) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      observer.unobserve(entry.target);
      entry.target.classList.add('is-revealed');
    }
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('[data-reveal]').forEach(node => reveals.observe(node));
}

/* ---------- TikTok: nothing from TikTok loads until the visitor asks for it ---------- */

for (const stage of document.querySelectorAll('[data-embed]')) {
  stage.querySelector('[data-load-embed]')?.addEventListener('click', () => {
    const template = stage.querySelector('[data-embed-template]');
    stage.querySelector('.embed-facade').replaceWith(template.content.cloneNode(true));
    template.remove();
    stage.classList.add('is-loaded');
    stage.focus({ preventScroll: true });
    const src = stage.dataset.embedSrc;
    if (!document.querySelector(`script[src="${src}"]`)) {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      document.body.append(script);
    }
  });
}

/* ---------- Small touches ---------- */

// Buttons lean toward the pointer.
for (const button of document.querySelectorAll('[data-magnetic]')) {
  button.addEventListener('pointermove', event => {
    if (!finePointer.matches || !motion.matches) return;
    const box = button.getBoundingClientRect();
    button.style.translate = `${((event.clientX - (box.left + box.width / 2)) * 0.22).toFixed(1)}px ${((event.clientY - (box.top + box.height / 2)) * 0.34).toFixed(1)}px`;
  });
  button.addEventListener('pointerleave', () => { button.style.translate = ''; });
}

// Footer wordmark: the pointer paints it ember as it passes, and it drains away on leave.
const wordmark = document.querySelector('.footer-wordmark');
if (wordmark && motion.matches) {
  wordmark.addEventListener('pointermove', event => {
    const box = wordmark.getBoundingClientRect();
    wordmark.style.setProperty('--fill', `${Math.round(((event.clientX - box.left) / box.width) * 100)}%`);
  });
  wordmark.addEventListener('pointerleave', () => wordmark.style.setProperty('--fill', '0%'));
}

// Sign-up: show that the form is on its way to the provider.
for (const form of document.querySelectorAll('[data-join]')) {
  form.addEventListener('submit', () => {
    const button = form.querySelector('button[type="submit"]');
    form.setAttribute('aria-busy', 'true');
    button.textContent = 'Sending…';
  });
}
