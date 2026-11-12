/**
 * Impor artikel WordPress rafizaweb.com ke Keystatic (Markdoc).
 *
 *   pnpm import:wp            # impor semua post (lewati yang sudah ada)
 *   pnpm import:wp --force    # timpa file yang sudah ada
 *
 * - Sumber: WP REST API /wp-json/wp/v2/posts?per_page=100&_embed=1
 * - Output: apps/web/src/content/articles/{slug}.mdoc
 * - Gambar: diunduh ke apps/web/src/assets/blog/{slug}/ (dioptimasi oleh astro:assets saat build)
 * - Slug, tanggal terbit/diperbarui, kategori, excerpt, dan meta Yoast dipertahankan.
 */
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import TurndownService from 'turndown';
// @ts-expect-error -- paket tanpa type definitions
import { gfm } from 'turndown-plugin-gfm';

const WP = process.env.WP_URL ?? 'https://rafizaweb.com';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const WEB = path.join(ROOT, 'apps/web');
const ARTICLES = path.join(WEB, 'src/content/articles');
const ASSETS = path.join(WEB, 'src/assets/blog');
const FORCE = process.argv.includes('--force');
const UA = 'Mozilla/5.0 (compatible; rafizaweb-migration/1.0)';

/** Excerpt yang sudah dikurasi di docs/CONTENT.md §10 (dipakai bila ada). */
const CURATED_EXCERPT: Record<string, string> = {
  '10-fitur-website-travel-umroh-yang-wajib-ada':
    'Bisnis travel umroh itu unik. Anda tidak sekadar menjual paket perjalanan, tapi menjual kepercayaan calon jamaah.',
  'cara-membangun-kepercayaan-jamaah-dengan-website-travel-umroh':
    'Travel umroh menjual harapan dan kepercayaan. Begini website membantu calon jamaah merasa yakin.',
  'website-wordpress-vs-media-sosial-mana-yang-lebih-menguntungkan-untuk-umkm':
    'Akun media sosial bisnis tiba-tiba sepi, padahal kontennya sama bagusnya? Ini alasannya.',
};
const ILLUSTRATION: Record<string, string> = {
  '10-fitur-website-travel-umroh-yang-wajib-ada': 'checklist',
  'cara-membangun-kepercayaan-jamaah-dengan-website-travel-umroh': 'shield',
  'website-wordpress-vs-media-sosial-mana-yang-lebih-menguntungkan-untuk-umkm': 'versus',
};
/** Deskripsi Yoast bawaan situs (bukan deskripsi artikel), diabaikan. */
const GENERIC_DESC = 'Jasa pembuatan website profesional di bekasi';

type WPPost = {
  slug: string;
  date: string;
  modified: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  content: { rendered: string };
  categories: number[];
  tags: number[];
  yoast_head_json?: { title?: string; description?: string };
  _embedded?: {
    'wp:featuredmedia'?: { source_url: string; alt_text?: string }[];
    'wp:term'?: { id: number; slug: string; name: string; taxonomy: string }[][];
  };
};

const decode = (s: string) =>
  s
    .replace(/<[^>]+>/g, '')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&#8216;|&#8217;/g, '’')
    .replace(/&#8220;|&#8221;/g, '"')
    .replace(/&#8230;|\[&hellip;\]|&hellip;/g, '…')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;|&#038;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();

/** Potong di batas kalimat/kata agar ≤ max karakter. */
function clip(text: string, max = 160): string {
  if (text.length <= max) return text;
  const sentences = text.match(/[^.!?]+[.!?]+/g) ?? [];
  let out = '';
  for (const s of sentences) {
    if ((out + s).trim().length > max) break;
    out += s;
  }
  if (out.trim().length >= 60) return out.trim();
  const cut = text.slice(0, max - 1);
  return cut.slice(0, cut.lastIndexOf(' ')).trim() + '…';
}

const yamlStr = (s: string) => JSON.stringify(s);

async function download(url: string, dir: string): Promise<string | null> {
  try {
    const res = await fetch(url, { headers: { 'user-agent': UA } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    const base = path
      .basename(new URL(url).pathname)
      .replace(/[^a-zA-Z0-9._-]/g, '-')
      .toLowerCase();
    const name =
      base.length > 60
        ? createHash('sha1').update(base).digest('hex').slice(0, 10) + path.extname(base)
        : base;
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, name), buf);
    return name;
  } catch (err) {
    console.warn(`  ! gagal unduh ${url}: ${(err as Error).message}`);
    return null;
  }
}

function makeTurndown() {
  const td = new TurndownService({
    headingStyle: 'atx',
    bulletListMarker: '-',
    codeBlockStyle: 'fenced',
    emDelimiter: '_',
  });
  td.use(gfm);
  // Buang wrapper kosong dan atribut sisa editor AI (qwen-markdown-*).
  td.remove(['script', 'style', 'iframe', 'noscript']);
  td.addRule('strongInHeading', {
    filter: (node) => node.nodeName === 'STRONG' && /^H[1-6]$/.test(node.parentNode?.nodeName ?? ''),
    replacement: (content) => content,
  });
  return td;
}

async function main() {
  console.log(`Mengambil post dari ${WP} …`);
  const res = await fetch(`${WP}/wp-json/wp/v2/posts?per_page=100&_embed=1`, {
    headers: { 'user-agent': UA },
  });
  if (!res.ok) throw new Error(`WP API ${res.status}`);
  const posts = (await res.json()) as WPPost[];
  await mkdir(ARTICLES, { recursive: true });
  const td = makeTurndown();
  const summary: { slug: string; status: string; images: number }[] = [];

  for (const post of posts) {
    const slug = post.slug;
    const file = path.join(ARTICLES, `${slug}.mdoc`);
    if (existsSync(file) && !FORCE) {
      summary.push({ slug, status: 'dilewati (sudah ada)', images: 0 });
      continue;
    }
    console.log(`- ${slug}`);
    const assetDir = path.join(ASSETS, slug);
    let html = post.content.rendered;

    // Unduh gambar di body dan ganti src ke path relatif aset.
    let imageCount = 0;
    const imgs = [...html.matchAll(/<img[^>]*?src="([^"]+)"[^>]*>/g)];
    for (const m of imgs) {
      const src = m[1]!;
      const alt = decode(/alt="([^"]*)"/.exec(m[0])?.[1] ?? '');
      const name = await download(src, assetDir);
      if (name) {
        imageCount++;
        html = html.replace(
          m[0],
          `<img src="../../assets/blog/${slug}/${name}" alt="${alt.replace(/"/g, '')}">`,
        );
      } else {
        html = html.replace(m[0], '');
      }
    }
    // Bersihkan div kosong dan atribut kelas.
    html = html.replace(/<div[^>]*>\s*<\/div>/g, '').replace(/ (class|data-[a-z-]+|id)="[^"]*"/g, '');

    let body = td
      .turndown(html)
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    // Turndown meng-escape karakter Markdown; Markdoc butuh escape untuk { } juga.
    body = body.replace(/\{%/g, '\\{%');
    // Escape "1\." di dalam heading tidak perlu (bukan awal list).
    body = body.replace(/^(#{1,6} \d+)\\\./gm, '$1.').replace(/^(\s*)-\s{2,}/gm, '$1- ');

    const terms = post._embedded?.['wp:term']?.flat() ?? [];
    const cats = post.categories
      .map((id) => terms.find((t) => t.id === id && t.taxonomy === 'category')?.slug)
      .filter((s): s is string => !!s);
    const category = cats[0] ?? 'website';
    const tags = post.tags
      .map((id) => terms.find((t) => t.id === id && t.taxonomy === 'post_tag')?.name)
      .filter((s): s is string => !!s);

    let cover = '';
    let coverAlt = '';
    const media = post._embedded?.['wp:featuredmedia']?.[0];
    if (media?.source_url) {
      const name = await download(media.source_url, assetDir);
      if (name) {
        cover = `../../assets/blog/${slug}/${name}`;
        coverAlt = decode(media.alt_text ?? '') || decode(post.title.rendered);
      }
    }

    const title = decode(post.title.rendered);
    const excerpt = CURATED_EXCERPT[slug] ?? clip(decode(post.excerpt.rendered));
    const yTitle = (post.yoast_head_json?.title ?? '').replace(/\s+-\s+Rafizaweb.*$/i, '').trim();
    const yDesc = post.yoast_head_json?.description ?? '';
    const seoTitle = yTitle && yTitle !== title ? yTitle : '';
    const seoDescription = yDesc && !yDesc.startsWith(GENERIC_DESC) ? clip(yDesc, 160) : '';

    const fm = [
      '---',
      `title: ${yamlStr(title)}`,
      `excerpt: ${yamlStr(excerpt)}`,
      cover ? `cover: ${cover}` : null,
      cover ? `coverAlt: ${yamlStr(coverAlt)}` : null,
      `category: ${category}`,
      tags.length ? `tags:\n${tags.map((t) => `  - ${yamlStr(t)}`).join('\n')}` : null,
      'author: arrafi-septiawan',
      // Waktu lokal WordPress (WIB). Skema konten menafsirkan datetime tanpa zona sebagai +07:00.
      `publishedAt: ${yamlStr(post.date.slice(0, 16))}`,
      post.modified.slice(0, 10) !== post.date.slice(0, 10)
        ? `updatedAt: ${yamlStr(post.modified.slice(0, 16))}`
        : null,
      'draft: false',
      'keyTakeaways: []',
      'faq: []',
      "relatedService: ''",
      seoTitle ? `seoTitle: ${yamlStr(seoTitle)}` : null,
      seoDescription ? `seoDescription: ${yamlStr(seoDescription)}` : null,
      'noindex: false',
      `illustration: ${ILLUSTRATION[slug] ?? 'auto'}`,
      '---',
    ]
      .filter((l) => l !== null)
      .join('\n');

    await writeFile(file, `${fm}\n\n${body}\n`);
    summary.push({ slug, status: 'diimpor', images: imageCount + (cover ? 1 : 0) });
  }

  console.log('\nRingkasan impor:');
  for (const s of summary) console.log(`  ${s.status.padEnd(22)} ${s.images} gambar  /${s.slug}/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
