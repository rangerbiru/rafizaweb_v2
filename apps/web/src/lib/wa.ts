import { settings } from './site';

export type WaLocation =
  | 'header'
  | 'drawer'
  | 'hero'
  | 'service_tab'
  | 'service_page'
  | 'pricing'
  | 'faq'
  | 'banner'
  | 'mobile_bar'
  | 'footer'
  | 'contact'
  | 'article'
  | 'not_found';

/** Link WhatsApp dengan pesan kontekstual. Nomor diambil dari singleton settings. */
export function waHref(message: string): string {
  return `https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(message)}`;
}

/** Atribut data untuk event analytics `click_whatsapp` (PRD §13). */
export function waTrack(
  location: WaLocation,
  extra: { service?: string; plan?: string; locale?: string } = {},
) {
  return {
    'data-track': 'click_whatsapp',
    'data-location': location,
    ...(extra.service ? { 'data-service': extra.service } : {}),
    ...(extra.plan ? { 'data-plan': extra.plan } : {}),
    ...(extra.locale ? { 'data-locale': extra.locale } : {}),
  };
}
