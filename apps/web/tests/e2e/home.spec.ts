import { expect, test } from '@playwright/test';

const desktop = (name: string) => name === 'desktop';

test.describe('Home', () => {
  test('H1 SEO-safe: HTML build berisi "bisnis", typing tidak mengubah teks untuk screen reader', async ({
    page,
    request,
  }) => {
    const html = await (await request.get('/')).text();
    expect(html).toMatch(/<h1[^>]*>[\s\S]*data-typing[^>]*>bisnis<\/span>[\s\S]*<\/h1>/);
    await page.goto('/');
    const typing = page.locator('[data-typing]');
    await expect(typing).toHaveAttribute('aria-hidden', 'true');
    await expect(page.locator('h1 .sr-only')).toHaveText('bisnis');
    await page.waitForTimeout(3200);
    await expect(typing).not.toHaveText('bisnis');
    await expect(page.locator('h1')).toHaveCount(1);
  });

  test('reduced motion: kata statis', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await page.waitForTimeout(3000);
    await expect(page.locator('[data-typing]')).toHaveText('bisnis');
  });

  test('parallax hanya transform via CSS variable (desktop)', async ({ page }, info) => {
    test.skip(!desktop(info.project.name));
    await page.goto('/');
    const area = page.locator('[data-parallax]');
    const box = (await area.boundingBox())!;
    await page.mouse.move(box.x + box.width * 0.9, box.y + box.height * 0.9);
    await expect
      .poll(() => area.evaluate((el) => (el as HTMLElement).style.getPropertyValue('--hx')))
      .not.toBe('');
    await page.mouse.move(5, 5);
    await expect
      .poll(() => area.evaluate((el) => (el as HTMLElement).style.getPropertyValue('--hx')))
      .toBe('0.000');
  });

  test('dropdown Ekosistem: aria-expanded, Esc, klik di luar', async ({ page }, info) => {
    test.skip(!desktop(info.project.name));
    await page.goto('/');
    const btn = page.locator('button[aria-controls="eco-menu"]');
    await btn.click();
    await expect(btn).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#eco-menu')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(btn).toHaveAttribute('aria-expanded', 'false');
    await expect(btn).toBeFocused();
    await btn.click();
    await page.locator('h1').click();
    await expect(page.locator('#eco-menu')).toBeHidden();
    // membuka dropdown lain menutup yang pertama
    await btn.click();
    await page.locator('button[aria-controls="lang-menu"]').click();
    await expect(page.locator('#eco-menu')).toBeHidden();
    await expect(page.locator('#lang-menu')).toBeVisible();
  });

  test('drawer mobile: keyboard, focus trap, Esc, fokus kembali', async ({ page }, info) => {
    test.skip(desktop(info.project.name));
    await page.goto('/');
    const opener = page.locator('[data-drawer-open]');
    await opener.focus();
    await page.keyboard.press('Enter');
    await expect(opener).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('[data-drawer-close]')).toBeFocused();
    await expect(page.locator('[data-mobile-bar]')).toHaveCSS('opacity', '0');
    for (let i = 0; i < 25; i++) await page.keyboard.press('Tab');
    const inside = await page.evaluate(() => !!document.activeElement?.closest('[data-drawer]'));
    expect(inside).toBe(true);
    await page.keyboard.press('Escape');
    await expect(opener).toHaveAttribute('aria-expanded', 'false');
    await expect(opener).toBeFocused();
  });

  test('layanan desktop: tabs keyboard', async ({ page }, info) => {
    test.skip(!desktop(info.project.name));
    await page.goto('/');
    const first = page.locator('#svc-tab-lp');
    await first.focus();
    await page.keyboard.press('ArrowDown');
    await expect(page.locator('#svc-tab-cp')).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('#svc-tab-cp')).toBeFocused();
    await expect(page.locator('#svc-panel-cp')).toBeVisible();
    await expect(page.locator('#svc-panel-lp')).toBeHidden();
    await page.keyboard.press('End');
    await expect(page.locator('#svc-tab-kelas')).toHaveAttribute('aria-selected', 'true');
    await page.keyboard.press('Home');
    await expect(first).toHaveAttribute('aria-selected', 'true');
  });

  test('layanan mobile: accordion + auto-scroll 96px', async ({ page }, info) => {
    test.skip(desktop(info.project.name));
    await page.goto('/');
    const cp = page.locator('[data-svc-toggle="cp"]');
    await cp.scrollIntoViewIfNeeded();
    await cp.click();
    await expect(cp).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('[data-svc-toggle="lp"]')).toHaveAttribute('aria-expanded', 'false');
    await page.waitForTimeout(1200);
    const top = await page.locator('#svc-cp').evaluate((el) => el.getBoundingClientRect().top);
    expect(Math.abs(top - 96)).toBeLessThan(24);
    await cp.click();
    await expect(cp).toHaveAttribute('aria-expanded', 'false');
  });

  test('galeri portofolio', async ({ page }) => {
    await page.goto('/');
    const thumb = page.locator('[data-proj-thumb="blesscom"]');
    await thumb.scrollIntoViewIfNeeded();
    await thumb.click();
    await expect(thumb).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#proj-blesscom')).toBeVisible();
    await expect(page.locator('#proj-almumtaz')).toBeHidden();
  });

  test('tahap harga mengganti rekomendasi', async ({ page }, info) => {
    await page.goto('/');
    await page.locator('#harga').scrollIntoViewIfNeeded();
    await page.getByRole('radio', { name: 'Baru mulai online' }).click();
    await expect(page.locator('[data-plan-card="starter"]')).toHaveAttribute('data-rec', '');
    await expect(page.locator('[data-plan-card="growth"]')).not.toHaveAttribute('data-rec', '');
    if (!desktop(info.project.name)) {
      await expect(page.locator('[data-plan-card="growth"]')).toBeHidden();
      await page.locator('[data-plan-mini="prime"] [data-show-stage]').click();
      await expect(page.locator('[data-plan-card="prime"]')).toBeVisible();
    }
  });

  test('waitlist: idle → form → validasi → done', async ({ page }) => {
    await page.goto('/');
    const root = page.locator('[data-waitlist]');
    await root.scrollIntoViewIfNeeded();
    await page.getByRole('button', { name: 'Gabung daftar tunggu' }).click();
    await expect(root).toHaveAttribute('data-state', 'form');
    await expect(page.locator('#rz-wait-name')).toBeFocused();
    await page.locator('#rz-wait-name').fill('Tes E2E');
    await page.locator('#rz-wait-phone').fill('081317435630');
    await page.locator('#rz-wait').fill('bukan-email');
    await page.getByRole('button', { name: 'Daftar' }).click();
    await expect(page.locator('#rz-wait')).toHaveAttribute('aria-invalid', 'true');
    await page.locator('#rz-wait').fill('e2e@example.com');
    await root.locator('input[name="consent"]').check();
    await page.getByRole('button', { name: 'Daftar' }).click();
    await expect(root).toHaveAttribute('data-state', 'done');
    await expect(page.getByRole('status').filter({ hasText: 'Terdaftar' })).toBeVisible();
  });

  test('FAQ: item pertama terbuka, jawaban ada di DOM', async ({ page }) => {
    await page.goto('/');
    const q = page.locator('#faq button[aria-expanded]');
    await expect(q.first()).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#faq-a-1')).toBeAttached();
    await q.nth(1).click();
    await expect(q.nth(1)).toHaveAttribute('aria-expanded', 'true');
    await expect(q.first()).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#faq-a-0')).toBeHidden();
  });

  test('bar mobile sembunyi saat banner #kontak terlihat', async ({ page }, info) => {
    test.skip(desktop(info.project.name));
    await page.goto('/');
    const bar = page.locator('[data-mobile-bar]');
    await expect(bar).toBeVisible();
    await page.locator('#kontak').scrollIntoViewIfNeeded();
    await expect(bar).toHaveAttribute('data-hidden', '');
  });

  test('pemilih bahasa berpindah ke URL padanan', async ({ page }, info) => {
    test.skip(!desktop(info.project.name));
    await page.goto('/harga/');
    await page.locator('button[aria-controls="lang-menu"]').click();
    await page.locator('#lang-menu a[hreflang="en"]').click();
    await expect(page).toHaveURL(/\/en\/pricing\/$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });

  test('tidak ada scroll horizontal', async ({ page }) => {
    for (const url of ['/', '/en/', '/ar/', '/harga/', '/kontak/']) {
      await page.goto(url);
      const w = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(w, url).toBeLessThanOrEqual(0);
    }
  });
});
