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
