import { describe, expect, it } from 'vitest';
import { contactSchema, fieldErrors, waitlistSchema } from '../../src/lib/validation';

const valid = {
  name: 'Budi Santoso',
  whatsapp: '0813 1743 5630',
  email: '',
  service: 'company-profile',
  budget: '1-5jt',
  message: 'Saya butuh company profile untuk CV saya.',
  consent: 'true',
  locale: 'id',
};

describe('contactSchema', () => {
  it('menerima data valid dan mengosongkan email kosong', () => {
    const r = contactSchema.safeParse(valid);
    expect(r.success).toBe(true);
    expect(r.success && r.data.email).toBeUndefined();
    expect(r.success && r.data.consent).toBe(true);
  });
  it('menolak nama, WhatsApp, pesan, dan consent yang tidak valid', () => {
    const r = contactSchema.safeParse({
      ...valid,
      name: 'A',
      whatsapp: 'abc',
      message: 'pendek',
      consent: '',
    });
    expect(r.success).toBe(false);
    if (!r.success)
      expect(Object.keys(fieldErrors(r.error)).sort()).toEqual(['consent', 'message', 'name', 'whatsapp']);
  });
  it('menolak email dengan format salah', () => {
    const r = contactSchema.safeParse({ ...valid, email: 'bukan-email' });
    expect(r.success).toBe(false);
  });
  it('mengabaikan layanan yang tidak dikenal dan locale asing', () => {
    const r = contactSchema.safeParse({ ...valid, service: 'hack', locale: 'fr' });
    expect(r.success && r.data.service).toBeUndefined();
    expect(r.success && r.data.locale).toBe('id');
  });
});

describe('waitlistSchema', () => {
  it('menerima email valid', () => {
    expect(
      waitlistSchema.safeParse({ name: 'Budi', whatsapp: '0813 1743 5630', email: 'a@b.co', consent: true })
        .success,
    ).toBe(true);
  });
  it('mewajibkan nama dan nomor WhatsApp', () => {
    expect(waitlistSchema.safeParse({ email: 'a@b.co', consent: true }).success).toBe(false);
  });
  it('mewajibkan consent', () => {
    expect(
      waitlistSchema.safeParse({ name: 'Budi', whatsapp: '0813 1743 5630', email: 'a@b.co', consent: false })
        .success,
    ).toBe(false);
  });
});
