import { readFileSync, readdirSync } from 'node:fs';
import cloudflare from '@astrojs/cloudflare';
import markdoc from '@astrojs/markdoc';
import node from '@astrojs/node';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import keystatic from '@keystatic/astro';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, envField } from 'astro/config';
import { LOCALES, ROUTES } from './src/i18n/routes';
import ogImages from './src/integrations/og-images';
import placeholderGuard from './src/integrations/placeholder-guard';

const isDev = process.argv.includes('dev');
const SITE = 'https://rafizaweb.com';
const hreflang: Record<string, string> = { id: 'id', en: 'en', ar: 'ar' };

/** Map path → padanan bahasa lain (untuk hreflang di sitemap). */
const alternatesByPath = new Map<string, { url: string; lang: string }[]>();
for (const r of Object.values(ROUTES)) {
  const links = LOCALES.filter((l) => r[l]).map((l) => ({ url: `${SITE}${r[l]}`, lang: hreflang[l]! }));
  if (links.length < 2) continue;
  for (const l of LOCALES) if (r[l]) alternatesByPath.set(r[l]!, links);
}

/**
 * Tanggal revisi konten terakhir untuk halaman non-artikel (layanan, harga, tentang, dst.).
 * PERBARUI nilai ini setiap kali isi halaman-halaman itu berubah; jangan diisi tanggal build otomatis,
 * karena lastmod yang tidak mencerminkan perubahan konten akan diabaikan mesin pencari.
 */
const CONTENT_UPDATED = '2026-11-12T00:00:00+07:00';

/** lastmod artikel dari frontmatter (updatedAt, atau publishedAt). Halaman lain tanpa tanggal asli tidak diberi lastmod. */
const lastmodByPath = new Map<string, string>();
const articlesDir = new URL('./src/content/articles/', import.meta.url);
for (const f of readdirSync(articlesDir).filter((n) => n.endsWith('.mdoc'))) {
  const head = readFileSync(new URL(f, articlesDir), 'utf8').split('---')[1] ?? '';
  const pick = (k: string) => head.match(new RegExp(`^${k}:\\s*"?([^"\\n]+)"?`, 'm'))?.[1]?.trim();
  const d = pick('updatedAt') || pick('publishedAt');
  const parsed = d ? new Date(`${d}+07:00`) : undefined;
  if (parsed && !Number.isNaN(parsed.getTime()))
    lastmodByPath.set(`/${f.replace(/\.mdoc$/, '')}/`, parsed.toISOString());
}

export default defineConfig({
  site: SITE,
  // 'ignore' (bukan 'always') karena API Keystatic dipanggil tanpa slash akhir. Semua URL publik
  // tetap ditulis dengan slash (link, canonical, sitemap) dan hosting me-redirect /x ke /x/. Lihat ADR-001.
  trailingSlash: 'ignore',
  build: { format: 'directory', inlineStylesheets: 'always' },
  // Dev memakai adapter Node karena Keystatic mode `local` butuh filesystem Node
  // (di runtime workerd handler lokalnya selalu 404). Build production memakai Cloudflare.
  adapter: isDev
    ? node({ mode: 'standalone' })
    : cloudflare({ prerenderEnvironment: 'node', imageService: 'compile' }),
  i18n: {
    defaultLocale: 'id',
    locales: ['id', 'en', 'ar'],
    routing: { prefixDefaultLocale: false, redirectToDefaultLocale: false },
  },
  integrations: [
    react(),
    markdoc(),
    keystatic(),
    sitemap({
      filter: (page) => !/\/(404|styleguide|keystatic|api)\//.test(page) && !page.endsWith('/404/'),
      serialize(item) {
        const p = new URL(item.url).pathname;
        // Artikel memakai tanggalnya sendiri; halaman lain memakai tanggal revisi konten terakhir.
        item.lastmod = lastmodByPath.get(p) ?? CONTENT_UPDATED;
        const links = alternatesByPath.get(p);
        if (links)
          item.links = [...links, { url: links.find((l) => l.lang === 'id')!.url, lang: 'x-default' }];
        return item;
      },
    }),
    ogImages(),
    placeholderGuard(),
  ],
  // Secret server (semua opsional agar dev berjalan tanpa kunci). Jangan pernah diberi awalan PUBLIC_.
  env: {
    schema: Object.fromEntries(
      [
        'SHEETS_WEBHOOK_URL',
        'SUPABASE_URL',
        'SUPABASE_SERVICE_ROLE_KEY',
        'TURNSTILE_SECRET_KEY',
        'RESEND_API_KEY',
        'IP_HASH_SALT',
        'MAIL_FROM',
        'MAIL_TO',
        'KEYSTATIC_GITHUB_CLIENT_ID',
        'KEYSTATIC_GITHUB_CLIENT_SECRET',
        'KEYSTATIC_SECRET',
      ].map((k) => [k, envField.string({ context: 'server', access: 'secret', optional: true })]),
    ),
  },
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
  devToolbar: { enabled: false },
  image: { responsiveStyles: false },
  vite: { plugins: [tailwindcss()] },
});
