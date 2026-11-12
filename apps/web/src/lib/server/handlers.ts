/**
 * Logika endpoint form (PRD §10.2), dipisah dari runtime agar bisa diuji unit dengan dependency palsu.
 * Urutan: honeypot → validasi Zod → Turnstile → rate limit (5/jam per ip_hash) → insert → email.
 */
import { usePages } from '../../i18n/pages';
import { useT } from '../../i18n';
import { contactSchema, fieldErrors, waitlistSchema } from '../validation';
import { esc, waLinkFor, type Mail } from './mail';
import type { InsertResult } from './supabase';

export type Deps = {
  verifyTurnstile: (token: string | undefined) => Promise<boolean>;
  ipHash: string;
  userAgent?: string;
  countRecent: (table: 'messages' | 'waitlist', since: Date) => Promise<number>;
  insert: (table: 'messages' | 'waitlist', row: Record<string, unknown>) => Promise<InsertResult>;
  sendMail: (mail: Mail) => Promise<boolean>;
  mailTo: string;
  now?: () => Date;
};

export type Result = { status: number; body: { ok: boolean; errors?: Record<string, string> } };

export const RATE_LIMIT = 5;
type Locale = 'id' | 'en' | 'ar';

function localized(locale: Locale, kind: 'contact' | 'waitlist', errs: Record<string, string>) {
  const c = usePages(locale).contact.errors;
  const e = useT(locale).eco;
  const map: Record<string, string> =
    kind === 'contact'
      ? { name: c.name, whatsapp: c.whatsapp, email: c.email, message: c.message, consent: c.consent }
      : { name: e.errorName, whatsapp: e.errorPhone, email: e.errorEmail, consent: e.errorConsent };
  return Object.fromEntries(Object.keys(errs).map((k) => [k, map[k] ?? c.server]));
}

const pickLocale = (raw: unknown): Locale => (raw === 'en' || raw === 'ar' ? raw : 'id');

export async function handleContact(raw: Record<string, unknown>, deps: Deps): Promise<Result> {
  const locale = pickLocale(raw.locale);
  const server = usePages(locale).contact.errors.server;
  // Honeypot terisi → anggap sukses agar bot tidak belajar, tapi jangan simpan.
  if (typeof raw.company_website === 'string' && raw.company_website.trim() !== '')
    return { status: 200, body: { ok: true } };
  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success)
    return {
      status: 422,
      body: { ok: false, errors: localized(locale, 'contact', fieldErrors(parsed.error)) },
    };
  const d = parsed.data;
  if (!(await deps.verifyTurnstile(d['cf-turnstile-response'])))
    return { status: 403, body: { ok: false, errors: { form: server } } };
  const now = deps.now?.() ?? new Date();
  const recent = await deps.countRecent('messages', new Date(now.getTime() - 60 * 60 * 1000));
  if (recent >= RATE_LIMIT) return { status: 429, body: { ok: false, errors: { form: server } } };
  const row = {
    name: d.name,
    whatsapp: d.whatsapp,
    email: d.email ?? null,
    service: d.service ?? null,
    budget: d.budget ?? null,
    message: d.message,
    locale: d.locale,
    source_page: d.source_page ?? null,
    utm: d.utm ?? null,
    consent: true,
    ip_hash: deps.ipHash,
    user_agent: deps.userAgent?.slice(0, 300) ?? null,
  };
  const ins = await deps.insert('messages', row);
  if (ins === 'error') return { status: 500, body: { ok: false, errors: { form: server } } };
  const wa = waLinkFor(d.whatsapp);
  await deps.sendMail({
    to: deps.mailTo,
    subject: `Pesan baru dari ${d.name} (rafizaweb.com)`,
    replyTo: d.email,
    html: `<h2>Pesan baru dari form kontak</h2>
<p><a href="${esc(wa)}">Balas lewat WhatsApp → ${esc(d.whatsapp)}</a></p>
<table cellpadding="6">
<tr><td><b>Nama</b></td><td>${esc(d.name)}</td></tr>
<tr><td><b>WhatsApp</b></td><td>${esc(d.whatsapp)}</td></tr>
<tr><td><b>Email</b></td><td>${esc(d.email ?? '-')}</td></tr>
<tr><td><b>Layanan</b></td><td>${esc(d.service ?? '-')}</td></tr>
<tr><td><b>Budget</b></td><td>${esc(d.budget ?? '-')}</td></tr>
<tr><td><b>Bahasa</b></td><td>${esc(d.locale)}</td></tr>
<tr><td><b>Halaman</b></td><td>${esc(d.source_page ?? '-')}</td></tr>
</table>
<p><b>Pesan:</b><br>${esc(d.message).replace(/\n/g, '<br>')}</p>`,
  });
  return { status: 200, body: { ok: true } };
}

export async function handleWaitlist(raw: Record<string, unknown>, deps: Deps): Promise<Result> {
  const locale = pickLocale(raw.locale);
  const t = useT(locale);
  if (typeof raw.company_website === 'string' && raw.company_website.trim() !== '')
    return { status: 200, body: { ok: true } };
  const parsed = waitlistSchema.safeParse(raw);
  if (!parsed.success)
    return {
      status: 422,
      body: { ok: false, errors: localized(locale, 'waitlist', fieldErrors(parsed.error)) },
    };
  const d = parsed.data;
  if (!(await deps.verifyTurnstile(d['cf-turnstile-response'])))
    return { status: 403, body: { ok: false, errors: { form: t.eco.error } } };
  const now = deps.now?.() ?? new Date();
  if ((await deps.countRecent('waitlist', new Date(now.getTime() - 60 * 60 * 1000))) >= RATE_LIMIT) {
    return { status: 429, body: { ok: false, errors: { form: t.eco.error } } };
  }
  const ins = await deps.insert('waitlist', {
    name: d.name,
    whatsapp: d.whatsapp,
    email: d.email.toLowerCase(),
    product: d.product,
    locale: d.locale,
    source_page: d.source_page ?? null,
    consent: true,
    ip_hash: deps.ipHash,
  });
  if (ins === 'error') return { status: 500, body: { ok: false, errors: { form: t.eco.error } } };
  // Email duplikat dianggap sukses (idempoten) dan tidak mengirim email ulang.
  if (ins === 'ok') {
    await deps.sendMail({
      to: d.email,
      subject:
        locale === 'id'
          ? 'Anda terdaftar di daftar tunggu Rafizaweb Academy'
          : 'You are on the Rafizaweb Academy waitlist',
      html: `<p>${esc(t.eco.done)}</p><p>Rafizaweb — ${esc(t.common.academyDesc)}</p>`,
    });
    await deps.sendMail({
      to: deps.mailTo,
      subject: `Waitlist ${d.product}: ${d.email}`,
      html: `<p><b>${esc(d.name)}</b> · ${esc(d.email)} · <a href="${esc(waLinkFor(d.whatsapp))}">${esc(d.whatsapp)}</a> (${esc(d.locale)}) dari ${esc(d.source_page ?? '-')}</p>`,
    });
  }
  return { status: 200, body: { ok: true } };
}
