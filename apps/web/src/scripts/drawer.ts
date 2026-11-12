/**
 * Drawer mobile: masuk dari kanan (kiri di RTL), overlay, scroll lock, focus trap,
 * Esc / klik overlay menutup, fokus kembali ke tombol hamburger. Klik link → tutup lalu scroll.
 */
const root = document.documentElement;
const drawer = document.querySelector<HTMLElement>('[data-drawer]');
const overlay = document.querySelector<HTMLElement>('[data-drawer-overlay]');
const opener = document.querySelector<HTMLButtonElement>('[data-drawer-open]');
const closer = document.querySelector<HTMLButtonElement>('[data-drawer-close]');

const FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';
drawer
  ?.querySelectorAll<HTMLElement>(':scope > *')
  .forEach((el, i) => el.style.setProperty('--i', String(i)));

const isOpen = () => root.hasAttribute('data-menu-open');

function open() {
  if (!drawer || isOpen()) return;
  root.setAttribute('data-menu-open', '');
  root.style.overflow = 'hidden';
  opener?.setAttribute('aria-expanded', 'true');
  // fokus tanpa scroll agar animasi tidak tersendat
  requestAnimationFrame(() => closer?.focus({ preventScroll: true }));
  document.dispatchEvent(new CustomEvent('rz:drawer', { detail: true }));
}

function close(restoreFocus = true) {
  if (!isOpen()) return;
  root.removeAttribute('data-menu-open');
  root.style.overflow = '';
  opener?.setAttribute('aria-expanded', 'false');
  if (restoreFocus) opener?.focus({ preventScroll: true });
  document.dispatchEvent(new CustomEvent('rz:drawer', { detail: false }));
}

opener?.addEventListener('click', open);
closer?.addEventListener('click', () => close());
overlay?.addEventListener('click', () => close());

drawer?.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    e.preventDefault();
    close();
    return;
  }
  if (e.key !== 'Tab') return;
  const items = [...drawer.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.offsetParent !== null);
  if (!items.length) return;
  const first = items[0]!;
  const last = items[items.length - 1]!;
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
});

drawer?.querySelectorAll<HTMLAnchorElement>('[data-drawer-link]').forEach((a) => {
  a.addEventListener('click', () => {
    const href = a.getAttribute('href') ?? '';
    // Tutup tanpa mengembalikan fokus ke hamburger agar smooth-scroll anchor tidak terganggu.
    close(!href.startsWith('#'));
  });
});

// Tutup otomatis jika viewport melebar ke desktop.
window.matchMedia('(min-width: 1024px)').addEventListener('change', (m) => m.matches && close(false));

export {};
