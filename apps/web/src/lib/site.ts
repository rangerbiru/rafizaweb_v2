/** Data situs murni (tanpa astro:content) agar bisa dipakai di test unit dan modul server. */
import type { Locale } from '../i18n/routes';
import plansJson from '../content/plans.json';
import processJson from '../content/process.json';
import servicesJson from '../content/services.json';
import settingsJson from '../content/settings.json';

/** true bila data dummy/placeholder boleh tayang (dev, atau preview dengan ALLOW_DUMMY=true). */
export const ALLOW_DUMMY = import.meta.env.DEV || process.env.ALLOW_DUMMY === 'true';

export type Settings = typeof settingsJson;
export const settings: Settings = settingsJson;

type L10n<T> = { id: T; en: T; ar: T };
type ServiceText = {
  name: string;
  tagline: string;
  priceShort: string;
  price: string;
  desc: string;
  points: string[];
  problems: string[];
};
export type ServiceRaw = (typeof servicesJson.items)[number] & L10n<ServiceText>;
export type Service = Omit<ServiceRaw, 'id' | 'en' | 'ar'> & ServiceText;

export function getServices(locale: Locale): Service[] {
  return (servicesJson.items as ServiceRaw[]).map((s) => {
    const { id, en, ar, ...rest } = s;
    const text = { id, en, ar }[locale];
    return { ...rest, ...text };
  });
}
export const getService = (key: string, locale: Locale) => getServices(locale).find((s) => s.key === key);

export type PlanSpec = {
  domain: string;
  pages: string;
  articles: string;
  seo: string;
  email: string;
  contact: string;
  responsive: string;
  revisions: string;
  time: string;
  support: string;
};
type PlanText = { name: string; desc: string; time: string; spec?: PlanSpec; features: string[] };
type PlanRaw = {
  key: string;
  /** null = harga lewat konsultasi gratis (Toko Online, Aplikasi Web & Mobile). */
  price: number | null;
  renewal: number | null;
  custom: boolean;
  id: PlanText;
  en: PlanText;
  ar: PlanText;
};
export type Plan = Omit<PlanRaw, 'id' | 'en' | 'ar'> & PlanText;
/** Paket berharga tetap: untuk tabel perbandingan, JSON-LD Offer, dan llms.txt. */
export type PricedPlan = Plan & { price: number; renewal: number; spec: PlanSpec };
export type Stage = { key: string; plan: string; label: string };

export function getPlans(locale: Locale): Plan[] {
  return (plansJson.plans as PlanRaw[]).map((p) => {
    const { id, en, ar, ...rest } = p;
    return { ...rest, ...{ id, en, ar }[locale] };
  });
}
/** Paket yang tampil sebagai kartu di Home; sisanya (Prime) tampil sebagai strip. */
export const PRIME_PLAN = 'prime';
export const getPricedPlans = (locale: Locale) =>
  getPlans(locale).filter((p): p is PricedPlan => p.price !== null);
export function getStages(locale: Locale): Stage[] {
  return plansJson.stages.map((s) => ({ key: s.key, plan: s.plan, label: s[locale] }));
}
export const defaultStage = plansJson.defaultStage;
export const recommendedPlan =
  plansJson.stages.find((s) => s.key === plansJson.defaultStage)?.plan ?? 'starter';

export function getProcess(locale: Locale) {
  return processJson.steps.map((s, i) => ({ n: i + 1, day: s.day, ...s[locale] }));
}

/** Pola placeholder sesuai PRD §14. */
export const PLACEHOLDER_RE = /\[[A-Z][^\]]*\]/;
export const isPlaceholder = (v: unknown) => typeof v === 'string' && (v === '' || PLACEHOLDER_RE.test(v));

/** Tint thumbnail/avatar (desain: #E6EDFD, #F5F8FF, rgba(245,184,61,.2)). */
export const TINT: Record<string, string> = {
  brand: 'var(--color-brand-50)',
  surface: 'var(--color-surface)',
  amber: 'rgba(245, 184, 61, 0.2)',
};

/** Estimasi waktu baca (menit) dari teks mentah. */
export function readingTime(body: string | undefined): number {
  const words = (body ?? '').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
