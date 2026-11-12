/** FAQ accordion: satu item terbuka, boleh semua ditutup. Jawaban selalu ada di DOM. */
document.querySelectorAll<HTMLElement>('[data-faq]').forEach((root) => {
  const items = [...root.querySelectorAll<HTMLElement>('.rz-faq')];
  items.forEach((item) => {
    const btn = item.querySelector<HTMLButtonElement>('button[aria-expanded]');
    btn?.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') !== 'true';
      for (const other of items) {
        const b = other.querySelector<HTMLButtonElement>('button[aria-expanded]');
        const on = other === item && open;
        other.toggleAttribute('data-open', on);
        b?.setAttribute('aria-expanded', String(on));
      }
    });
  });
});

export {};
