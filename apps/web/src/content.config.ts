import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Semua koleksi membaca file yang sama dengan yang ditulis Keystatic (keystatic.config.ts).
 * Skema di sini adalah validasi build; jika data CMS tidak valid, build gagal.
 */

/** Datetime Keystatic ("2026-04-03T21:29") tanpa zona waktu ditafsirkan sebagai WIB (+07:00). */
const wibDate = z.preprocess(
  (v) => (typeof v === 'string' && /T\d\d:\d\d(:\d\d)?$/.test(v) ? `${v}+07:00` : v),
  z.coerce.date(),
);

const industry = z.enum(['pendidikan', 'perusahaan', 'produk', 'retail', 'lainnya']);
const tint = z.enum(['brand', 'surface', 'amber']);

const articles = defineCollection({
  loader: glob({ pattern: '**/*.mdoc', base: './src/content/articles' }),
  schema: ({ image }) =>
    z.object({
      title: z.string().min(1),
      excerpt: z.string().max(160),
      cover: image().optional().nullable(),
      coverAlt: z.string().optional().default(''),
      category: reference('categories'),
      tags: z.array(z.string()).default([]),
      author: reference('authors'),
      publishedAt: wibDate,
      updatedAt: wibDate.optional().nullable(),
      draft: z.boolean().default(false),
      keyTakeaways: z.array(z.string()).default([]),
      faq: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
      relatedService: z.enum(['', 'lp', 'cp', 'toko', 'app', 'seo']).default(''),
      seoTitle: z.string().optional().default(''),
      seoDescription: z.string().optional().default(''),
      noindex: z.boolean().default(false),
      illustration: z.enum(['auto', 'checklist', 'shield', 'versus', 'chart', 'browser']).default('auto'),
    }),
});

const categories = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/categories' }),
  schema: z.object({ name: z.string(), description: z.string().default('') }),
});

const authors = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/authors' }),
  schema: z.object({
    name: z.string(),
    role: z.string().default(''),
    photo: z.string().default(''),
    bio: z.string().default(''),
    sameAs: z.array(z.string()).default([]),
  }),
});

const portfolio = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/portfolio' }),
  schema: z.object({
    name: z.string(),
    industry,
    domain: z.string(),
    url: z.string().default(''),
    year: z.string().default(''),
    package: z.string().default(''),
    showInMarquee: z.boolean().default(true),
    order: z.number().default(99),
    tint: tint.default('brand'),
    screenshotDesktop: z.string().default(''),
    screenshotMobile: z.string().default(''),
    /** Ringkasan dan isi website (fakta yang terlihat di situs publik klien), per bahasa. */
    summary: z
      .object({ id: z.string().default(''), en: z.string().default(''), ar: z.string().default('') })
      .default({ id: '', en: '', ar: '' }),
    highlights: z
      .object({
        id: z.array(z.string()).default([]),
        en: z.array(z.string()).default([]),
        ar: z.array(z.string()).default([]),
      })
      .default({ id: [], en: [], ar: [] }),
    challenge: z.string().default(''),
    solution: z.string().default(''),
    result: z.string().default(''),
    testimonial: z.string().default(''),
    isDummy: z.boolean().default(false),
  }),
});

const testimonials = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/testimonials' }),
  schema: z.object({
    name: z.string(),
    industry,
    quote: z.string(),
    quoteEn: z.string().default(''),
    quoteAr: z.string().default(''),
    rating: z.number().min(1).max(5),
    source: z.enum(['google', 'whatsapp', 'lainnya']),
    sourceUrl: z.string().default(''),
    date: z.string().default(''),
    initial: z.string().max(2),
    tint: tint.default('brand'),
    order: z.number().default(99),
    isDummy: z.boolean().default(false),
  }),
});

const faq = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/faq' }),
  schema: z.object({
    question: z.string(),
    answer: z.string(),
    scope: z.array(z.string()).default(['home']),
    order: z.number().default(99),
    locale: z.enum(['id', 'en', 'ar']).default('id'),
  }),
});

const storeProducts = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/storeProducts' }),
  schema: z.object({
    name: z.string(),
    price: z.string(),
    image: z.string().default(''),
    url: z.string(),
    order: z.number().default(99),
  }),
});

export const collections = { articles, categories, authors, portfolio, testimonials, faq, storeProducts };
