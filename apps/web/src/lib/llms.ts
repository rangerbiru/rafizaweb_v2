/** Generator llms.txt / llms-full.txt (PRD §9.4) dari data yang sama dengan halaman. */
import { formatPrice, path } from '../i18n';
import {
  getArticles,
  getFaq,
  getPlans,
  getServices,
  getStoreProducts,
  isPlaceholder,
  settings,
} from './data';
import { SITE } from './schema';

const abs = (p: string) => `${SITE}${p}`;

export async function llmsTxt(full = false): Promise<string> {
  const services = getServices('id');
  const plans = getPlans('id');
  const articles = await getArticles();
  const faqs = await getFaq('home', 'id');
  const products = (await getStoreProducts()).filter(
    (p) => !isPlaceholder(p.data.name) && !isPlaceholder(p.data.price),
  );
  const f = settings.founder;
  const a = settings.address;
  const lines: string[] = [
    '# Rafizaweb',
    '',
    `> Rafizaweb adalah jasa pembuatan website di Kota Bekasi sejak Januari 2025 (tagline: "${settings.tagline}"). Melayani UMKM, perusahaan, CV, yayasan, sekolah, dan travel umroh di Bekasi dan sekitarnya serta online ke seluruh Indonesia. Harga mulai Rp699.000 termasuk hosting dan domain tahun pertama.`,
    '',
    '## Kontak',
    `- Alamat: ${a.street}, ${a.city}, ${a.region} ${a.postal}, Indonesia`,
    `- WhatsApp: ${settings.whatsappDisplay} (${abs('/kontak/')})`,
    `- Email: ${settings.email}`,
    ...(isPlaceholder(settings.hours) ? [] : [`- Jam operasional: ${settings.hours}`]),
    '- Area layanan: Kota Bekasi, Kabupaten Bekasi, Jakarta Timur, Karawang, Jabodetabek, online seluruh Indonesia',
    '',
    '## Layanan',
    ...services.map(
      (s) =>
        `- [${s.name}](${abs(s.slug ? path(`service:${s.key}`) : '/#ekosistem')}): ${s.desc} ${s.price}.`,
    ),
    '',
    '## Paket harga',
    ...plans.map(
      (p) =>
        `- ${p.name}: ${formatPrice(p.price)} (perpanjangan ${formatPrice(p.renewal)}/tahun), pengerjaan ${p.time}. ${p.features.join('; ')}.`,
    ),
    '- Semua paket sudah termasuk hosting dan domain .com tahun pertama.',
    '',
    ...(products.length
      ? [
          '## Rafizastore (produk digital)',
          ...products.map((x) => `- [${x.data.name}](${x.data.url}): ${x.data.price}.`),
          `- Toko lengkap: ${settings.socials.lynk}`,
          '',
        ]
      : []),
    ...(isPlaceholder(f.name)
      ? []
      : [
          '## Founder',
          `- ${f.name} (nama lengkap ${f.fullName || f.name}), ${f.jobTitle}. ${f.bio}`,
          `- Profil: ${f.sameAs.join(', ')}`,
          '',
        ]),
    '## Halaman penting',
    `- [Beranda](${abs('/')}): ringkasan layanan, portofolio, harga, dan FAQ.`,
    `- [Layanan](${abs('/layanan/')}): daftar semua layanan pembuatan website.`,
    `- [Harga](${abs('/harga/')}): paket dan tabel perbandingan fitur.`,
    `- [Portofolio](${abs('/portofolio/')}): website klien yang sudah dibangun.`,
    `- [Blog](${abs('/blog/')}): panduan website untuk pemilik bisnis.`,
    `- [Tentang](${abs('/tentang/')}): profil Rafizaweb dan area layanan.`,
    `- [Kontak](${abs('/kontak/')}): WhatsApp, email, dan form kontak.`,
    `- [English](${abs('/en/')}) dan [العربية](${abs('/ar/')}): versi bahasa Inggris dan Arab.`,
    '',
    '## Artikel',
    ...articles
      .filter((x) => !x.data.noindex)
      .map((x) => `- [${x.data.title}](${abs(`/${x.id}/`)}): ${x.data.excerpt}`),
  ];
  if (full) {
    const clean = faqs.filter((f) => !/\[[A-Z]/.test(f.answer));
    lines.push('', '## FAQ', ...clean.flatMap((f) => [`### ${f.question}`, f.answer, '']));
    lines.push(
      '## Proses kerja',
      '1. Konsultasi gratis lewat WhatsApp, online, atau tatap muka di Bekasi.',
      '2. Desain dan copywriting.',
      '3. Development (dioptimasi untuk kecepatan dan SEO).',
      '4. Launch dan support 1–3 bulan sesuai paket.',
    );
    for (const s of services) {
      lines.push('', `## ${s.name}`, s.desc, ...s.points.map((p) => `- ${p}`), s.price);
    }
  }
  return `${lines.join('\n')}\n`;
}
