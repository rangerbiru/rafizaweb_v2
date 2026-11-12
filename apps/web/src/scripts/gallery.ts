/** Galeri portofolio: thumbnail (aria-pressed) mengganti preview dengan animasi swap. */
const gallery = document.querySelector<HTMLElement>('[data-gallery]');

if (gallery) {
  const thumbs = [...gallery.querySelectorAll<HTMLButtonElement>('[data-proj-thumb]')];
  const previews = [...gallery.querySelectorAll<HTMLElement>('[data-proj]')];
  thumbs.forEach((btn) =>
    btn.addEventListener('click', () => {
      const id = btn.dataset.projThumb!;
      for (const t of thumbs) t.setAttribute('aria-pressed', String(t === btn));
      for (const p of previews) {
        const on = p.dataset.proj === id;
        p.toggleAttribute('data-open', on);
        p.toggleAttribute('data-swapped', on);
      }
    }),
  );
}

export {};
