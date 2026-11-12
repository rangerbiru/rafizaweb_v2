/**
 * Builder JSON-LD (@graph) — PRD §9.2.
 * TIDAK ada AggregateRating/Review untuk bisnis sendiri (kebijakan Google: self-serving).
 */
import type { Locale } from '../i18n/routes';
import { isPlaceholder, settings, type Plan, type Service } from './site';

export const SITE = 'https://rafizaweb.com';
export const BUSINESS_ID = `${SITE}/#business`;
export const WEBSITE_ID = `${SITE}/#website`;
/** Person founder/penulis: satu entitas yang dirujuk dari bisnis, halaman Tentang, dan artikel. */
export const PERSON_ID = `${SITE}/tentang/#person`;
/** @id WebSite per bahasa agar graf /en/ dan /ar/ tidak bentrok dengan versi Indonesia. */
const websiteId = (locale: Locale) => (locale === 'id' ? WEBSITE_ID : `${SITE}/${locale}/#website`);

type Node = Record<string, unknown>;
const abs = (p: string) => (p.startsWith('http') ? p : `${SITE}${p}`);
const inLang: Record<Locale, string> = { id: 'id-ID', en: 'en', ar: 'ar' };

export function businessNode(): Node {
  const a = settings.address;
  const node: Node = {
    '@type': ['Organization', 'ProfessionalService'],
    '@id': BUSINESS_ID,
    name: settings.businessName,
    alternateName: 'Rafizaweb – Solusi Digital Terpercaya',
    url: `${SITE}/`,
    logo: { '@type': 'ImageObject', url: `${SITE}/logo.png`, width: 512, height: 512 },
    image: `${SITE}/og/default.png`,
    description: 'Rafizaweb adalah jasa pembuatan website di Kota Bekasi sejak Januari 2025.',
    telephone: `+${settings.whatsapp}`,
    email: settings.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: a.street,
      addressLocality: a.city,
      addressRegion: a.region,
      postalCode: a.postal,
      addressCountry: a.country,
    },
    areaServed: [
      { '@type': 'City', name: 'Kota Bekasi' },
      { '@type': 'AdministrativeArea', name: 'Kabupaten Bekasi' },
      { '@type': 'City', name: 'Jakarta' },
      { '@type': 'AdministrativeArea', name: 'Karawang' },
      { '@type': 'Country', name: 'Indonesia' },
    ],
    priceRange: 'Rp699.000-Rp4.999.000',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      telephone: `+${settings.whatsapp}`,
      email: settings.email,
      availableLanguage: 'Indonesian',
    },
    foundingDate: settings.foundingDate,
    sameAs: [
      settings.socials.instagram,
      settings.socials.tiktok,
      settings.socials.youtube,
      settings.socials.facebook,
      settings.socials.lynk,
      ...(settings.gbpUrlIsPlaceholder ? [] : [settings.gbpUrl]),
    ],
  };
  if (!isPlaceholder(settings.founder.name)) {
    node.founder = {
      '@type': 'Person',
      '@id': PERSON_ID,
      name: settings.founder.name,
      url: `${SITE}/tentang/`,
    };
  }
  if (!isPlaceholder(settings.geo.lat) && !isPlaceholder(settings.geo.lng)) {
    node.geo = { '@type': 'GeoCoordinates', latitude: settings.geo.lat, longitude: settings.geo.lng };
  }
  node.openingHoursSpecification = {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    opens: '06:00',
    closes: '22:00',
  };
  return node;
}

export function websiteNode(locale: Locale): Node {
  return {
    '@type': 'WebSite',
    '@id': websiteId(locale),
    url: locale === 'id' ? `${SITE}/` : `${SITE}/${locale}/`,
    name: 'Rafizaweb',
    inLanguage: inLang[locale],
    publisher: { '@id': BUSINESS_ID },
  };
}

export function webPageNode(opts: {
  url: string;
  name: string;
  description: string;
  locale: Locale;
  type?: string;
}): Node {
  return {
    '@type': opts.type ?? 'WebPage',
    '@id': `${abs(opts.url)}#webpage`,
    url: abs(opts.url),
    name: opts.name,
    description: opts.description,
    inLanguage: inLang[opts.locale],
    isPartOf: { '@id': websiteId(opts.locale) },
    about: { '@id': BUSINESS_ID },
  };
}

export function breadcrumbNode(items: { name: string; url: string }[]): Node {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: abs(it.url),
    })),
  };
}

export function faqNode(faqs: { question: string; answer: string }[]): Node | null {
  const clean = faqs.filter((f) => !isPlaceholder(f.answer) && !/\[[A-Z]/.test(f.answer));
  if (!clean.length) return null;
  return {
    '@type': 'FAQPage',
    mainEntity: clean.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}

export function serviceNode(service: Service, url: string, locale: Locale): Node {
  const node: Node = {
    '@type': 'Service',
    '@id': `${abs(url)}#service`,
    name: service.name,
    description: service.desc,
    serviceType: service.name,
    url: abs(url),
    provider: { '@id': BUSINESS_ID },
    areaServed: { '@type': 'City', name: 'Kota Bekasi' },
    inLanguage: inLang[locale],
  };
  if (service.priceFrom) {
    node.offers = {
      '@type': 'Offer',
      priceCurrency: 'IDR',
      price: service.priceFrom,
      availability: 'https://schema.org/InStock',
      url: abs(url),
    };
  }
  return node;
}

export function offerCatalogNode(plans: Plan[], url: string): Node {
  return {
    '@type': 'OfferCatalog',
    '@id': `${abs(url)}#catalog`,
    name: 'Paket pembuatan website Rafizaweb',
    itemListElement: plans.map((p) => ({
      '@type': 'Offer',
      name: p.name,
      description: p.desc,
      price: p.price,
      priceCurrency: 'IDR',
      availability: 'https://schema.org/InStock',
      url: abs(url),
      seller: { '@id': BUSINESS_ID },
      itemOffered: { '@type': 'Service', name: p.name, description: p.features.join('; ') },
    })),
  };
}

export function itemListNode(items: { name: string; url: string }[]): Node {
  return {
    '@type': 'ItemList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      url: abs(it.url),
    })),
  };
}

export function personNode(p: {
  name: string;
  url: string;
  jobTitle?: string;
  description?: string;
  sameAs?: string[];
  image?: string;
  alternateName?: string;
  knowsAbout?: string[];
}): Node {
  return {
    '@type': 'Person',
    '@id': `${abs(p.url)}#person`,
    name: p.name,
    url: abs(p.url),
    ...(p.jobTitle ? { jobTitle: p.jobTitle } : {}),
    ...(p.description ? { description: p.description } : {}),
    ...(p.image ? { image: { '@type': 'ImageObject', url: abs(p.image), width: 512, height: 512 } } : {}),
    ...(p.sameAs?.length ? { sameAs: p.sameAs } : {}),
    ...(p.alternateName ? { alternateName: p.alternateName } : {}),
    ...(p.knowsAbout?.length ? { knowsAbout: p.knowsAbout } : {}),
    worksFor: { '@id': BUSINESS_ID },
  };
}

/** Person founder dari settings: dipakai halaman Tentang dan artikel yang ditulis founder. */
export function founderNode(): Node {
  const f = settings.founder;
  return personNode({
    name: f.name,
    url: '/tentang/',
    jobTitle: f.jobTitle,
    description: f.bio,
    image: f.photo || undefined,
    sameAs: f.sameAs,
    alternateName: f.fullName !== f.name ? f.fullName : undefined,
    knowsAbout: f.knowsAbout,
  });
}

export function blogPostingNode(a: {
  url: string;
  title: string;
  description: string;
  image?: string;
  published: Date;
  modified?: Date | null;
  authorName: string;
  authorUrl: string;
  section?: string;
  keywords?: string[];
}): Node {
  return {
    '@type': 'BlogPosting',
    '@id': `${abs(a.url)}#article`,
    headline: a.title,
    description: a.description,
    url: abs(a.url),
    mainEntityOfPage: { '@id': `${abs(a.url)}#webpage` },
    ...(a.image ? { image: { '@type': 'ImageObject', url: abs(a.image), width: 1200, height: 630 } } : {}),
    datePublished: a.published.toISOString(),
    dateModified: (a.modified ?? a.published).toISOString(),
    author: { '@id': `${abs(a.authorUrl)}#person` },
    publisher: { '@id': BUSINESS_ID },
    inLanguage: 'id-ID',
    ...(a.section ? { articleSection: a.section } : {}),
    ...(a.keywords?.length ? { keywords: a.keywords.join(', ') } : {}),
  };
}

export function creativeWorkNode(p: {
  url: string;
  name: string;
  description: string;
  liveUrl?: string;
  siteName?: string;
  image?: string;
  inLanguage?: string;
  year?: string;
}): Node {
  return {
    '@type': 'CreativeWork',
    '@id': `${abs(p.url)}#work`,
    name: p.name,
    description: p.description,
    url: abs(p.url),
    creator: { '@id': BUSINESS_ID },
    ...(p.image ? { image: abs(p.image), thumbnailUrl: abs(p.image) } : {}),
    ...(p.inLanguage ? { inLanguage: p.inLanguage } : {}),
    // Karya = website klien yang sudah live (bukan identitas yang sama, jadi bukan sameAs).
    ...(p.liveUrl
      ? { about: { '@type': 'WebSite', url: p.liveUrl, ...(p.siteName ? { name: p.siteName } : {}) } }
      : {}),
    ...(p.year ? { dateCreated: p.year } : {}),
  };
}

/** Satu @graph per halaman: bisnis + website + node halaman. */
export function graph(locale: Locale, nodes: (Node | null | undefined)[]): string {
  const list = nodes.filter((n): n is Node => Boolean(n));
  // Beri @id pada node halaman yang belum punya (berdasarkan URL WebPage) agar graf bisa dirujuk.
  const pageId = list.find((n) => typeof n['@id'] === 'string' && String(n['@id']).endsWith('#webpage'))?.[
    '@id'
  ];
  const base = typeof pageId === 'string' ? pageId.replace(/#webpage$/, '') : undefined;
  const suffix: Record<string, string> = {
    BreadcrumbList: '#breadcrumb',
    FAQPage: '#faq',
    ItemList: '#itemlist',
  };
  const named = list.map((n) => {
    const s = suffix[String(n['@type'])];
    return base && s && !n['@id'] ? { '@id': `${base}${s}`, ...n } : n;
  });
  // Jika halaman sudah memuat node Person lengkap, founder cukup berupa rujukan @id (hindari stub ganda).
  const business = businessNode();
  if (named.some((n) => n['@type'] === 'Person' && n['@id'] === PERSON_ID) && business.founder) {
    business.founder = { '@id': PERSON_ID };
  }
  const g = [business, websiteNode(locale), ...named];
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': g }).replace(/</g, '\\u003c');
}
