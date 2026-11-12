import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import type { Locale } from '../i18n/routes';
import { ALLOW_DUMMY, settings } from './site';

export * from './site';

export async function getPortfolio() {
  const items = await getCollection('portfolio', (p) => ALLOW_DUMMY || !p.data.isDummy);
  return items.sort((a, b) => a.data.order - b.data.order);
}

/** Proyek yang punya tampilan (screenshot) untuk galeri & halaman studi kasus. Klien tanpa screenshot tetap muncul di daftar nama klien. */
export async function getPortfolioProjects() {
  return (await getPortfolio()).filter((p) => p.data.screenshotDesktop);
}

export async function getTestimonials() {
  if (!settings.reviewsEnabled) return [];
  const items = await getCollection('testimonials', (t) => ALLOW_DUMMY || !t.data.isDummy);
  return items.sort((a, b) => a.data.order - b.data.order);
}

export async function getFaq(scope: string, locale: Locale) {
  const items = await getCollection('faq', (f) => f.data.locale === locale && f.data.scope.includes(scope));
  return items.sort((a, b) => a.data.order - b.data.order).map((f) => f.data);
}

export async function getStoreProducts() {
  const items = await getCollection('storeProducts');
  return items.sort((a, b) => a.data.order - b.data.order);
}

export type Article = CollectionEntry<'articles'>;

export async function getArticles() {
  const items = await getCollection('articles', (a) => import.meta.env.DEV || !a.data.draft);
  return items.sort((a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf());
}

export async function getCategories() {
  return getCollection('categories');
}

export async function getCategory(id: string) {
  return getEntry('categories', id);
}
