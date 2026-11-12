import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { getArticles } from '../lib/data';

export const GET: APIRoute = async ({ site }) => {
  const articles = await getArticles();
  return rss({
    title: 'Blog Rafizaweb',
    description:
      'Panduan praktis seputar website untuk pemilik bisnis dari Rafizaweb, jasa pembuatan website di Bekasi.',
    site: site!,
    trailingSlash: true,
    customData: '<language>id-ID</language>',
    items: articles
      .filter((a) => !a.data.noindex)
      .map((a) => ({
        title: a.data.title,
        description: a.data.excerpt,
        link: `/${a.id}/`,
        pubDate: a.data.publishedAt,
        categories: [a.data.category.id],
      })),
  });
};
