/**
 * Screenshot portofolio disimpan di src/assets/portfolio agar diproses astro:assets (AVIF/WebP + srcset).
 * Konten (CMS) tetap menyimpan path publik `/images/portfolio/<slug>/<file>`; fungsi ini memetakannya ke berkas aslinya.
 */
import type { ImageMetadata } from 'astro';

const files = import.meta.glob<{ default: ImageMetadata }>('/src/assets/portfolio/**/*.{webp,png,jpg,jpeg}', {
  eager: true,
});

export function portfolioImage(publicPath: string): ImageMetadata | undefined {
  return files[publicPath.replace('/images/portfolio/', '/src/assets/portfolio/')]?.default;
}
