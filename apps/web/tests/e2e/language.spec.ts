import { expect, test } from '@playwright/test';

/** Berpindah halaman lewat menu/footer tidak boleh mengembalikan bahasa ke Indonesia. */
for (const lang of ['en', 'ar'] as const) {
  test(`bahasa ${lang} bertahan di semua link menu dan footer`, async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop');
    await page.goto(`/${lang}/`);
    const hrefs = await page.$$eval('header nav a[href^="/"], footer a[href^="/"]', (as) => [
      ...new Set(as.map((a) => a.getAttribute('href')!)),
    ]);
    expect(hrefs.length).toBeGreaterThan(5);
    for (const href of hrefs) {
      if (/^\/#|^\/(en|ar)\/#/.test(href)) continue;
      const res = await page.goto(href);
      expect(res?.status(), href).toBe(200);
      await expect(page.locator('html'), href).toHaveAttribute('lang', lang);
    }
  });
}

test('portofolio dan blog EN tersedia dengan bahasa Inggris', async ({ page }) => {
  await page.goto('/en/portfolio/');
  await expect(page.locator('h1')).toHaveText('Client website portfolio');
  await page.goto('/en/portfolio/almumtaz/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await page.goto('/en/blog/');
  await expect(page.locator('h1')).toHaveText('Rafizaweb Blog');
});
