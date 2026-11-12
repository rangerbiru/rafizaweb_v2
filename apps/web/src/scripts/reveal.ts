/**
 * Reveal sekali saat elemen [data-reveal] pertama kali terlihat.
 * Hanya elemen di bawah fold yang disembunyikan dulu; tanpa JS / reduced motion konten langsung terlihat.
 */
import { reducedMotion } from './motion';

const els = [...document.querySelectorAll<HTMLElement>('[data-reveal]')];
if (els.length && !reducedMotion() && 'IntersectionObserver' in window) {
  const vh = window.innerHeight;
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const el = e.target as HTMLElement;
        el.classList.remove('rz-reveal-pending');
        el.classList.add('rz-reveal-in');
        io.unobserve(el);
      }
    },
    { rootMargin: '0px 0px -8% 0px' },
  );
  for (const el of els) {
    if (el.getBoundingClientRect().top > vh) {
      el.classList.add('rz-reveal-pending');
      io.observe(el);
    }
  }
}
