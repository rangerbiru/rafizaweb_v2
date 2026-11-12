import type { APIRoute } from 'astro';

/** robots.txt (PRD §9.3): izinkan semua crawler termasuk crawler AI; blokir admin dan API. */
const AI_BOTS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-SearchBot',
  'Claude-User',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot-Extended',
  'Bingbot',
];

export const GET: APIRoute = ({ site }) => {
  const rules = (ua: string) => `User-agent: ${ua}\nAllow: /\nDisallow: /keystatic/\nDisallow: /api/\n`;
  const body = [rules('*'), ...AI_BOTS.map(rules), `Sitemap: ${new URL('/sitemap-index.xml', site)}`].join(
    '\n',
  );
  return new Response(`${body}\n`, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
};
