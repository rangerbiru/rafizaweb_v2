import { describe, expect, it, vi } from 'vitest';
import { handleContact, handleWaitlist, RATE_LIMIT, type Deps } from '../../src/lib/server/handlers';

function deps(over: Partial<Deps> = {}): Deps {
  return {
    verifyTurnstile: vi.fn(async () => true),
    ipHash: 'hash',
    userAgent: 'test',
    countRecent: vi.fn(async () => 0),
    insert: vi.fn(async () => 'ok' as const),
    sendMail: vi.fn(async () => true),
    mailTo: 'admin@rafizaweb.com',
    ...over,
  };
}
const body = {
  name: 'Siti',
  whatsapp: '081317435630',
  message: 'Halo, saya ingin landing page untuk katering.',
  consent: true,
  locale: 'id',
  service: 'landing-page',
};

describe('handleContact', () => {
  it('menyimpan pesan valid dan mengirim email berisi link wa.me', async () => {
    const d = deps();
    const r = await handleContact(body, d);
    expect(r).toEqual({ status: 200, body: { ok: true } });
    expect(d.insert).toHaveBeenCalledWith(
      'messages',
      expect.objectContaining({ name: 'Siti', ip_hash: 'hash', consent: true }),
    );
    const mail = (d.sendMail as ReturnType<typeof vi.fn>).mock.calls[0]![0];
    expect(mail.html).toContain('https://wa.me/6281317435630');
  });
  it('mengembalikan error per field dalam bahasa halaman', async () => {
    const r = await handleContact({ ...body, name: 'S', locale: 'en' }, deps());
    expect(r.status).toBe(422);
    expect(r.body.errors?.name).toMatch(/at least 2/);
  });
  it('honeypot terisi: sukses palsu tanpa menyimpan', async () => {
    const d = deps();
    const r = await handleContact({ ...body, company_website: 'spam.com' }, d);
    expect(r.body.ok).toBe(true);
    expect(d.insert).not.toHaveBeenCalled();
  });
  it('menolak bila Turnstile gagal', async () => {
    const d = deps({ verifyTurnstile: vi.fn(async () => false) });
    expect((await handleContact(body, d)).status).toBe(403);
    expect(d.insert).not.toHaveBeenCalled();
  });
  it(`rate limit: maksimal ${RATE_LIMIT} pesan per jam per ip_hash`, async () => {
    const d = deps({ countRecent: vi.fn(async () => RATE_LIMIT) });
    expect((await handleContact(body, d)).status).toBe(429);
  });
  it('error database → 500', async () => {
    expect((await handleContact(body, deps({ insert: vi.fn(async () => 'error' as const) }))).status).toBe(
      500,
    );
  });
});

describe('handleWaitlist', () => {
  it('email duplikat dianggap sukses tanpa email ulang', async () => {
    const d = deps({ insert: vi.fn(async () => 'duplicate' as const) });
    const r = await handleWaitlist(
      { name: 'Budi', whatsapp: '081317435630', email: 'a@b.co', consent: true, locale: 'id' },
      d,
    );
    expect(r.body.ok).toBe(true);
    expect(d.sendMail).not.toHaveBeenCalled();
  });
  it('mengirim konfirmasi + notifikasi admin untuk pendaftar baru', async () => {
    const d = deps();
    await handleWaitlist({ name: 'Budi', whatsapp: '081317435630', email: 'A@B.co', consent: 'true' }, d);
    expect(d.insert).toHaveBeenCalledWith(
      'waitlist',
      expect.objectContaining({
        name: 'Budi',
        whatsapp: '081317435630',
        email: 'a@b.co',
        product: 'academy',
      }),
    );
    expect(d.sendMail).toHaveBeenCalledTimes(2);
  });
});
