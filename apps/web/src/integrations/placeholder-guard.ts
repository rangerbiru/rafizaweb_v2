/**
 * Integration: setelah build, pindai HTML untuk placeholder [KURUNG SIKU], data-dummy, dan [REVIEW AR].
 * Build production GAGAL jika ditemukan, kecuali ALLOW_DUMMY=true (preview). Lihat PRD §14 dan CLAUDE.md aturan 2.
 */
import type { AstroIntegration } from 'astro';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const PATTERNS = [
  { name: 'placeholder', re: /\[[A-Z][^\]\n<]{0,80}\](?!\()/g },
  { name: 'dummy', re: /data-dummy/g },
  { name: 'placeholder-attr', re: /data-placeholder/g },
];

async function walk(dir: string): Promise<string[]> {
  const out: string[] = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else if (/\.(html|txt|xml)$/.test(e.name)) out.push(p);
  }
  return out;
}

export default function placeholderGuard(): AstroIntegration {
  return {
    name: 'rz-placeholder-guard',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const root = fileURLToPath(dir);
        const hits: string[] = [];
        for (const file of await walk(root)) {
          const text = (await readFile(file, 'utf8')).replace(
            /<script type="application\/ld\+json">[\s\S]*?<\/script>/g,
            '',
          );
          for (const p of PATTERNS) {
            const m = text.match(p.re);
            if (m)
              hits.push(`${path.relative(root, file)}: ${p.name} ${[...new Set(m)].slice(0, 4).join(', ')}`);
          }
        }
        if (!hits.length) return logger.info('Tidak ada placeholder/dummy di hasil build.');
        const allow = process.env.ALLOW_DUMMY === 'true';
        const msg = `${hits.length} file berisi placeholder/dummy:\n  ${hits.slice(0, 30).join('\n  ')}`;
        if (allow) logger.warn(`${msg}\n(ALLOW_DUMMY=true → build preview diizinkan)`);
        else
          throw new Error(
            `${msg}\nLengkapi data (PRD §14) atau jalankan dengan ALLOW_DUMMY=true untuk preview.`,
          );
      },
    },
  };
}
