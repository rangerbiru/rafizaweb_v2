/**
 * Event analytics (PRD §13). Mengirim ke gtag bila GA4 dimuat; jika tidak, hanya ke dataLayer.
 * Klik WhatsApp dilacak lewat atribut data-track="click_whatsapp" + data-location/service/plan.
 */
type Params = Record<string, string | number | undefined>;
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function track(event: string, params: Params = {}): void {
  const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ''));
  try {
    if (typeof window.gtag === 'function') window.gtag('event', event, clean);
    else (window.dataLayer ||= []).push({ event, ...clean });
  } catch {
    /* analytics tidak boleh mengganggu UI */
  }
}

let bound = false;
export function bindTracking(): void {
  if (bound) return;
  bound = true;
  document.addEventListener(
    'click',
    (e) => {
      const el = (e.target as Element | null)?.closest<HTMLElement>('[data-track]');
      if (!el) return;
      const d = el.dataset;
      track(d.track!, {
        location: d.location,
        service: d.service,
        plan: d.plan,
        locale: d.locale ?? document.documentElement.lang,
      });
    },
    { capture: true },
  );
}
bindTracking();
