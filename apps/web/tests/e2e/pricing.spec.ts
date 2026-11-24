import { expect, test } from '@playwright/test';

const PLANS = [
  { key: 'umkm', price: 300000, id: 'Rp300.000', renewal: 300000 },
  { key: 'starter', price: 899000, id: 'Rp899.000', renewal: 500000 },
  { key: 'bisnis', price: 1499000, id: 'Rp1.499.000', renewal: 500000 },
  { key: 'prime', price: 4999000, id: 'Rp4.999.000', renewal: 1000000 },
];

const jsonLd = (html: string) =>
  [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map((m) => JSON.parse(m[1]!))
    .flatMap((b) => b['@graph'] ?? [b]) as Record<string, unknown>[];

test.describe('Harga', () => {
  test('/harga/ menampilkan 6 paket dan tabel perbandingan lengkap', async ({ page }) => {
    await page.goto('/harga/');
    await expect(page.locator('[data-plan-card]')).toHaveCount(6);
    for (const key of ['umkm', 'starter', 'bisnis', 'prime', 'toko', 'app'])
      await expect(page.locator(`[data-plan-card="${key}"]`)).toHaveCount(1);
    await expect(page.locator('[data-plan-card="toko"]')).toContainText('Harga lewat konsultasi gratis');
    await expect(page.locator('[data-plan-card="app"]')).toContainText('Harga lewat konsultasi gratis');
    await expect(page.locator('[data-plan-card="starter"]')).toHaveAttribute('data-rec', '');
    const table = page.locator('#perbandingan table');
    await expect(table.locator('thead th')).toHaveText([
      'Fitur',
      'UMKM',
      'Starter',
      'Bisnis',
      'Prime',
    ]);
    const labels = await table.locator('tbody th[scope="row"]').allTextContents();
    expect(labels).toEqual([
      'Harga',
      'Perpanjangan per tahun',
      'Domain tahun pertama (termasuk hosting)',
      'Halaman',
      'Artikel blog SEO',
      'SEO',
      'Email bisnis',
      'Tombol WhatsApp, sosmed, Google Maps',
      'Desain responsif',
      'Revisi desain',
      'Pengerjaan',
      'Garansi dan support',
    ]);
    const row = (n: number) => table.locator('tbody tr').nth(n).locator('td');
    await expect(row(0)).toHaveText(PLANS.map((p) => p.id));
    await expect(row(9)).toHaveText(['1×', '2×', '3×', '3×']);
    await expect(row(10)).toHaveText(['2–3 hari kerja', '4–7 hari kerja', '5–9 hari kerja', '±15 hari kerja']);
    await expect(row(11)).toHaveText(['14 hari', '2 bulan', '3 bulan', '3 bulan']);
    await expect(page.locator('main')).not.toContainText(/template/i);
    await expect(page.locator('main')).toContainText('KTP');
    await expect(page.locator('main')).toContainText('Bisa naik paket kapan saja');
  });

  test('nama paket lama tidak tampil di halaman publik', async ({ request }) => {
    for (const url of ['/', '/harga/', '/layanan/', '/en/pricing/', '/ar/pricing/', '/llms.txt']) {
      const html = await (await request.get(url)).text();
      expect(html, url).not.toMatch(/Starter UMKM|Bisnis Growth|Bisnis Prime|Business Growth|Rp699|699,000/);
    }
  });

  for (const url of ['/harga/', '/en/pricing/', '/ar/pricing/']) {
    test(`JSON-LD harga benar: ${url}`, async ({ request }) => {
      const nodes = jsonLd(await (await request.get(url)).text());
      const catalog = nodes.find((n) => n['@type'] === 'OfferCatalog')!;
      const offers = catalog.itemListElement as { price: number; priceCurrency: string }[];
      expect(offers.map((o) => o.price)).toEqual(PLANS.map((p) => p.price));
      expect(offers.every((o) => o.priceCurrency === 'IDR')).toBe(true);
      const org = nodes.find((n) => String(n['@type']).includes('ProfessionalService'))!;
      expect(org.priceRange).toBe('Rp300.000–Rp4.999.000');
      expect(JSON.stringify(nodes)).not.toMatch(/AggregateRating|"Review"/);
    });
  }

  test('FAQPage /harga/ memuat jawaban baru dan FAQ naik paket', async ({ request }) => {
    const nodes = jsonLd(await (await request.get('/harga/')).text());
    const faq = nodes.find((n) => n['@type'] === 'FAQPage')!;
    const text = JSON.stringify(faq);
    expect(text).toContain('Mulai Rp300.000 untuk Paket UMKM, Rp899.000 untuk Starter');
    expect(text).toContain('Bisakah saya naik paket nanti?');
    expect(text).toContain('membayar selisih harga paket');
  });

  test('llms.txt membaca paket baru', async ({ request }) => {
    const txt = await (await request.get('/llms.txt')).text();
    for (const p of PLANS) expect(txt).toContain(p.id);
    expect(txt).toContain('Harga mulai Rp300.000');
  });

  test('Home: hero, layanan, dan meta memakai harga baru', async ({ request }) => {
    const html = await (await request.get('/')).text();
    expect(html).toContain('Mulai Rp300.000, sudah termasuk hosting dan domain tahun pertama.');
    expect(html).toContain('Mulai Rp300rb');
    expect(html).toContain('Selesai 2–3 hari kerja');
    expect(html).toContain('Mulai Rp899.000');
  });
});
