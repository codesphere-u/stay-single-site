// Everything the site says lives here. Edit this file to change copy, add social links,
// feature specific TikTok videos, or connect a newsletter provider — no template changes needed.

const handle = 'stay_single_men';
const tiktokUrl = `https://www.tiktok.com/@${handle}`;

export const BRAND = {
  name: 'Stay Single',
  handle,
  tiktokUrl,
  established: 2026,

  // The line under the wordmark, and the short introduction.
  line: 'Single by choice. Building on purpose.',
  intro: 'Real talk for men living life on their own terms — building yourself, laughing at the chaos, and knowing your worth before you give your time to anyone.',

  // Words that run along the band under the opening.
  themes: ['Build yourself', 'Know your worth', 'Laugh at it', 'Protect your peace', 'Stack your wins', 'Choose on purpose'],

  // Lights up word by word as the visitor scrolls. Words listed in `manifestoKeys` light in the accent colour.
  manifesto: 'Single isn’t a status. It’s a season to build — your body, your bank, your mind, your peace. Laugh at the chaos. Learn the signs. And when you choose someone, choose on purpose.',
  manifestoKeys: ['season', 'build', 'laugh', 'learn', 'purpose'],

  // The three things the account talks about.
  pillars: [
    {
      title: 'Build',
      kicker: 'Self-improvement',
      copy: 'Discipline, money, fitness and focus. Use the time to become someone you would bet on.'
    },
    {
      title: 'Laugh',
      kicker: 'Single life, honestly',
      copy: 'The group-chat moments, the dating-app chaos, the Sunday resets. If you can laugh at it, it can’t run you.'
    },
    {
      title: 'Know your worth',
      kicker: 'Dating, clearly',
      copy: 'Green flags, red flags, and standards that respect you and the person across the table.'
    }
  ],

  // Single Truths: the swipe deck, and the source of the "Truth of the day". Original lines — add your own.
  quotes: [
    'Single isn’t waiting. It’s building.',
    'Table for one. Best seat in the house.',
    'Date your goals first. They don’t leave you on read.',
    'The gym doesn’t care about your situationship.',
    'Peace is the new flex.',
    'You’re not lonely. You’re in pre-production.',
    'Stop auditioning for people who already cast someone else.',
    'Single by choice. Booked by ambition.',
    'No one texting? Perfect. Read a book.',
    'Being chosen is nice. Choosing yourself is the plan.',
    'Red flags look like party lights when you’re bored. Stay busy.',
    'Main character energy. Side-quest discipline.',
    'Heal in private. Glow in public.',
    'The right one won’t need a group chat to decode.',
    'Don’t chase. Build something worth finding.',
    'A clean room, a full fridge, a quiet mind. Undefeated.',
    'Know your worth. Then add tax.',
    'Loneliness is a room. Solitude is a studio.',
    'Your standards aren’t too high. Your boredom is too loud.',
    'Invest in yourself. The returns compound.',
    'Laugh at the chaos. Don’t date it.',
    'Single is a season, not a sentence.',
    'Respect yourself enough to walk away, and them enough to be honest.',
    'Silence the notifications. Hear yourself think.',
    'Your future partner deserves the upgraded version. So do you.',
    'Unbothered is a full-time job. The pay is peace.',
    'Save money now. Split bills later — maybe.',
    'Consistency is attractive. Start with being consistent to yourself.',
    'If it costs your peace, it’s too expensive.',
    'Some nights the best date is dinner, a film and an early alarm.'
  ],

  // Red Flag / Green Flag: scenarios about how someone treats you — apply to anyone, of any gender.
  flags: [
    { scenario: 'They’re kind to the waiter, even when the food is late.', verdict: 'green', take: 'How someone treats people who can do nothing for them tells you nearly everything.' },
    { scenario: 'They only ever text after midnight.', verdict: 'red', take: 'Consistency in daylight beats attention at 1am.' },
    { scenario: 'They respect your “no” the first time.', verdict: 'green', take: 'Hearing a boundary once is the whole job.' },
    { scenario: 'You feel like you have to earn basic respect.', verdict: 'red', take: 'Respect is the starting line, not the prize.' },
    { scenario: 'They have their own friends, goals and weekend plans.', verdict: 'green', take: 'Two full lives make a better partnership than one half-life.' },
    { scenario: 'They go through your phone “just to check”.', verdict: 'red', take: 'Trust isn’t built by surveillance.' },
    { scenario: 'They apologise, and then the behaviour actually changes.', verdict: 'green', take: 'An apology is a promise; changed behaviour is the receipt.' },
    { scenario: 'Every one of their exes was “crazy”.', verdict: 'red', take: 'If every story has the same villain, check the narrator.' }
  ],

  // "What kind of single are you?" Each answer points at one of the archetypes below.
  quiz: [
    { question: 'Saturday, 9am. You’re…', answers: [['Already at the gym', 'builder'], ['Asleep. Recovery is self-care.', 'peace'], ['In the group chat, roasting everyone', 'comedian'], ['Planning the week like a CEO', 'standard']] },
    { question: 'Someone leaves you on read. You…', answers: [['Didn’t notice. Busy.', 'builder'], ['Light a candle. Unbothered.', 'peace'], ['Turn it into content', 'comedian'], ['Delete the chat. Standards.', 'standard']] },
    { question: 'Your money move this month:', answers: [['A course that levels up a skill', 'builder'], ['A solo weekend away', 'peace'], ['Front row at a comedy show', 'comedian'], ['An emergency fund. Untouchable.', 'standard']] },
    { question: 'Your dating rule:', answers: [['Build first, date later', 'builder'], ['Protect my peace, always', 'peace'], ['If it isn’t fun, it isn’t for me', 'comedian'], ['Clear standards, no guesswork', 'standard']] }
  ],
  archetypes: {
    builder: { title: 'The Builder', copy: 'Single is your off-season. Every rep, page and pay cheque is going into the man you’re becoming.', move: 'Pick one skill this month and go deep.' },
    peace: { title: 'The Peacekeeper', copy: 'Your calm isn’t up for negotiation. You’d rather have a quiet night than a loud mistake.', move: 'Guard your mornings: no phone for the first hour.' },
    comedian: { title: 'The Comedian', copy: 'You laugh at the chaos so it never gets to run you. The group chat would be nothing without you.', move: 'Keep the jokes — and say one real thing out loud this week.' },
    standard: { title: 'The Standard-Setter', copy: 'You know what you want, and you don’t do guesswork. Clear is kind, and you live by it.', move: 'Write down three non-negotiables. Keep them kind and clear.' }
  },

  // The Daily Build: a daily check-in kept only on the visitor's own device.
  habits: ['Trained my body', 'Read 10 pages', 'Put money aside', 'Drank enough water', 'Cooked a real meal', 'Didn’t text the ex'],

  // Social profiles. Leave `url` empty to hide a link everywhere on the site.
  socials: [
    { label: 'TikTok', url: tiktokUrl, note: 'Watch the latest clips' },
    { label: 'Instagram', url: '', note: 'Behind the clips' },
    { label: 'YouTube', url: '', note: 'Longer conversations' },
    { label: 'X', url: '', note: 'Quick takes' },
    { label: 'Threads', url: '', note: 'Daily thoughts' }
  ],

  // Specific videos to feature under the profile embed, as full TikTok video URLs, e.g.
  // 'https://www.tiktok.com/@stay_single_men/video/7300000000000000000'. Hidden while empty.
  featuredVideos: [],

  // Newsletter / community sign-up. Paste the form action URL from your provider
  // (beehiiv, Buttondown, ConvertKit, Formspree…) into `action` and set `emailField` to the
  // name that provider expects. While `action` is empty the site shows an "opening soon" note instead.
  newsletter: {
    action: '',
    method: 'post',
    emailField: 'email',
    title: 'Join the single-man playbook.',
    promise: 'One habit, one laugh and one dating truth, every Sunday. Built for men who are single on purpose.',
    button: 'Get the playbook',
    consent: 'One email a week. Unsubscribe any time. Your address is never sold or shared.'
  }
};

// The video ID from a TikTok video URL, or null if it is not one.
export function videoIdOf(url) {
  const match = /\/video\/(\d+)/.exec(String(url));
  return match ? match[1] : null;
}
