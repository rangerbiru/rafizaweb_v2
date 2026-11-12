import { expect, test } from '@playwright/test';
import { PAGES } from './pages';

const EXPECT: Record<string, string[]> = {
  '/': ['Organization', 'WebSite', 'FAQPage'],
  '/layanan/landing-page-umkm/': ['Service', 'BreadcrumbList', 'FAQPage'],
  '/harga/': ['OfferCatalog', 'BreadcrumbList'],
  '/portofolio/almumtaz/': ['CreativeWork', 'BreadcrumbList'],
  '/10-fitur-website-travel-umroh-yang-wajib-ada/': ['BlogPosting', 'BreadcrumbList'],
  '/tentang/': ['AboutPage'],
  '/kontak/': ['ContactPage'],
};

test.describe('SEO hasil build', () => {
  // eslint-disable-next-line no-empty-pattern
  test.beforeEach(({}, info) => test.skip(info.project.name !== 'desktop', 'cukup sekali (desktop)'));
  for (const url of PAGES) {
    test(`meta, h1, JSON-LD: ${url}`, async ({ request }) => {
      const res = await request.get(url);
      expect(res.status()).toBe(200);
      const html = await res.text();
      const title = /<title>([^<]*)<\/title>/.exec(html)?.[1] ?? '';
      const desc = /<meta name="description" content="([^"]*)"/.exec(html)?.[1] ?? '';
      const decode = (s: string) =>
        s
          .replace(/&amp;/g, '&')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'");
      expect(decode(title).length, 'title ≤ 60').toBeLessThanOrEqual(60);
      expect(decode(desc).length, 'description ≥ 140').toBeGreaterThanOrEqual(140);
      expect(decode(desc).length, 'description ≤ 160').toBeLessThanOrEqual(160);
      expect(html.match(/<h1[\s>]/g)?.length, 'tepat satu h1').toBe(1);
      expect(html).toMatch(/<link rel="canonical" href="https:\/\/rafizaweb\.com\/([^"]*\/)?"/);
      const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(
        (m) => JSON.parse(m[1]!),
      );
      expect(blocks.length).toBeGreaterThan(0);
      const types = blocks.flatMap((b) =>
        (b['@graph'] ?? [b]).flatMap((n: { '@type': string | string[] }) => [n['@type']].flat()),
      );
      expect(types).toContain('ProfessionalService');
      for (const t of EXPECT[url] ?? []) expect(types).toContain(t);
      expect(JSON.stringify(blocks)).not.toMatch(/AggregateRating|"Review"/);
    });
  }

  test('hreflang hanya untuk halaman berpadanan', async ({ request }) => {
    const pricing = await (await request.get('/harga/')).text();
    expect(pricing).toContain('<link rel="alternate" hreflang="en" href="https://rafizaweb.com/en/pricing/"');
    expect(pricing).toContain('<link rel="alternate" hreflang="x-default"');
    const article = await (await request.get('/10-fitur-website-travel-umroh-yang-wajib-ada/')).text();
    expect(article).not.toContain('<link rel="alternate" hreflang="en"');
  });

  test('robots.txt, sitemap, rss, llms', async ({ request }) => {
    const robots = await (await request.get('/robots.txt')).text();
    for (const bot of ['GPTBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended'])
      expect(robots).toContain(`User-agent: ${bot}`);
    expect(robots).toContain('Disallow: /keystatic/');
    expect(robots).toContain('Sitemap: https://rafizaweb.com/sitemap-index.xml');
    expect((await request.get('/sitemap-index.xml')).status()).toBe(200);
    expect(await (await request.get('/rss.xml')).text()).toContain('<item>');
    expect(await (await request.get('/llms.txt')).text()).toContain('# Rafizaweb');
    expect(await (await request.get('/llms-full.txt')).text()).toContain('## FAQ');
  });

  test('404 noindex', async ({ request }) => {
    const res = await request.get('/halaman-tidak-ada/');
    expect(res.status()).toBe(404);
    expect(await res.text()).toContain('noindex');
  });
});
