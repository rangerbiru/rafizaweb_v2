/** Sesuaikan meta description ke rentang 140–160 karakter tanpa menambah klaim baru. */
const SUFFIXES = [
  ' Baca panduan lengkapnya di blog Rafizaweb, jasa pembuatan website di Bekasi.',
  ' Panduan dari Rafizaweb, jasa pembuatan website di Bekasi.',
  ' Baca selengkapnya di blog Rafizaweb.',
];

export function fitDescription(text: string, min = 140, max = 160): string {
  const t = text.trim();
  if (t.length > max) return `${t.slice(0, max - 1).replace(/\s+\S*$/, '')}…`;
  if (t.length >= min) return t;
  for (const s of SUFFIXES) if ((t + s).length >= min && (t + s).length <= max) return t + s;
  const best = SUFFIXES.find((s) => (t + s).length <= max);
  return best ? t + best : t;
}
