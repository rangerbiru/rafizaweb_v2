/** Skema validasi bersama untuk client dan server (PRD §10). */
import { z } from 'zod';

export const SERVICES = [
  'landing-page',
  'company-profile',
  'toko-online',
  'aplikasi',
  'seo-geo',
  'lainnya',
] as const;
export const LOCALES = ['id', 'en', 'ar'] as const;
const bool = z.preprocess((v) => v === true || v === 'true' || v === 'on' || v === '1', z.boolean());
const opt = (s: z.ZodString) =>
  z.preprocess((v) => (typeof v === 'string' && v.trim() === '' ? undefined : v), s.optional());

export const contactSchema = z
  .object({
    name: z.string().trim().min(2, 'name').max(100, 'name'),
    whatsapp: z
      .string()
      .trim()
      .regex(/^\+?[0-9 -]{8,20}$/, 'whatsapp'),
    email: opt(
      z
        .string()
        .trim()
        .regex(/^[^@\s]+@[^@\s]+\.[^@\s]+$/, 'email')
        .max(200),
    ),
    service: z.enum(SERVICES).optional().catch(undefined),
    budget: opt(z.string().trim().max(50)),
    message: z.string().trim().min(10, 'message').max(4000, 'message'),
    consent: bool.refine((v) => v, 'consent'),
    locale: z.enum(LOCALES).catch('id'),
    source_page: opt(z.string().max(300)),
    utm: z.record(z.string(), z.string()).optional().catch(undefined),
    company_website: z.string().optional(),
    'cf-turnstile-response': z.string().optional(),
  })
  .passthrough();

export const waitlistSchema = z
  .object({
    name: z.string().trim().min(2, 'name').max(100, 'name'),
    whatsapp: z
      .string()
      .trim()
      .regex(/^\+?[0-9 -]{8,20}$/, 'whatsapp'),
    email: z
      .string()
      .trim()
      .regex(/^[^@\s]+@[^@\s]+\.[^@\s]+$/, 'email')
      .max(200, 'email'),
    consent: bool.refine((v) => v, 'consent'),
    product: z.string().trim().max(40).catch('academy').default('academy'),
    locale: z.enum(LOCALES).catch('id'),
    source_page: opt(z.string().max(300)),
    company_website: z.string().optional(),
    'cf-turnstile-response': z.string().optional(),
  })
  .passthrough();

export type ContactInput = z.infer<typeof contactSchema>;
export type WaitlistInput = z.infer<typeof waitlistSchema>;

/** Ubah error Zod menjadi { field: kodeField } (kode diterjemahkan oleh pemanggil). */
export function fieldErrors(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = String(issue.path[0] ?? 'form');
    if (!out[key]) out[key] = key;
  }
  return out;
}
