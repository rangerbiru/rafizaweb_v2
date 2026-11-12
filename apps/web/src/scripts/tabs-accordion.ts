/**
 * Layanan: ARIA Tabs (≥768px) + accordion (<768px) di atas markup yang sama.
 * - Tabs: ←/→/↑/↓, Home, End (arah ←/→ dibalik di RTL), aria-selected, roving tabindex.
 * - Accordion: satu terbuka, boleh semua tertutup; auto-scroll kepala item ke 96px dari atas,
 *   dikurangi tinggi panel yang menutup di atasnya (port dari _openSvc di desain).
 */
import { track } from './analytics';
import { reducedMotion } from './motion';

const root = document.querySelector<HTMLElement>('[data-svc-root]');

if (root) {
  const tabs = [...root.querySelectorAll<HTMLButtonElement>('[data-svc-tab]')];
  const items = [...root.querySelectorAll<HTMLElement>('[data-svc-item]')];
  const toggles = [...root.querySelectorAll<HTMLButtonElement>('[data-svc-toggle]')];
  const mq = window.matchMedia('(min-width: 768px)');
  const rtl = () => document.documentElement.dir === 'rtl';
  let current: string = items.find((i) => i.hasAttribute('data-open'))?.dataset.svcItem ?? '';

  const item = (key: string) => items.find((i) => i.dataset.svcItem === key);

  function render() {
    for (const it of items) {
      const key = it.dataset.svcItem!;
      const on = key === current;
      it.toggleAttribute('data-open', on);
    }
    for (const tab of tabs) {
      const on = tab.dataset.svcTab === current;
      tab.setAttribute('aria-selected', String(on));
      tab.tabIndex = on ? 0 : -1;
    }
    for (const tg of toggles) tg.setAttribute('aria-expanded', String(tg.dataset.svcToggle === current));
  }

  /** Peran ARIA panel mengikuti mode (tabpanel di desktop, biasa di mobile). */
  function applyMode() {
    for (const panel of root!.querySelectorAll<HTMLElement>('[data-svc-panel]')) {
      if (mq.matches) {
        panel.setAttribute('role', 'tabpanel');
        panel.tabIndex = 0;
      } else {
        panel.removeAttribute('role');
        panel.removeAttribute('tabindex');
      }
    }
    // Di desktop selalu ada satu tab terpilih.
    if (mq.matches && !current) {
      current = 'lp';
      render();
    }
  }

  function select(key: string, focus = false) {
    if (key === current) return;
    current = key;
    render();
    if (focus) tabs.find((t) => t.dataset.svcTab === key)?.focus();
    track('select_service_tab', { service: key });
  }

  tabs.forEach((tab, idx) => {
    tab.addEventListener('click', () => select(tab.dataset.svcTab!));
    tab.addEventListener('keydown', (e) => {
      const last = tabs.length - 1;
      let next = -1;
      const fwd = rtl() ? 'ArrowLeft' : 'ArrowRight';
      const back = rtl() ? 'ArrowRight' : 'ArrowLeft';
      if (e.key === 'ArrowDown' || e.key === fwd) next = idx === last ? 0 : idx + 1;
      else if (e.key === 'ArrowUp' || e.key === back) next = idx === 0 ? last : idx - 1;
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = last;
      if (next < 0) return;
      e.preventDefault();
      select(tabs[next]!.dataset.svcTab!, true);
    });
  });

  toggles.forEach((tg) => {
    tg.addEventListener('click', () => {
      const key = tg.dataset.svcToggle!;
      if (key === current) {
        current = '';
        render();
        return;
      }
      // Hitung target scroll SEBELUM state berubah (lihat _openSvc).
      const el = item(key);
      let target: number | null = null;
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY;
        const prevEl = current ? item(current) : null;
        let adjust = 0;
        if (prevEl && prevEl.getBoundingClientRect().top < el.getBoundingClientRect().top) {
          adjust = prevEl.querySelector<HTMLElement>('[data-svc-body]')?.offsetHeight ?? 0;
        }
        target = Math.max(0, top - adjust - 96);
      }
      current = key;
      render();
      track('select_service_tab', { service: key });
      if (target !== null) {
        const behavior: ScrollBehavior = reducedMotion() ? 'auto' : 'smooth';
        window.setTimeout(() => window.scrollTo({ top: target!, behavior }), 40);
      }
    });
  });

  mq.addEventListener('change', applyMode);
  applyMode();
  render();
}
