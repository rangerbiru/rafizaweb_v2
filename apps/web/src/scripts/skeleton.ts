/**
 * Skeleton gambar: <img> yang belum selesai dimuat diberi [data-skel] (shimmer di CSS) sampai load/error.
 * Gambar yang sudah ada tidak disentuh, jadi tidak ada kilatan. Tanpa JS gambar tampil seperti biasa.
 */
for (const img of document.querySelectorAll<HTMLImageElement>('main img, article img')) {
  if (img.complete && img.naturalWidth > 0) continue;
  img.setAttribute('data-skel', '');
  const done = () => img.removeAttribute('data-skel');
  img.addEventListener('load', done, { once: true });
  img.addEventListener('error', done, { once: true });
}

export {};
