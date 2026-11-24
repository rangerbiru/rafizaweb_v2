/**
 * Parallax mouse hero (PRD §6.3): hanya pointer fine + tanpa reduced motion.
 * Posisi dinormalisasi ke -0.5…0.5, di-throttle rAF, hanya menyetel CSS variable (transform-only).
 */
import { reducedMotion } from './motion';

const area = document.querySelector<HTMLElement>('[data-parallax]');
const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

if (area && fine && !reducedMotion()) {
  let next: { x: number; y: number } | null = null;
  let raf = 0;
  const apply = () => {
    raf = 0;
    if (!next) return;
    area.style.setProperty('--hx', next.x.toFixed(3));
    area.style.setProperty('--hy', next.y.toFixed(3));
    area.toggleAttribute('data-active', next.x !== 0 || next.y !== 0);
  };
  area.addEventListener('mousemove', (e) => {
    const r = area.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const clamp = (v: number) => Math.max(-0.5, Math.min(0.5, v));
    next = { x: clamp((e.clientX - r.left) / r.width - 0.5), y: clamp((e.clientY - r.top) / r.height - 0.5) };
    if (!raf) raf = requestAnimationFrame(apply);
  });
  area.addEventListener('mouseleave', () => {
    next = { x: 0, y: 0 };
    if (!raf) raf = requestAnimationFrame(apply);
  });
}
