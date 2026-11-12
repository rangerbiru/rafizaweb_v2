/**
 * Ambil screenshot website klien (desktop 1440 + mobile 390) untuk portofolio (PRD §14 P3).
 * PERHATIAN: jalankan hanya setelah klien memberi izin. Hasil disimpan ke apps/web/public/images/portfolio/{slug}/
 * lalu isi field screenshotDesktop/screenshotMobile di Keystatic.
 *
 *   pnpm tsx scripts/screenshot-clients.ts            # semua klien dengan URL
 *   pnpm tsx scripts/screenshot-clients.ts almumtaz   # satu klien
 */
import { chromium } from '@playwright/test';
import { mkdirSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIR = path.join(ROOT, 'apps/web/src/content/portfolio');
const OUT = path.join(ROOT, 'apps/web/public/images/portfolio');
const only = process.argv[2];

const clients = readdirSync(DIR)
  .filter((f) => f.endsWith('.json'))
  .map((f) => ({
    slug: f.replace(/\.json$/, ''),
    ...(JSON.parse(readFileSync(path.join(DIR, f), 'utf8')) as { url: string; name: string }),
  }))
  .filter((c) => c.url && (!only || c.slug === only));

const browser = await chromium.launch();
for (const c of clients) {
  const dir = path.join(OUT, c.slug);
  mkdirSync(dir, { recursive: true });
  for (const [name, width, height] of [
    ['desktop', 1440, 900],
    ['mobile', 390, 844],
  ] as const) {
    const page = await browser.newPage({
      viewport: { width, height },
      deviceScaleFactor: name === 'mobile' ? 2 : 1,
    });
    try {
      await page.goto(c.url, { waitUntil: 'networkidle', timeout: 45_000 });
      await page.waitForTimeout(1500);
      const file = path.join(dir, `${name}.png`);
      await page.screenshot({ path: file });
      console.log(`✓ ${c.name} ${name} → ${path.relative(ROOT, file)}`);
    } catch (err) {
      console.warn(`✗ ${c.name} ${name}: ${(err as Error).message}`);
    } finally {
      await page.close();
    }
  }
}
await browser.close();
