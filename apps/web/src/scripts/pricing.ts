/**
 * Pemilih tahap bisnis (radiogroup): mengganti paket rekomendasi.
 * Keyboard: panah (arah dibalik di RTL), Home/End. Event: select_pricing_stage.
 */
import { track } from './analytics';

document.querySelectorAll<HTMLElement>('[data-pricing]').forEach((root) => {
  const radios = [...root.querySelectorAll<HTMLButtonElement>('[role="radio"][data-stage]')];
  const cards = [...root.querySelectorAll<HTMLElement>('[data-plan-card]')];
  const minis = [...root.querySelectorAll<HTMLElement>('[data-plan-mini]')];

  function select(stage: string, focus = false) {
    const radio = radios.find((r) => r.dataset.stage === stage);
    if (!radio) return;
    const plan = radio.dataset.plan!;
    for (const r of radios) {
      const on = r === radio;
      r.setAttribute('aria-checked', String(on));
      r.tabIndex = on ? 0 : -1;
    }
    for (const c of cards) c.toggleAttribute('data-rec', c.dataset.planCard === plan);
    for (const m of minis) m.hidden = m.dataset.planMini === plan;
    root.dataset.rec = plan;
    if (focus) radio.focus();
    track('select_pricing_stage', { stage });
  }

  radios.forEach((r, i) => {
    r.addEventListener('click', () => select(r.dataset.stage!));
    r.addEventListener('keydown', (e) => {
      const rtl = document.documentElement.dir === 'rtl';
      const last = radios.length - 1;
      let n = -1;
      if (e.key === 'ArrowDown' || e.key === (rtl ? 'ArrowLeft' : 'ArrowRight')) n = i === last ? 0 : i + 1;
      else if (e.key === 'ArrowUp' || e.key === (rtl ? 'ArrowRight' : 'ArrowLeft'))
        n = i === 0 ? last : i - 1;
      else if (e.key === 'Home') n = 0;
      else if (e.key === 'End') n = last;
      else if (e.key === ' ' || e.key === 'Enter') n = i;
      if (n < 0) return;
      e.preventDefault();
      select(radios[n]!.dataset.stage!, true);
    });
  });

  root.querySelectorAll<HTMLButtonElement>('[data-show-stage]').forEach((b) =>
    b.addEventListener('click', () => {
      select(b.dataset.showStage!);
      const rec = root.querySelector<HTMLElement>('[data-plan-card][data-rec]');
      rec?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      radios.find((r) => r.getAttribute('aria-checked') === 'true')?.focus({ preventScroll: true });
    }),
  );
});
