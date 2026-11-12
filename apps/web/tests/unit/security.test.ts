import { describe, expect, it } from 'vitest';
import { waLinkFor } from '../../src/lib/server/mail';
import { ipHash, originAllowed } from '../../src/lib/server/security';
import { fitDescription } from '../../src/lib/seo';

describe('security', () => {
  it('ip_hash stabil dalam satu hari dan berubah esok hari', async () => {
    const d1 = new Date('2026-11-08T03:00:00Z');
    const d2 = new Date('2026-11-09T03:00:00Z');
    expect(await ipHash('1.2.3.4', 's', d1)).toBe(await ipHash('1.2.3.4', 's', d1));
    expect(await ipHash('1.2.3.4', 's', d1)).not.toBe(await ipHash('1.2.3.4', 's', d2));
    expect(await ipHash('1.2.3.4', 's', d1)).not.toContain('1.2.3.4');
  });
  it('hanya menerima origin sendiri', () => {
    const req = (origin?: string) =>
      new Request('https://rafizaweb.com/api/contact', { method: 'POST', headers: origin ? { origin } : {} });
    expect(originAllowed(req('https://rafizaweb.com'))).toBe(true);
    expect(originAllowed(req('https://evil.example'))).toBe(false);
    expect(originAllowed(req())).toBe(false);
  });
  it('mengubah nomor lokal ke link wa.me internasional', () => {
    expect(waLinkFor('0813-1743-5630')).toBe('https://wa.me/6281317435630');
    expect(waLinkFor('+62 813 1743 5630')).toBe('https://wa.me/6281317435630');
  });
  it('fitDescription menjaga rentang 140–160', () => {
    const short =
      'Bisnis travel umroh itu unik. Anda tidak sekadar menjual paket perjalanan, tapi menjual kepercayaan calon jamaah.';
    const out = fitDescription(short);
    expect(out.length).toBeGreaterThanOrEqual(140);
    expect(out.length).toBeLessThanOrEqual(160);
    expect(fitDescription('x '.repeat(120)).length).toBeLessThanOrEqual(160);
  });
});
