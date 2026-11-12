/**
 * Typing effect SEO-safe (PRD §6.3).
 * - HTML build berisi kata statis pertama di <span data-typing>.
 * - Saat init: sisipkan <span class="sr-only">kata</span> dan beri aria-hidden pada span animasi,
 *   sehingga teks H1 untuk crawler/screen reader stabil.
 * - Timing dari desain: mulai 2200ms, ketik 85ms/karakter, tahan 1900ms, hapus 40ms/karakter, jeda 300ms.
 * - Reduced motion: statis (tanpa animasi).
 */
import { reducedMotion } from './motion';

const el = document.querySelector<HTMLElement>('[data-typing]');

if (el && !el.dataset.ready) {
  el.dataset.ready = '1';
  const words: string[] = JSON.parse(el.dataset.words ?? '[]');
  const sr = document.createElement('span');
  sr.className = 'sr-only';
  sr.textContent = el.textContent ?? '';
  el.after(sr);
  el.setAttribute('aria-hidden', 'true');

  if (words.length > 1 && !reducedMotion()) {
    let wi = 0;
    let wc = words[0]!.length;
    let deleting = false;
    let timer = 0;

    const tick = () => {
      const word = words[wi]!;
      let delay: number;
      if (!deleting && wc < word.length) {
        wc++;
        delay = 85;
      } else if (!deleting) {
        deleting = true;
        delay = 1900;
      } else if (wc > 0) {
        wc--;
        delay = 40;
      } else {
        deleting = false;
        wi = (wi + 1) % words.length;
        delay = 300;
      }
      el.textContent = words[wi]!.slice(0, wc);
      timer = window.setTimeout(tick, delay);
    };

    // Mulai dengan fase "tahan" agar kata pertama tetap tampil 2200ms.
    deleting = false;
    timer = window.setTimeout(() => {
      deleting = true;
      tick();
    }, 2200);

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) window.clearTimeout(timer);
      else timer = window.setTimeout(tick, 300);
    });
  }
}
