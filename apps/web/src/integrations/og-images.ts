/**
 * Integration: generate OG image 1200×630 (judul + brand, font Sora) untuk setiap halaman hasil build (PRD §9.1).
 * Sumber kebenaran = HTML hasil build: membaca <meta property="og:image"> dan og:title tiap halaman,
 * lalu merender PNG ke path tersebut. Juga membuat og/default.png. Logo, favicon, dan apple-touch-icon adalah berkas statis di public/.
 */
import { Resvg } from '@resvg/resvg-js';
import type { AstroIntegration } from 'astro';
import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import satori from 'satori';

const require = createRequire(import.meta.url);
const font = (p: string) => readFile(require.resolve(p));

type El = { type: string; props: Record<string, unknown> };

// Logo resmi (teks gelap) sebagai data URI untuk kartu OG. Berkas: src/assets/brand/logo-lockup.png.
const lockupSrc = `data:image/png;base64,${(
  await readFile(new URL('../assets/brand/logo-lockup.png', import.meta.url))
).toString('base64')}`;
const h = (type: string, style: Record<string, unknown>, children?: unknown): El => ({
  type,
  props: { style, children },
});

function card(title: string, eyebrow: string): El {
  const size = title.length > 70 ? 54 : title.length > 45 ? 62 : 72;
  return h(
    'div',
    {
      width: 1200,
      height: 630,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '64px 72px',
      backgroundColor: '#F5F8FF',
      backgroundImage: 'radial-gradient(700px 500px at 88% 30%, rgba(29,78,216,0.22), transparent 70%)',
      fontFamily: 'Plus Jakarta Sans',
      color: '#0B1A2E',
    },
    [
      h('div', { display: 'flex', alignItems: 'center' }, [
        { type: 'img', props: { src: lockupSrc, width: 330, height: 70, style: { width: 330, height: 70 } } },
      ]),
      h('div', { display: 'flex', flexDirection: 'column', gap: 20 }, [
        h(
          'div',
          {
            display: 'flex',
            alignSelf: 'flex-start',
            padding: '8px 20px',
            borderRadius: 999,
            backgroundColor: '#E6EDFD',
            color: '#1D4ED8',
            fontSize: 26,
            fontWeight: 600,
          },
          eyebrow,
        ),
        h(
          'div',
          {
            fontFamily: 'Sora',
            fontWeight: 800,
            fontSize: size,
            lineHeight: 1.1,
            letterSpacing: -2,
            maxWidth: 1050,
          },
          title,
        ),
      ]),
      h(
        'div',
        {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 26,
          fontWeight: 600,
          color: '#3F4D5E',
        },
        [
          h('div', {}, 'rafizaweb.com'),
          h(
            'div',
            {
              display: 'flex',
              padding: '12px 28px',
              borderRadius: 999,
              backgroundColor: '#1D4ED8',
              color: '#FFFFFF',
            },
            'Konsultasi gratis via WhatsApp',
          ),
        ],
      ),
    ],
  );
}

const decode = (s: string) =>
  s
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');

async function walk(dir: string): Promise<string[]> {
  const out: string[] = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

export default function ogImages(): AstroIntegration {
  return {
    name: 'rz-og-images',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const root = fileURLToPath(dir);
        const fonts = [
          {
            name: 'Sora',
            data: await font('@fontsource/sora/files/sora-latin-800-normal.woff'),
            weight: 800 as const,
            style: 'normal' as const,
          },
          {
            name: 'Plus Jakarta Sans',
            data: await font('@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-600-normal.woff'),
            weight: 600 as const,
            style: 'normal' as const,
          },
        ];
        const render = async (el: El, width = 1200, height = 630) => {
          const svg = await satori(el as never, { width, height, fonts });
          return new Resvg(svg, { fitTo: { mode: 'width', value: width } }).render().asPng();
        };
        const write = async (rel: string, png: Uint8Array) => {
          const file = path.join(root, rel);
          await mkdir(path.dirname(file), { recursive: true });
          await writeFile(file, png);
        };
        let count = 0;
        const seen = new Set<string>();
        for (const file of await walk(root)) {
          const html = await readFile(file, 'utf8');
          const img = /<meta property="og:image" content="https?:\/\/[^/]+(\/og\/[^"]+\.png)"/.exec(
            html,
          )?.[1];
          if (!img || seen.has(img)) continue;
          seen.add(img);
          const isAr = /<html[^>]*lang="ar"/.test(html);
          const rawTitle = decode(
            /<meta property="og:title" content="([^"]*)"/.exec(html)?.[1] ?? 'Rafizaweb',
          );
          // Satori belum mendukung shaping Arab dengan baik → halaman /ar/ memakai judul brand.
          const title = isAr
            ? 'Rafizaweb — Website Design in Bekasi'
            : rawTitle.replace(/\s*\|\s*Rafizaweb\s*$/, '');
          const eyebrow =
            /\/og\/(?!en\/|ar\/)[^/]+\.png$/.test(img) &&
            !/<html[^>]*lang="(en|ar)"/.test(html) &&
            /og:type" content="article"/.test(html)
              ? 'Blog Rafizaweb'
              : 'Solusi Digital Terpercaya';
          await write(img.slice(1), await render(card(title, eyebrow)));
          count++;
        }
        await write(
          'og/default.png',
          await render(card('Jasa Pembuatan Website Bekasi Mulai Rp699rb', 'Solusi Digital Terpercaya')),
        );
        logger.info(`${count} OG image dibuat`);
      },
    },
  };
}
