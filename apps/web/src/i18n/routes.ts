import services from '../content/services.json';

export const LOCALES = ['id', 'en', 'ar'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'id';

/** Kunci halaman yang punya padanan antarbahasa. */
export type RouteKey =
  | 'home'
  | 'services'
  | `service:${string}`
  | 'pricing'
  | 'about'
  | 'contact'
  | 'privacy'
  | 'terms'
  | 'portfolio'
  | `project:${string}`
  | 'blog'
  | 'notFound';

const base: Record<string, Partial<Record<Locale, string>>> = {
  home: { id: '/', en: '/en/', ar: '/ar/' },
  services: { id: '/layanan/', en: '/en/services/', ar: '/ar/services/' },
  pricing: { id: '/harga/', en: '/en/pricing/', ar: '/ar/pricing/' },
  about: { id: '/tentang/', en: '/en/about/', ar: '/ar/about/' },
  contact: { id: '/kontak/', en: '/en/contact/', ar: '/ar/contact/' },
  privacy: { id: '/kebijakan-privasi/', en: '/en/privacy-policy/', ar: '/ar/privacy-policy/' },
  terms: { id: '/syarat-ketentuan/', en: '/en/terms/', ar: '/ar/terms/' },
  // Daftar portofolio dan blog tersedia di 3 bahasa (UI diterjemahkan); isi artikel tetap Bahasa Indonesia.
  portfolio: { id: '/portofolio/', en: '/en/portfolio/', ar: '/ar/portfolio/' },
  blog: { id: '/blog/', en: '/en/blog/', ar: '/ar/blog/' },
  notFound: { id: '/404/', en: '/en/404/', ar: '/ar/404/' },
};

for (const s of services.items) {
  if (!s.slug) continue;
  base[`service:${s.key}`] = {
    id: `/layanan/${s.slug}/`,
    en: `/en/services/${s.slugEn}/`,
    ar: `/ar/services/${s.slugEn}/`,
  };
}

export const ROUTES = base;

/** Path untuk kunci halaman di locale tertentu. Jika tidak ada padanan, kembali ke versi ID. */
const projectPaths = (slug: string): Partial<Record<Locale, string>> => ({
  id: `/portofolio/${slug}/`,
  en: `/en/portfolio/${slug}/`,
  ar: `/ar/portfolio/${slug}/`,
});
const routeOf = (key: string) => (key.startsWith('project:') ? projectPaths(key.slice(8)) : ROUTES[key]);

export function path(key: RouteKey, locale: Locale = 'id'): string {
  const r = routeOf(key);
  if (!r) throw new Error(`Route tidak dikenal: ${key}`);
  return r[locale] ?? r.id ?? '/';
}

/** Apakah halaman punya versi di locale tsb (untuk hreflang dan pemilih bahasa). */
export function hasLocale(key: RouteKey, locale: Locale): boolean {
  return !!routeOf(key)?.[locale];
}

/** Padanan URL di locale lain; jika tidak ada → home locale tsb. */
export function alternate(key: RouteKey | undefined, to: Locale): string {
  if (key && hasLocale(key, to)) return path(key, to);
  return path('home', to);
}
