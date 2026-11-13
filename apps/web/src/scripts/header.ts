/**
 * Header: state "scrolled" (> 8px), dropdown Ekosistem/Bahasa (aria-expanded + aria-controls),
 * tutup saat klik di luar, Esc, dan saat dropdown lain dibuka. Simpan preferensi bahasa.
 */
import { track } from './analytics';

const header = document.querySelector<HTMLElement>('[data-header]');

function onScroll() {
  if (!header) return;
  const s = window.scrollY > 8;
  if (s !== header.hasAttribute('data-scrolled')) header.toggleAttribute('data-scrolled', s);
}

type DD = { root: HTMLElement; btn: HTMLButtonElement; panel: HTMLElement };
const dropdowns: DD[] = [];
document.querySelectorAll<HTMLElement>('[data-dropdown]').forEach((root) => {
  const btn = root.querySelector<HTMLButtonElement>('[data-dropdown-toggle]');
  const id = btn?.getAttribute('aria-controls');
  const panel = id ? document.getElementById(id) : null;
  if (btn && panel) dropdowns.push({ root, btn, panel });
});

function setOpen(dd: DD, open: boolean) {
  dd.btn.setAttribute('aria-expanded', String(open));
  dd.panel.hidden = !open;
}
const closeAll = (except?: DD) => dropdowns.forEach((d) => d !== except && setOpen(d, false));

dropdowns.forEach((dd) => {
  dd.btn.addEventListener('click', () => {
    const open = dd.btn.getAttribute('aria-expanded') !== 'true';
    closeAll(dd);
    setOpen(dd, open);
  });
  dd.panel
    .querySelectorAll('[data-close-dropdown]')
    .forEach((a) => a.addEventListener('click', () => setOpen(dd, false)));
  dd.root.addEventListener('focusout', (e) => {
    const next = e.relatedTarget as Node | null;
    if (next && !dd.root.contains(next)) setOpen(dd, false);
  });
});

document.addEventListener('click', (e) => {
  const t = e.target as Element | null;
  dropdowns.forEach((d) => {
    if (d.btn.getAttribute('aria-expanded') === 'true' && t && !d.root.contains(t)) setOpen(d, false);
  });
});
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  const open = dropdowns.find((d) => d.btn.getAttribute('aria-expanded') === 'true');
  if (open) {
    setOpen(open, false);
    open.btn.focus();
  }
});

// Pemilih bahasa: berpindah lewat link biasa; simpan preferensi (tanpa redirect otomatis).
document.addEventListener('click', (e) => {
  const a = (e.target as Element | null)?.closest<HTMLAnchorElement>('[data-lang-link]');
  if (!a) return;
  const to = a.dataset.langLink!;
  const from = a.dataset.langFrom!;
  try {
    localStorage.setItem('rz-lang', to);
  } catch {
    /* storage diblokir */
  }
  if (to !== from) track('change_language', { from, to });
});

window.addEventListener('scroll', onScroll, { passive: true });
onScroll();
