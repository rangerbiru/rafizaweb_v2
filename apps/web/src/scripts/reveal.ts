/**
 * Reveal sekali saat elemen [data-reveal] (atau anak langsung [data-reveal-stagger]) pertama kali terlihat.
 * Hanya elemen di bawah fold yang disembunyikan dulu, jadi LCP dan CLS tidak tersentuh (hanya opacity + transform).
 * Tanpa JS / reduced motion konten langsung terlihat.
 */
import { reducedMotion } from './motion';

const STAGGER_MS = 80;
const STAGGER_MAX = 4;

/** Varian: data-reveal="fade|rise|left|right|zoom|drop" (kosong = rise). Stagger: nilai yang sama untuk anak-anaknya. */
const targets: HTMLElement[] = [];
for (const el of document.querySelectorAll<HTMLElement>('[data-reveal]')) {
  el.dataset.rv = el.dataset.reveal || 'rise';
  targets.push(el);
}
for (const group of document.querySelectorAll<HTMLElement>('[data-reveal-stagger]')) {
  [...group.children].slice(0, 12).forEach((child, i) => {
    const el = child as HTMLElement;
    el.dataset.rv = group.dataset.revealStagger || 'rise';
    el.style.setProperty('--rz-d', `${Math.min(i, STAGGER_MAX) * STAGGER_MS}ms`);
    targets.push(el);
  });
}

if (targets.length && !reducedMotion() && 'IntersectionObserver' in window) {
  const vh = window.innerHeight;
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const el = e.target as HTMLElement;
        el.classList.remove('rz-reveal-pending');
        el.classList.add('rz-reveal-in');
        // Lepas kelas setelah selesai agar transform hover kartu tidak tertimpa fill-mode animasi.
        el.addEventListener('animationend', () => el.classList.remove('rz-reveal-in'), { once: true });
        io.unobserve(el);
      }
    },
    { rootMargin: '0px 0px -8% 0px' },
  );
  for (const el of targets) {
    if (el.getBoundingClientRect().top > vh) {
      el.classList.add('rz-reveal-pending');
      io.observe(el);
    }
  }
}
