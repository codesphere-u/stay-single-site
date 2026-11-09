// Story cards: 1080×1920 images sized for TikTok and Instagram stories, drawn on a canvas in the
// visitor's browser. On phones they open the share sheet; elsewhere they download.
const WIDTH = 1080;
const HEIGHT = 1920;
const INK = '#0E0E10';
const BONE = '#F3EEE6';
const SMOKE = '#8C877F';
const EMBER = '#FF5A1F';
const DISPLAY = 'Anton, Impact, "Arial Narrow Bold", sans-serif';
const SANS = 'Inter, system-ui, -apple-system, "Segoe UI", sans-serif';
const MONO = 'ui-monospace, Menlo, Consolas, monospace';

function wrap(context, text, maxWidth) {
  const lines = [];
  let line = '';
  for (const word of String(text).split(/\s+/)) {
    const attempt = line ? `${line} ${word}` : word;
    if (context.measureText(attempt).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = attempt;
    }
  }
  if (line) lines.push(line);
  return lines;
}

// Shrinks the font until the text fits in `maxLines` lines.
function fit(context, text, { family, weight, size, min, maxWidth, maxLines }) {
  for (let current = size; current >= min; current -= 4) {
    context.font = `${weight} ${current}px ${family}`;
    const lines = wrap(context, text, maxWidth);
    if (lines.length <= maxLines) return { lines, size: current };
  }
  context.font = `${weight} ${min}px ${family}`;
  return { lines: wrap(context, text, maxWidth).slice(0, maxLines), size: min };
}

/**
 * Draws a card. All fields are optional except one of `big` or `quote`.
 * kicker: small ember label · big: huge display text (a score, a title) · quote: large sentence
 * body: supporting sentence · dots: { total, done } for a progress grid · handle: footer handle
 */
export async function drawStoryCard({ kicker = '', big = '', quote = '', body = '', dots = null, handle = '' }) {
  await Promise.all([
    document.fonts.load(`400 120px ${DISPLAY}`),
    document.fonts.load(`800 72px ${SANS}`),
    document.fonts.load(`500 40px ${SANS}`)
  ]).catch(() => {});

  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const context = canvas.getContext('2d');

  // Midnight with an ember glow, like the site's opening.
  context.fillStyle = INK;
  context.fillRect(0, 0, WIDTH, HEIGHT);
  const glow = context.createRadialGradient(WIDTH * 0.9, HEIGHT * 0.08, 0, WIDTH * 0.9, HEIGHT * 0.08, WIDTH * 1.1);
  glow.addColorStop(0, 'rgba(255, 90, 31, 0.32)');
  glow.addColorStop(1, 'rgba(255, 90, 31, 0)');
  context.fillStyle = glow;
  context.fillRect(0, 0, WIDTH, HEIGHT);

  const left = 96;
  const maxWidth = WIDTH - left * 2;

  // Wordmark with the ember full stop.
  context.textBaseline = 'alphabetic';
  context.font = `400 96px ${DISPLAY}`;
  context.fillStyle = BONE;
  context.fillText('STAY SINGLE', left, 230);
  const markWidth = context.measureText('STAY SINGLE').width;
  context.fillStyle = EMBER;
  context.fillRect(left + markWidth + 10, 230 - 22, 22, 22);

  // Content sits between the wordmark and the footer; nothing may cross FLOOR.
  const FLOOR = HEIGHT - 290;
  let y = 560;
  if (kicker) {
    context.font = `600 38px ${MONO}`;
    if ('letterSpacing' in context) context.letterSpacing = '4px';
    context.fillStyle = EMBER;
    for (const line of wrap(context, kicker.toUpperCase(), maxWidth)) {
      context.fillText(line, left, y);
      y += 52;
    }
    if ('letterSpacing' in context) context.letterSpacing = '0px';
    y += 24;
  }

  if (big) {
    const { lines, size } = fit(context, big.toUpperCase(), { family: DISPLAY, weight: 400, size: 300, min: 120, maxWidth, maxLines: 3 });
    context.fillStyle = BONE;
    y += size * 0.85;
    for (const line of lines) {
      context.fillText(line, left, y);
      y += size * 0.9;
    }
    y += 20;
  }

  if (quote) {
    const { lines, size } = fit(context, `“${quote}”`, { family: SANS, weight: 800, size: 96, min: 56, maxWidth, maxLines: 7 });
    context.fillStyle = BONE;
    y += size;
    for (const line of lines) {
      context.fillText(line, left, y);
      y += size * 1.12;
    }
    y += 20;
  }

  if (body) {
    // As large as fits in the space left above the footer; trimmed with an ellipsis if it still won't fit.
    const room = FLOOR - y;
    let size = 46;
    let lines;
    for (; size >= 30; size -= 2) {
      context.font = `500 ${size}px ${SANS}`;
      lines = wrap(context, body, maxWidth);
      if (lines.length * size * 1.38 + size * 0.6 <= room) break;
    }
    size = Math.max(size, 30);
    const fitting = Math.max(1, Math.floor((room - size * 0.6) / (size * 1.38)));
    if (lines.length > fitting) {
      lines = lines.slice(0, fitting);
      lines[fitting - 1] = `${lines[fitting - 1].replace(/[\s.,;:—-]+$/, '')}…`;
    }
    context.fillStyle = '#cfc9c1';
    y += size * 0.6;
    for (const line of lines) {
      context.fillText(line, left, y);
      y += size * 1.38;
    }
  }

  if (dots) {
    // A grid of progress dots, ten per row.
    const gap = 26;
    const radius = 26;
    const startY = Math.max(y + 60, 1380);
    for (let i = 0; i < dots.total; i++) {
      const cx = left + radius + (i % 10) * (radius * 2 + gap);
      const cy = startY + Math.floor(i / 10) * (radius * 2 + gap);
      context.beginPath();
      context.arc(cx, cy, radius, 0, Math.PI * 2);
      context.fillStyle = i < dots.done ? EMBER : 'rgba(255, 255, 255, 0.12)';
      context.fill();
    }
  }

  // Footer: the handle and the line.
  context.fillStyle = EMBER;
  context.fillRect(left, HEIGHT - 230, 120, 6);
  context.font = `600 44px ${MONO}`;
  context.fillStyle = BONE;
  context.fillText(`@${handle}`, left, HEIGHT - 150);
  context.font = `500 36px ${SANS}`;
  context.fillStyle = SMOKE;
  context.fillText('Single by choice. Building on purpose.', left, HEIGHT - 96);

  return new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
}

// Shares the image where the device supports sharing files, otherwise downloads it.
export async function shareStoryCard(card, { filename, text, toast }) {
  const blob = await drawStoryCard(card);
  if (!blob) {
    toast?.('Couldn’t make the image on this device.');
    return;
  }
  const file = new File([blob], filename, { type: 'image/png' });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], text });
      return;
    } catch (error) {
      if (error?.name === 'AbortError') return;
    }
  }
  const url = URL.createObjectURL(blob);
  const link = Object.assign(document.createElement('a'), { href: url, download: filename });
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  toast?.('Image saved — post it to your story.');
}
