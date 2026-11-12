/**
 * pnpm check:placeholders — PRD §14.
 * Memindai src/content, src/i18n, dan dist/client (jika ada) untuk:
 *   - placeholder  [KURUNG SIKU]     (pola \[[A-Z][^\]]*\])
 *   - data dummy   "isDummy": true, "ratingIsDummy": true, data-dummy
 *   - belum terverifikasi  "liveSitesVerified": false, "replyPromiseVerified": false, "gbpUrlIsPlaceholder": true
 *   - terjemahan Arab belum direview  [REVIEW AR], "arReviewed": false
 * Gagal (exit 1) bila ada temuan, kecuali ALLOW_DUMMY=true.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const WEB = path.join(ROOT, 'apps/web');
const TARGETS = [
  { dir: path.join(WEB, 'src/content'), label: 'konten (CMS)' },
  { dir: path.join(WEB, 'src/i18n'), label: 'i18n' },
  { dir: path.join(WEB, 'dist/client'), label: 'hasil build', exts: ['.html', '.txt', '.xml'] },
];
const RULES: { name: string; re: RegExp }[] = [
  { name: 'placeholder', re: /(?<![!$])\[[A-Z][^\]\n$]{0,80}\](?!\()/g },
  { name: 'dummy', re: /"isDummy":\s*true|"ratingIsDummy":\s*true|data-dummy/g },
  {
    name: 'belum-verifikasi',
    re: /"(liveSitesVerified|replyPromiseVerified)":\s*false|"gbpUrlIsPlaceholder":\s*true/g,
  },
  { name: 'review-ar', re: /\[REVIEW AR\]|"arReviewed":\s*false|AR_REVIEWED = false/g },
];

function* walk(dir: string, exts?: string[]): Generator<string> {
  for (const name of readdirSync(dir)) {
    const p = path.join(dir, name);
    if (statSync(p).isDirectory()) yield* walk(p, exts);
    else if (!exts || exts.some((e) => p.endsWith(e))) yield p;
  }
}

const counts: Record<string, number> = {};
const lines: string[] = [];
for (const t of TARGETS) {
  if (!existsSync(t.dir)) continue;
  for (const file of walk(t.dir, t.exts ?? ['.json', '.yaml', '.mdoc', '.ts', '.md'])) {
    let text = readFileSync(file, 'utf8');
    if (file.endsWith('.html'))
      text = text.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '');
    for (const r of RULES) {
      const hits = [...new Set(text.match(r.re) ?? [])];
      if (!hits.length) continue;
      counts[r.name] = (counts[r.name] ?? 0) + 1;
      lines.push(`  [${t.label}] ${path.relative(ROOT, file)} — ${r.name}: ${hits.slice(0, 5).join(', ')}`);
    }
  }
}

if (!lines.length) {
  console.log('✓ Tidak ada placeholder, data dummy, atau teks Arab yang belum direview.');
  process.exit(0);
}
console.log(`Ditemukan ${lines.length} temuan:\n${lines.join('\n')}\n`);
console.log('Ringkasan per jenis (jumlah file):', counts);
console.log('Lengkapi data sesuai PRD §14 (P1–P16), lalu jalankan lagi.');
if (process.env.ALLOW_DUMMY === 'true') {
  console.log('ALLOW_DUMMY=true → tidak gagal (mode preview).');
  process.exit(0);
}
process.exit(1);
