/** Bar bawah mobile: sembunyi saat banner #kontak terlihat (IntersectionObserver) atau drawer terbuka (CSS). */
const bar = document.querySelector<HTMLElement>('[data-mobile-bar]');
const banner = document.querySelector<HTMLElement>('[data-cta-banner]');

if (bar && banner && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    ([entry]) => {
      bar.toggleAttribute('data-hidden', !!entry?.isIntersecting);
    },
    { rootMargin: '0px 0px -40px 0px' },
  );
  io.observe(banner);
}

export {};
