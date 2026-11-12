import ar from './ar';
import en from './en';
import id, { type Dict } from './id';
import type { Locale } from './routes';

export * from './routes';
export type { Dict };

const dicts: Record<Locale, Dict> = { id, en, ar };

export function useT(locale: Locale): Dict {
  return dicts[locale];
}

export const dirOf = (locale: Locale) => (locale === 'ar' ? 'rtl' : 'ltr');

const intlLocale: Record<Locale, string> = { id: 'id-ID', en: 'en-US', ar: 'ar' };

/** Tanggal "4 April 2026" (ID), "April 4, 2026" (EN), dst. */
export function formatDate(date: Date, locale: Locale = 'id'): string {
  return new Intl.DateTimeFormat(intlLocale[locale], {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
    numberingSystem: 'latn',
  }).format(date);
}

/** Rp699.000 (ID), Rp699,000 (EN), 699,000 روبية (AR, sesuai desain). */
export function formatPrice(value: number, locale: Locale = 'id'): string {
  if (locale === 'id') return `Rp${new Intl.NumberFormat('id-ID').format(value)}`;
  const n = new Intl.NumberFormat('en-US').format(value);
  return locale === 'ar' ? `${n} روبية` : `Rp${n}`;
}
