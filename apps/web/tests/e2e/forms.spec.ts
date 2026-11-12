import { expect, test } from '@playwright/test';

test.describe('Form kontak', () => {
  test('gagal validasi: error inline + fokus ke field pertama', async ({ page }) => {
    await page.goto('/kontak/');
    await page.getByRole('button', { name: 'Kirim pesan' }).click();
    await expect(page.locator('#c-name')).toBeFocused();
    await expect(page.locator('#c-name')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('#c-name-err')).toHaveText(/minimal 2/);
  });

  test('submit sukses (mode dev tanpa Supabase)', async ({ page }) => {
    await page.goto('/kontak/');
    await page.fill('#c-name', 'Tes E2E');
    await page.fill('#c-wa', '081317435630');
    await page.fill('#c-msg', 'Ini pesan uji otomatis dari Playwright.');
    await page.locator('input[name="consent"]').check();
    await page.getByRole('button', { name: 'Kirim pesan' }).click();
    await expect(page.locator('#kontak-terkirim')).toBeVisible();
  });

  test('tanpa JS: POST biasa lalu redirect ?terkirim=1', async ({ browser, baseURL }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false, baseURL });
    const page = await ctx.newPage();
    await page.goto('/kontak/');
    await page.fill('#c-name', 'Tanpa JS');
    await page.fill('#c-wa', '081317435630');
    await page.fill('#c-msg', 'Pesan ini dikirim tanpa JavaScript.');
    await page.locator('input[name="consent"]').check();
    await page.locator('form[data-contact-form] button[type="submit"]').click();
    await expect(page).toHaveURL(/\/kontak\/\?terkirim=1#kontak-terkirim$/);
    await expect(page.locator('#kontak-terkirim')).toBeVisible();
    await ctx.close();
  });

  test('origin asing ditolak', async ({ request }) => {
    const res = await request.post('/api/contact', {
      headers: { origin: 'https://evil.example', 'content-type': 'application/json' },
      data: {},
    });
    expect(res.status()).toBe(403);
  });
});
