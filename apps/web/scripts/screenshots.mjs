import { chromium } from '@playwright/test';
const url = process.argv[2] ?? 'http://127.0.0.1:4399/';
const out = process.argv[3] ?? '/tmp/claude-1000/shots/home';
const b = await chromium.launch();
for (const [w, h, name] of [
  [1440, 900, 'desktop'],
  [390, 844, 'mobile'],
]) {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  await p.goto(url, { waitUntil: 'networkidle' });
  await p.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 400) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 40));
    }
    window.scrollTo(0, 0);
  });
  await p.waitForTimeout(900);
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
  const sw = await p.evaluate(() => [
    document.documentElement.scrollWidth,
    document.documentElement.scrollHeight,
  ]);
  console.log(name, 'scroll', sw, errs.join(' | '));
  await p.screenshot({ path: `${out}-${name}.png`, fullPage: true });
  // potong per segmen seperti design/screenshots
  const seg = name === 'desktop' ? 1100 : 1500;
  for (let i = 0; i * seg < sw[1] && i < 10; i++) {
    await p.screenshot({
      path: `${out}-${name}-${String(i + 1).padStart(2, '0')}.png`,
      fullPage: true,
      clip: { x: 0, y: i * seg, width: w, height: Math.min(seg, sw[1] - i * seg) },
    });
  }
  await p.close();
}
await b.close();
