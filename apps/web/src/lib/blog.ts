import { getArticles, getCategories } from './data';

export const PER_PAGE = 9;

export async function blogData() {
  const articles = await getArticles();
  const cats = (await getCategories())
    .map((c) => ({ id: c.id, name: c.data.name, description: c.data.description }))
    .filter((c) => articles.some((a) => a.data.category.id === c.id));
  return { articles, cats };
}

export function pageSlice<T>(items: T[], page: number) {
  return items.slice((page - 1) * PER_PAGE, page * PER_PAGE);
}
