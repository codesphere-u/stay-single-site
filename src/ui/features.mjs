// Interactive features for the home page. Everything the visitor saves stays in their own browser.
import { motion } from './motion.mjs';
import { shareStoryCard } from './storycard.mjs';

const data = JSON.parse(document.getElementById('ss-data')?.textContent || 'null');
const pad = number => String(number).padStart(2, '0');

// Browser storage can be unavailable (private windows, blocked site data): every call is guarded.
const store = {
  get(key, fallback) {
    try {
      const value = localStorage.getItem(`stay-single:${key}`);
      return value === null ? fallback : JSON.parse(value);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try { localStorage.setItem(`stay-single:${key}`, JSON.stringify(value)); } catch { /* not saved */ }
  }
};

const dayKey = (date = new Date()) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const dayNumber = (date = new Date()) => Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 864e5);

let toastTimer;
function toast(message) {
  document.querySelector('.toast')?.remove();
  const node = Object.assign(document.createElement('p'), { className: 'toast', textContent: message });
  node.setAttribute('role', 'status');
  document.body.append(node);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => node.remove(), 2400);
}

// Uses the share sheet where there is one, otherwise copies the text and link.
async function share(text, hash) {
  const url = `${location.origin}${location.pathname}${hash}`;
  if (navigator.share) {
    try {
      await navigator.share({ text, url });
      return;
    } catch (error) {
      if (error?.name === 'AbortError') return;
    }
  }
  try {
    await navigator.clipboard.writeText(`${text} ${url}`);
    toast('Copied — paste it anywhere.');
  } catch {
    toast('Couldn’t copy. Long-press the text to share it.');
  }
}

if (data) {
  truthOfTheDay();
  singleTruths();
  flagGame();
  singleQuiz();
  shouldITextMyEx();
  dailyBuild();
  singleSeason();
  installApp();
}

// A story-sized image of a result, ready for TikTok or Instagram.
const storyImage = (card, filename, text) => shareStoryCard({ handle: data.handle, ...card }, { filename, text, toast });

// Saves a file the visitor asked for (used for the calendar reminder).
function download(content, filename, type) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = Object.assign(document.createElement('a'), { href: url, download: filename });
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/* ---------- Truth of the day: the same truth for everyone, all day ---------- */

function truthOfTheDay() {
  const node = document.querySelector('[data-today]');
  if (node) node.textContent = data.quotes[dayNumber() % data.quotes.length];
}

/* ---------- Single Truths: swipe right to save, left for the next ---------- */

function singleTruths() {
  const deck = document.querySelector('[data-deck]');
  if (!deck) return;
  const cards = [...deck.children];
  const total = cards.length;
  const controls = document.querySelector('[data-deck-controls]');
  const meta = document.querySelector('[data-deck-meta]');
  const count = document.querySelector('[data-deck-count]');
  const status = document.querySelector('[data-deck-status]');
  const saveButton = document.querySelector('[data-deck-save]');
  const savedCount = document.querySelector('[data-saved-count]');
  const dialog = document.querySelector('[data-saved]');
  const savedList = document.querySelector('[data-saved-list]');
  const savedEmpty = document.querySelector('[data-saved-empty]');
  const saved = new Set(store.get('saved', []).filter(index => index < total));

  // Today's truth first, then the rest in a fresh order every visit.
  const first = dayNumber() % total;
  const rest = cards.map((_, index) => index).filter(index => index !== first);
  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rest[i], rest[j]] = [rest[j], rest[i]];
  }
  const order = [first, ...rest];
  let position = 0;
  let leaving = false;

  deck.dataset.enhanced = '';
  deck.tabIndex = 0;
  deck.setAttribute('aria-roledescription', 'card stack');
  deck.setAttribute('aria-describedby', 'truths-title');
  controls.hidden = false;
  meta.hidden = false;

  const at = offset => cards[order[(position + offset) % total]];
  const topIndex = () => order[position % total];

  function render() {
    cards.forEach(card => {
      card.classList.remove('is-top', 'is-next', 'is-third');
      card.setAttribute('aria-hidden', 'true');
    });
    at(2).classList.add('is-third');
    at(1).classList.add('is-next');
    at(0).classList.add('is-top');
    at(0).removeAttribute('aria-hidden');
    count.textContent = `${pad((position % total) + 1)} / ${pad(total)}`;
    saveButton.setAttribute('aria-pressed', String(saved.has(topIndex())));
    savedCount.textContent = String(saved.size);
  }

  function advance(direction, message = '') {
    if (leaving) return;
    const card = at(0);
    const finish = () => {
      card.style.transform = '';
      card.style.opacity = '';
      card.removeAttribute('data-intent');
      card.style.removeProperty('--stamp');
      position += 1;
      leaving = false;
      render();
      status.textContent = message || `Truth ${(position % total) + 1} of ${total}.`;
    };
    if (!motion.matches) return finish();
    leaving = true;
    card.classList.remove('is-dragging');
    card.style.transform = `translate(${direction * 130}%, -8%) rotate(${direction * 20}deg)`;
    card.style.opacity = '0';
    setTimeout(finish, 360);
  }

  function save() {
    const index = topIndex();
    saved.add(index);
    store.set('saved', [...saved]);
    at(0).dataset.intent = 'save';
    at(0).style.setProperty('--stamp', '1');
    advance(1, 'Saved to your truths.');
  }
  const skip = () => {
    at(0).dataset.intent = 'skip';
    at(0).style.setProperty('--stamp', '1');
    advance(-1);
  };

  document.querySelector('[data-deck-skip]').addEventListener('click', skip);
  saveButton.addEventListener('click', () => {
    if (saved.has(topIndex())) {
      saved.delete(topIndex());
      store.set('saved', [...saved]);
      render();
      status.textContent = 'Removed from your truths.';
      return;
    }
    save();
  });
  document.querySelector('[data-deck-share]').addEventListener('click', () =>
    share(`“${data.quotes[topIndex()]}” — Stay Single (@${data.handle})`, '#truths'));
  document.querySelector('[data-deck-image]').addEventListener('click', () =>
    storyImage({ kicker: 'Single Truth', quote: data.quotes[topIndex()] }, 'stay-single-truth.png', `“${data.quotes[topIndex()]}”`));
  deck.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight') { event.preventDefault(); save(); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); skip(); }
  });

  // Drag the top card: past the threshold it saves (right) or skips (left); otherwise it springs back.
  let drag;
  deck.addEventListener('pointerdown', event => {
    const card = event.target.closest('.truth.is-top');
    if (!card || leaving || event.button !== 0) return;
    drag = { card, id: event.pointerId, x: event.clientX, y: event.clientY, dx: 0 };
    card.setPointerCapture(event.pointerId);
    card.classList.add('is-dragging');
  });
  deck.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.id) return;
    drag.dx = event.clientX - drag.x;
    const dy = (event.clientY - drag.y) * 0.25;
    drag.card.style.transform = `translate(${drag.dx}px, ${dy}px) rotate(${drag.dx / 18}deg)`;
    const strength = Math.min(1, Math.abs(drag.dx) / 110);
    drag.card.style.setProperty('--stamp', strength.toFixed(2));
    if (Math.abs(drag.dx) > 24) drag.card.dataset.intent = drag.dx > 0 ? 'save' : 'skip';
    else drag.card.removeAttribute('data-intent');
  });
  const release = event => {
    if (!drag || event.pointerId !== drag.id) return;
    const { card, dx } = drag;
    drag = undefined;
    card.classList.remove('is-dragging');
    if (dx > 110) return save();
    if (dx < -110) return skip();
    card.style.transform = '';
    card.removeAttribute('data-intent');
    card.style.removeProperty('--stamp');
  };
  deck.addEventListener('pointerup', release);
  deck.addEventListener('pointercancel', release);

  // Saved truths.
  function renderSaved() {
    savedList.replaceChildren(...[...saved].map(index => {
      const item = document.createElement('li');
      const text = Object.assign(document.createElement('span'), { textContent: data.quotes[index] });
      const remove = Object.assign(document.createElement('button'), { type: 'button', textContent: 'Remove' });
      remove.setAttribute('aria-label', `Remove “${data.quotes[index]}”`);
      remove.addEventListener('click', () => {
        saved.delete(index);
        store.set('saved', [...saved]);
        renderSaved();
        render();
      });
      item.append(text, remove);
      return item;
    }));
    savedEmpty.hidden = saved.size > 0;
  }
  document.querySelector('[data-saved-open]').addEventListener('click', () => {
    renderSaved();
    dialog.showModal();
  });
  document.querySelector('[data-saved-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });

  render();
}

/* ---------- Red Flag / Green Flag ---------- */

function flagGame() {
  const game = document.querySelector('[data-flags]');
  if (!game) return;
  const cards = [...game.querySelectorAll('.flag-card')];
  const list = game.querySelector('.flag-list');
  const progress = game.querySelector('[data-flags-progress]');
  const result = game.querySelector('[data-flags-result]');
  let index = 0;
  let score = 0;

  game.dataset.enhanced = '';
  game.querySelectorAll('[data-flag-actions]').forEach(actions => { actions.hidden = false; });

  function show(next) {
    index = next;
    cards.forEach((card, position) => card.classList.toggle('is-active', position === index));
    progress.textContent = `Scenario ${index + 1} of ${cards.length} · ${score} right`;
  }

  function finish() {
    list.hidden = true;
    result.hidden = false;
    const best = Math.max(score, store.get('flags-best', 0));
    store.set('flags-best', best);
    result.querySelector('[data-flags-score]').textContent = String(score);
    const lines = [
      [cards.length, 'Flag radar: elite. You read people clearly.'],
      [6, 'Sharp eye. A couple slipped past — that’s how you learn.'],
      [4, 'Getting there. Trust what consistency shows you.'],
      [0, 'Time to recalibrate. Standards are a skill — keep practising.']
    ];
    result.querySelector('[data-flags-verdict]').textContent = `${lines.find(([min]) => score >= min)[1]} Best so far: ${best}/${cards.length}.`;
    progress.textContent = 'Your score';
    result.querySelector('[data-flags-again]').focus({ preventScroll: true });
  }

  game.addEventListener('click', event => {
    const call = event.target.closest('[data-call]');
    if (call) {
      const card = call.closest('.flag-card');
      const right = call.dataset.call === card.dataset.verdict;
      if (right) score += 1;
      card.classList.add('is-called');
      card.querySelector('.flag-answer').open = true;
      const feedback = Object.assign(document.createElement('p'), {
        className: `flag-feedback ${right ? 'is-right' : 'is-wrong'}`,
        textContent: right ? 'Nice call.' : 'Not quite.'
      });
      const last = cards.indexOf(card) === cards.length - 1;
      const next = Object.assign(document.createElement('button'), {
        type: 'button', className: 'btn btn-primary flag-next', textContent: last ? 'See my score' : 'Next scenario →'
      });
      next.addEventListener('click', () => (last ? finish() : show(index + 1)));
      card.querySelector('.flag-scenario').after(feedback);
      card.append(next);
      progress.textContent = `Scenario ${index + 1} of ${cards.length} · ${score} right`;
      next.focus({ preventScroll: true });
    }
    if (event.target.closest('[data-flags-again]')) {
      score = 0;
      cards.forEach(card => {
        card.classList.remove('is-called');
        card.querySelector('.flag-answer').open = false;
        card.querySelectorAll('.flag-feedback, .flag-next').forEach(node => node.remove());
      });
      result.hidden = true;
      list.hidden = false;
      show(0);
      cards[0].querySelector('[data-call]').focus({ preventScroll: true });
    }
    if (event.target.closest('[data-image-flags]')) {
      storyImage({ kicker: 'Red flag or green flag?', big: `${score}/${cards.length}`, body: result.querySelector('[data-flags-verdict]').textContent },
        'stay-single-flags.png', `I scored ${score}/${cards.length} on Red Flag or Green Flag.`);
    }
    if (event.target.closest('[data-share-flags]')) {
      share(`I scored ${score}/${cards.length} on Red Flag or Green Flag. Can you beat it? — Stay Single (@${data.handle})`, '#play');
    }
  });

  show(0);
}

/* ---------- What kind of single are you? ---------- */

function singleQuiz() {
  const game = document.querySelector('[data-quiz]');
  if (!game) return;
  const form = game.querySelector('[data-quiz-form]');
  const steps = [...form.querySelectorAll('.quiz-step')];
  const progress = game.querySelector('[data-quiz-progress]');
  const result = game.querySelector('[data-quiz-result]');
  let current;

  game.dataset.enhanced = '';

  function show(index) {
    steps.forEach((step, position) => step.classList.toggle('is-active', position === index));
    progress.textContent = `Question ${index + 1} of ${steps.length}`;
  }

  function finish() {
    const answers = steps.map(step => step.querySelector('input:checked')?.value).filter(Boolean);
    const tally = answers.reduce((counts, type) => ({ ...counts, [type]: (counts[type] || 0) + 1 }), {});
    // Most common answer wins; a tie goes to the most recent answer.
    const top = Math.max(...Object.values(tally));
    current = [...answers].reverse().find(type => tally[type] === top);
    const archetype = data.archetypes[current];
    game.querySelector('[data-quiz-type]').textContent = archetype.title;
    game.querySelector('[data-quiz-copy]').textContent = archetype.copy;
    game.querySelector('[data-quiz-move]').textContent = archetype.move;
    store.set('quiz-result', current);
    form.hidden = true;
    result.hidden = false;
    progress.textContent = 'Your result';
    result.querySelector('[data-share-quiz]').focus({ preventScroll: true });
  }

  form.addEventListener('change', event => {
    const step = steps.indexOf(event.target.closest('.quiz-step'));
    if (step < 0) return;
    setTimeout(() => {
      if (step === steps.length - 1) return finish();
      show(step + 1);
      steps[step + 1].querySelector('input').focus({ preventScroll: true });
    }, motion.matches ? 320 : 0);
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    finish();
  });
  game.querySelector('[data-quiz-again]').addEventListener('click', () => {
    form.reset();
    form.hidden = false;
    result.hidden = true;
    show(0);
    steps[0].querySelector('input').focus({ preventScroll: true });
  });
  game.querySelector('[data-image-quiz]').addEventListener('click', () => {
    const archetype = data.archetypes[current];
    storyImage({ kicker: 'What kind of single are you?', big: archetype.title, body: `${archetype.copy} Your move: ${archetype.move}` },
      'stay-single-type.png', `I’m ${archetype.title}.`);
  });
  game.querySelector('[data-share-quiz]').addEventListener('click', () => {
    const archetype = data.archetypes[current];
    share(`I’m ${archetype.title}. What kind of single are you? — Stay Single (@${data.handle})`, '#play');
  });

  show(0);
}

/* ---------- The Daily Build ---------- */

function dailyBuild() {
  const card = document.querySelector('[data-daily]');
  if (!card) return;
  const boxes = [...card.querySelectorAll('[data-habit]')];
  const doneLabel = card.querySelector('[data-daily-done]');
  const streakLabel = card.querySelector('[data-daily-streak]');
  const status = card.querySelector('[data-daily-status]');
  const SOLID = 4;
  let today = dayKey();

  const historyBox = card.querySelector('[data-daily-history]');
  const heatmap = card.querySelector('[data-heatmap]');
  const consistencyLabel = card.querySelector('[data-daily-consistency]');
  historyBox.hidden = false;
  card.querySelector('[data-daily-actions]').hidden = false;

  const history = () => store.get('daily-history', {});
  // Counts solid days back from today. One off day a week is a rest day and doesn't break the
  // streak — habits form over weeks, and a single miss shouldn't undo them. Today only counts once it's solid.
  function streak(log) {
    const date = new Date();
    if ((log[dayKey(date)] || 0) < SOLID) date.setDate(date.getDate() - 1);
    let days = 0;
    let sinceRest = Infinity;
    for (let i = 0; i < 1000; i++) {
      if ((log[dayKey(date)] || 0) >= SOLID) {
        days += 1;
        sinceRest += 1;
      } else if (days > 0 && sinceRest >= 7) {
        sinceRest = 0;
      } else {
        break;
      }
      date.setDate(date.getDate() - 1);
    }
    return days;
  }

  // The last twelve weeks, one square a day, oldest first; deeper ember means more wins.
  function drawHistory(log) {
    const cells = [];
    let solidRecent = 0;
    for (let back = 83; back >= 0; back--) {
      const date = new Date();
      date.setDate(date.getDate() - back);
      const count = log[dayKey(date)] || 0;
      if (back < 30 && count >= SOLID) solidRecent += 1;
      const cell = document.createElement('i');
      cell.dataset.level = String(count === 0 ? 0 : count < SOLID ? 1 : count < boxes.length ? 2 : 3);
      if (back === 0) cell.className = 'is-today';
      cells.push(cell);
    }
    heatmap.replaceChildren(...cells);
    const solidTotal = Object.entries(log).filter(([key, count]) => count >= SOLID && cells.length && key >= dayKey(new Date(Date.now() - 83 * 864e5))).length;
    heatmap.setAttribute('aria-label', `${solidTotal} solid days in the last 12 weeks`);
    consistencyLabel.textContent = `${solidRecent}/30 solid days · ${Math.round((solidRecent / 30) * 100)}%`;
    return solidRecent;
  }

  function load() {
    today = dayKey();
    const state = store.get('daily', {});
    const done = state.date === today ? state.done : [];
    boxes.forEach((box, index) => { box.checked = done.includes(index); });
    card.querySelector('[data-daily-date]').textContent = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
    update(false);
  }

  function update(changed) {
    const done = boxes.filter(box => box.checked).map(box => Number(box.dataset.habit));
    const log = history();
    if (changed) {
      store.set('daily', { date: today, done });
      log[today] = done.length;
      store.set('daily-history', log);
    }
    card.style.setProperty('--done', (done.length / boxes.length).toFixed(3));
    doneLabel.textContent = String(done.length);
    streakLabel.textContent = String(streak(log));
    drawHistory(log);
    const complete = done.length === boxes.length;
    card.classList.toggle('is-complete', complete);
    const left = SOLID - done.length;
    status.textContent = complete ? 'Undefeated today.'
      : done.length >= SOLID ? 'Solid day. Streak protected.'
        : done.length ? `${left} more for a solid day.` : '';
    if (changed && complete) burst();
  }

  // A small ember burst from the ring when all six are done.
  function burst() {
    if (!motion.matches) return;
    const ring = card.querySelector('.daily-ring').getBoundingClientRect();
    const box = card.getBoundingClientRect();
    const x = ring.left - box.left + ring.width / 2;
    const y = ring.top - box.top + ring.height / 2;
    for (let i = 0; i < 16; i++) {
      const spark = Object.assign(document.createElement('span'), { className: 'spark' });
      spark.style.left = `${x - 5}px`;
      spark.style.top = `${y - 5}px`;
      card.append(spark);
      const angle = (i / 16) * Math.PI * 2;
      const distance = 70 + Math.random() * 60;
      spark.animate([
        { transform: 'translate(0, 0) scale(1)', opacity: 1 },
        { transform: `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px) scale(.2)`, opacity: 0 }
      ], { duration: 700 + Math.random() * 300, easing: 'cubic-bezier(.2,.8,.3,1)' }).onfinish = () => spark.remove();
    }
  }

  boxes.forEach(box => box.addEventListener('change', () => update(true)));

  // A daily calendar reminder (8pm), so the check-in doesn't depend on notifications.
  card.querySelector('[data-reminder]').addEventListener('click', () => {
    const start = new Date();
    start.setHours(20, 0, 0, 0);
    if (start < new Date()) start.setDate(start.getDate() + 1);
    const local = date => `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}00`;
    const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
    download([
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Stay Single//Daily Build//EN', 'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT', `UID:daily-build-${Date.now()}@stay-single`, `DTSTAMP:${stamp}`, `DTSTART:${local(start)}`, 'DURATION:PT10M',
      'RRULE:FREQ=DAILY', 'SUMMARY:The Daily Build', 'DESCRIPTION:Six small wins. Tick them off on Stay Single.',
      `URL:${location.origin}${location.pathname}#daily`,
      'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:The Daily Build', 'TRIGGER:PT0M', 'END:VALARM',
      'END:VEVENT', 'END:VCALENDAR', ''
    ].join('\r\n'), 'stay-single-daily-build.ics', 'text/calendar');
    toast('Reminder saved — open it to add it to your calendar.');
  });
  card.querySelector('[data-image-daily]').addEventListener('click', () => {
    const log = history();
    const days = streak(log);
    const doneToday = boxes.filter(box => box.checked).length;
    storyImage({ kicker: 'The Daily Build', big: `${days} day streak`, body: `${doneToday}/${boxes.length} wins today. ${consistencyLabel.textContent}.` },
      'stay-single-streak.png', `${days}-day streak on the Daily Build.`);
  });
  // A new day starts fresh, even if the tab stayed open overnight.
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && dayKey() !== today) load();
  });
  load();
}

/* ---------- Should I text my ex? ---------- */

function shouldITextMyEx() {
  const stage = document.querySelector('[data-ex-stage]');
  if (!stage) return;
  const progress = document.querySelector('[data-ex-progress]');
  const { start, questions, verdicts } = data.exTest;
  const view = document.createElement('div');
  stage.dataset.enhanced = '';
  stage.append(view);
  let trail = [];

  const node = (tag, className, text) => Object.assign(document.createElement(tag), { className, textContent: text ?? '' });
  const button = (label, className, onClick) => {
    const element = node('button', `btn ${className}`, label);
    element.type = 'button';
    element.addEventListener('click', onClick);
    return element;
  };
  function trailList() {
    const list = node('ol', 'ex-trail');
    list.setAttribute('aria-label', 'Your answers');
    trail.forEach(({ text, answer }) => list.append(node('li', '', `${text.replace(/\?$/, '')}: ${answer}`)));
    return list;
  }

  function ask(id) {
    const question = questions[id];
    progress.textContent = `Question ${trail.length + 1}`;
    const answers = node('div', 'ex-answers');
    for (const [label, key, style] of [['Yes', 'yes', 'btn-primary'], ['No', 'no', 'btn-outline']]) {
      answers.append(button(label, style, () => {
        trail.push({ text: question.text, answer: label });
        const next = question[key];
        if (questions[next]) ask(next);
        else verdict(next);
      }));
    }
    view.replaceChildren(...(trail.length ? [trailList()] : []), node('p', 'ex-question', question.text), answers);
    if (trail.length) answers.querySelector('button').focus({ preventScroll: true });
  }

  function verdict(id) {
    const result = verdicts[id];
    progress.textContent = 'The verdict';
    const box = node('div', 'ex-verdict');
    box.setAttribute('role', 'status');
    box.append(
      node('p', `ex-badge ${result.send ? 'is-send' : 'is-hold'}`, result.send ? 'Send — carefully' : 'Don’t send'),
      node('p', 'ex-verdict-title', result.title),
      node('p', '', result.copy)
    );
    const actions = node('div', 'actions');
    actions.append(
      button('Start over', 'btn-primary', () => { trail = []; ask(start); view.querySelector('button').focus({ preventScroll: true }); }),
      button('Share', 'btn-outline', () => share(`“Should I text my ex?” The verdict: ${result.title} — Stay Single (@${data.handle})`, '#play')),
      button('Save image', 'btn-outline', () => storyImage({ kicker: 'Should I text my ex?', big: result.send ? 'Carefully.' : 'Don’t.', body: `${result.title} ${result.copy}` },
        'stay-single-text-my-ex.png', `Should I text my ex? ${result.title}`))
    );
    view.replaceChildren(trailList(), box, actions);
    actions.querySelector('button').focus({ preventScroll: true });
  }

  ask(start);
}

/* ---------- The Single Season: 30 days, one mission unlocks each day ---------- */

function singleSeason() {
  const weeks = document.querySelector('[data-season-weeks]');
  if (!weeks) return;
  const panel = document.querySelector('[data-season-today]');
  const items = [...weeks.querySelectorAll('li[data-day]')];
  const missions = data.season.flatMap(stage => stage.days.map(text => ({ text, stage: stage.week })));
  const total = missions.length;
  const labels = {
    done: panel.querySelector('[data-season-count]'),
    label: panel.querySelector('[data-season-label]'),
    mission: panel.querySelector('[data-season-mission]')
  };
  const buttons = {
    start: panel.querySelector('[data-season-start]'),
    done: panel.querySelector('[data-season-done]'),
    image: panel.querySelector('[data-image-season]'),
    reset: document.querySelector('[data-season-reset]')
  };
  const resetRow = document.querySelector('[data-season-reset-row]');
  let state = store.get('season', null);
  let focusDay = 1;
  panel.hidden = false;

  // Every mission becomes a button: tick off any unlocked day, in any order.
  items.forEach(item => {
    const toggle = Object.assign(document.createElement('button'), { type: 'button', className: 'season-item' });
    toggle.append(...item.childNodes);
    item.append(toggle);
    toggle.addEventListener('click', () => toggleDay(Number(item.dataset.day)));
  });

  const parse = key => {
    const [year, month, day] = key.split('-').map(Number);
    return new Date(year, month - 1, day);
  };
  const today = () => (state ? Math.min(total, Math.max(1, dayNumber() - dayNumber(parse(state.start)) + 1)) : 0);
  const save = () => store.set('season', state);

  function toggleDay(day) {
    if (!state || day > today()) return;
    const done = new Set(state.done);
    if (done.has(day)) done.delete(day);
    else done.add(day);
    state.done = [...done].sort((a, b) => a - b);
    save();
    render();
  }

  function render() {
    const current = today();
    const done = new Set(state?.done || []);
    items.forEach(item => {
      const day = Number(item.dataset.day);
      const locked = !state || day > current;
      item.classList.toggle('is-locked', locked);
      item.classList.toggle('is-today', Boolean(state) && day === current);
      item.classList.toggle('is-done', done.has(day));
      const toggle = item.querySelector('.season-item');
      toggle.disabled = locked;
      toggle.setAttribute('aria-pressed', String(done.has(day)));
      toggle.setAttribute('aria-label', `Day ${day}: ${missions[day - 1].text}${locked ? ' — locked' : done.has(day) ? ' — done' : ''}`);
    });
    labels.done.textContent = String(done.size);
    panel.style.setProperty('--season', (done.size / total).toFixed(3));
    buttons.start.hidden = Boolean(state);
    buttons.done.hidden = !state;
    buttons.image.hidden = !state;
    resetRow.hidden = !state;

    if (!state) {
      focusDay = 1;
      labels.label.textContent = `Day 01 · ${missions[0].stage}`;
      labels.mission.textContent = missions[0].text;
      return;
    }
    if (done.size === total) {
      labels.label.textContent = 'Season complete';
      labels.mission.textContent = 'All thirty. Share it, then start your next season when you’re ready.';
      buttons.done.hidden = true;
      return;
    }
    // Show the earliest unlocked mission still to do — catching up is always allowed.
    focusDay = items.map(item => Number(item.dataset.day)).find(day => day <= current && !done.has(day)) || current;
    const mission = missions[focusDay - 1];
    labels.label.textContent = `Day ${pad(focusDay)} · ${mission.stage}${focusDay < current ? ' · catch up' : ''}`;
    labels.mission.textContent = mission.text;
    buttons.done.textContent = done.has(focusDay) ? 'Done ✓' : focusDay === current ? 'Mark today done' : `Mark day ${pad(focusDay)} done`;
    buttons.done.disabled = done.has(focusDay);
  }

  buttons.start.addEventListener('click', () => {
    state = { start: dayKey(), done: [] };
    save();
    render();
    toast('Season started. Day 1 is unlocked.');
    buttons.done.focus({ preventScroll: true });
  });
  buttons.done.addEventListener('click', () => {
    toggleDay(focusDay);
    if (state.done.length === total) toast('Season complete. Thirty for thirty.');
  });
  buttons.image.addEventListener('click', () => {
    const done = state.done.length;
    storyImage({ kicker: 'The Single Season', big: done === total ? 'Season done.' : `Day ${pad(today())}`, body: `${done}/${total} missions done. Single by choice, building on purpose.`, dots: { total, done } },
      'stay-single-season.png', `Day ${today()} of the Single Season: ${done}/${total} done.`);
  });
  buttons.reset.addEventListener('click', () => {
    if (!confirm('Restart your season? Your progress will be cleared.')) return;
    state = null;
    save();
    render();
  });
  // A new mission unlocks at midnight, even if the tab stayed open; progress made in another tab shows up too.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) return;
    state = store.get('season', null);
    render();
  });
  render();
}

/* ---------- Install as an app ---------- */

function installApp() {
  const button = document.querySelector('[data-install]');
  const sheet = document.querySelector('[data-install-sheet]');
  if (!button || matchMedia('(display-mode: standalone)').matches || navigator.standalone) return;
  let deferred;
  addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferred = event;
    button.hidden = false;
  });
  // iPhone and iPad have no install prompt, so show the steps instead.
  const apple = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (apple) button.hidden = false;
  button.addEventListener('click', async () => {
    if (deferred) {
      deferred.prompt();
      const { outcome } = await deferred.userChoice;
      deferred = undefined;
      if (outcome === 'accepted') button.hidden = true;
      return;
    }
    sheet.showModal();
  });
  sheet.querySelector('[data-install-close]').addEventListener('click', () => sheet.close());
  addEventListener('appinstalled', () => {
    button.hidden = true;
    toast('Installed. Stay Single is on your home screen.');
  });
}
