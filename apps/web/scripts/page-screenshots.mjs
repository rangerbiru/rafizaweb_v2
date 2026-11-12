/** Screenshot setiap template halaman (1440 & 390) ke design/screenshots/pages/ untuk review pemilik. */
import { chromium } from '@playwright/test';
const BASE = process.env.BASE ?? 'http://127.0.0.1:4321';
const OUT = new URL('../../../design/screenshots/pages/', import.meta.url).pathname;
const pages = {
  home: '/',
  layanan: '/layanan/',
  'layanan-detail': '/layanan/company-profile/',
  portofolio: '/portofolio/',
  'portofolio-detail': '/portofolio/almumtaz/',
  harga: '/harga/',
  blog: '/blog/',
  'blog-kategori': '/blog/kategori/website/',
  artikel: '/10-fitur-website-travel-umroh-yang-wajib-ada/',
  tentang: '/tentang/',
  kontak: '/kontak/',
  'kebijakan-privasi': '/kebijakan-privasi/',
  'syarat-ketentuan': '/syarat-ketentuan/',
  404: '/tidak-ada/',
  'en-home': '/en/',
  'ar-home': '/ar/',
  'ar-harga': '/ar/pricing/',
};
const b = await chromium.launch();
for (const [w, h, dev] of [
  [1440, 900, 'desktop'],
  [390, 844, 'mobile'],
]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  for (const [name, url] of Object.entries(pages)) {
    await p.goto(BASE + url, { waitUntil: 'networkidle' });
    await p.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 500) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 30));
      }
      window.scrollTo(0, 0);
    });
    await p.addStyleTag({ content: '.rz-marquee{animation:none!important}' });
    await p.evaluate(() => {
      document.querySelectorAll('.rz-reveal-pending').forEach((e) => e.classList.remove('rz-reveal-pending'));
      document.getAnimations().forEach((a) => {
        try {
          if (a.effect?.getTiming().iterations !== Infinity) a.finish();
        } catch {
          /* abaikan */
        }
      });
    });
    await p.screenshot({ path: `${OUT}${name}-${dev}.png`, fullPage: true });
  }
  await p.close();
}
await b.close();
console.log('selesai:', Object.keys(pages).length * 2, 'screenshot');
