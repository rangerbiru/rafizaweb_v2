import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** Setiap baris tests/fixtures/url-inventory.csv harus 200, atau 301 ke URL yang 200 (PRD §9.6). */
const csv = readFileSync(
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../fixtures/url-inventory.csv'),
  'utf8',
)
  .trim()
  .split('\n')
  .slice(1);
const rows = csv.map((l) => {
  const [oldUrl, type, , newUrl, status] = l.split(',');
  return { from: new URL(oldUrl!).pathname, to: new URL(newUrl!).pathname, type, status: Number(status) };
});

test.describe('Inventaris URL lama', () => {
  // eslint-disable-next-line no-empty-pattern
  test.beforeEach(({}, info) => test.skip(info.project.name !== 'desktop', 'cukup sekali (desktop)'));
  for (const r of rows) {
    test(`${r.from} → ${r.status === 200 ? '200' : r.to}`, async ({ request }) => {
      const res = await request.get(r.from, { maxRedirects: 0 });
      if (r.status === 200) {
        expect(res.status()).toBe(200);
      } else {
        expect(res.status()).toBe(301);
        expect(new URL(res.headers().location!, 'http://x').pathname).toBe(r.to);
        const final = await request.get(r.to);
        expect(final.status()).toBe(200);
      }
    });
  }
});
