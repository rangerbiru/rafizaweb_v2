/**
 * Keystatic CMS (PRD §11.3). Admin di /keystatic.
 * Storage: `local` saat dev; `github` di production (PUBLIC_KEYSTATIC_STORAGE=github + PUBLIC_KEYSTATIC_REPO=owner/repo).
 * Skema di sini HARUS sejalan dengan src/content.config.ts (validasi build).
 */
import { collection, config, fields, singleton, type ComponentSchema } from '@keystatic/core';

const storageKind = import.meta.env.PUBLIC_KEYSTATIC_STORAGE === 'github' ? 'github' : 'local';
const repo = (import.meta.env.PUBLIC_KEYSTATIC_REPO ?? 'rafizaweb/rafizaweb_v2') as `${string}/${string}`;

const industry = fields.select({
  label: 'Industri',
  options: [
    { label: 'Pendidikan', value: 'pendidikan' },
    { label: 'Perusahaan', value: 'perusahaan' },
    { label: 'Produk dan distribusi', value: 'produk' },
    { label: 'Toko dan retail', value: 'retail' },
    { label: 'Lainnya', value: 'lainnya' },
  ],
  defaultValue: 'perusahaan',
});
const tint = fields.select({
  label: 'Warna tint',
  options: [
    { label: 'Biru muda (#E6EDFD)', value: 'brand' },
    { label: 'Surface (#F5F8FF)', value: 'surface' },
    { label: 'Amber muda', value: 'amber' },
  ],
  defaultValue: 'brand',
});
const services = fields.select({
  label: 'Layanan terkait (kotak CTA)',
  options: [
    { label: '— Tidak ada —', value: '' },
    { label: 'Landing Page UMKM', value: 'lp' },
    { label: 'Company Profile', value: 'cp' },
    { label: 'Toko Online', value: 'toko' },
    { label: 'Aplikasi Web & Mobile', value: 'app' },
    { label: 'SEO & GEO', value: 'seo' },
  ],
  defaultValue: '',
});

/** Teks tiga bahasa untuk satu bentuk objek. */
function l10n<T extends Record<string, ComponentSchema>>(shape: () => T) {
  return {
    id: fields.object(shape(), { label: 'Bahasa Indonesia' }),
    en: fields.object(shape(), { label: 'English' }),
    ar: fields.object(shape(), { label: 'العربية — [REVIEW AR]' }),
  };
}
const text = (label: string, multiline = false) => fields.text({ label, multiline });

export default config({
  storage: storageKind === 'github' ? { kind: 'github', repo } : { kind: 'local' },
  ui: {
    brand: { name: 'Rafizaweb' },
    navigation: {
      Blog: ['articles', 'categories', 'authors'],
      'Konten Home': ['portfolio', 'testimonials', 'faq', 'storeProducts'],
      'Data situs': ['settings', 'services', 'plans', 'process'],
    },
  },
  collections: {
    articles: collection({
      label: 'Artikel',
      slugField: 'title',
      path: 'src/content/articles/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      columns: ['title', 'publishedAt'],
      schema: {
        title: fields.slug({
          name: { label: 'Judul', validation: { isRequired: true, length: { max: 110 } } },
          slug: {
            label: 'Slug URL',
            description: 'Jangan ubah slug artikel lama (URL WordPress harus tetap).',
          },
        }),
        excerpt: fields.text({
          label: 'Ringkasan (excerpt)',
          description: 'Maksimal 160 karakter. Tampil di kartu artikel dan meta description.',
          multiline: true,
          validation: { isRequired: true, length: { max: 160 } },
        }),
        cover: fields.image({
          label: 'Gambar cover',
          directory: 'src/assets/blog',
          publicPath: '../../assets/blog/',
        }),
        coverAlt: fields.text({
          label: 'Alt text cover',
          description: 'Wajib jika ada cover. Jelaskan isi gambar.',
        }),
        illustration: fields.select({
          label: 'Ilustrasi kartu (Home)',
          options: [
            { label: 'Otomatis (cover / per kategori)', value: 'auto' },
            { label: 'Checklist', value: 'checklist' },
            { label: 'Perisai', value: 'shield' },
            { label: 'Versus', value: 'versus' },
            { label: 'Grafik', value: 'chart' },
            { label: 'Browser', value: 'browser' },
          ],
          defaultValue: 'auto',
        }),
        category: fields.relationship({
          label: 'Kategori',
          collection: 'categories',
          validation: { isRequired: true },
        }),
        tags: fields.array(fields.text({ label: 'Tag' }), { label: 'Tag', itemLabel: (p) => p.value }),
        author: fields.relationship({
          label: 'Penulis',
          collection: 'authors',
          validation: { isRequired: true },
        }),
        publishedAt: fields.datetime({ label: 'Tanggal terbit', validation: { isRequired: true } }),
        updatedAt: fields.datetime({ label: 'Tanggal diperbarui' }),
        draft: fields.checkbox({ label: 'Draft (tidak tayang)', defaultValue: false }),
        keyTakeaways: fields.array(fields.text({ label: 'Poin' }), {
          label: 'Inti artikel (2–3 poin)',
          description: 'Ringkasan yang langsung menjawab pertanyaan pembaca (GEO).',
          itemLabel: (p) => p.value,
          validation: { length: { max: 3 } },
        }),
        faq: fields.array(
          fields.object({
            q: fields.text({ label: 'Pertanyaan' }),
            a: fields.text({ label: 'Jawaban', multiline: true }),
          }),
          { label: 'FAQ artikel (opsional)', itemLabel: (p) => p.fields.q.value },
        ),
        relatedService: services,
        seoTitle: fields.text({
          label: 'SEO title (opsional)',
          description: 'Maksimal 60 karakter termasuk " | Rafizaweb".',
        }),
        seoDescription: fields.text({
          label: 'Meta description (opsional)',
          multiline: true,
          validation: { length: { max: 160 } },
        }),
        noindex: fields.checkbox({ label: 'Jangan diindeks (noindex)', defaultValue: false }),
        content: fields.markdoc({
          label: 'Isi artikel',
          options: {
            image: { directory: 'src/assets/blog', publicPath: '../../assets/blog/' },
          },
        }),
      },
    }),
    categories: collection({
      label: 'Kategori',
      slugField: 'name',
      path: 'src/content/categories/*',
      format: { data: 'json' },
      schema: {
        name: fields.slug({ name: { label: 'Nama' } }),
        description: fields.text({ label: 'Deskripsi', multiline: true }),
      },
    }),
    authors: collection({
      label: 'Penulis',
      slugField: 'name',
      path: 'src/content/authors/*',
      format: { data: 'json' },
      schema: {
        name: fields.slug({ name: { label: 'Nama' } }),
        role: fields.text({ label: 'Peran' }),
        photo: fields.image({
          label: 'Foto',
          directory: 'public/images/authors',
          publicPath: '/images/authors/',
        }),
        bio: fields.text({ label: 'Bio', multiline: true }),
        sameAs: fields.array(fields.url({ label: 'URL profil' }), {
          label: 'Profil (sameAs)',
          itemLabel: (p) => p.value ?? '',
        }),
      },
    }),
    portfolio: collection({
      label: 'Portofolio',
      slugField: 'name',
      path: 'src/content/portfolio/*',
      format: { data: 'json' },
      columns: ['name', 'order'],
      schema: {
        name: fields.slug({ name: { label: 'Nama klien' } }),
        industry,
        domain: fields.text({ label: 'Domain', description: 'Contoh: almumtazacademy.com' }),
        url: fields.text({ label: 'URL website live' }),
        year: fields.text({ label: 'Tahun' }),
        package: fields.text({ label: 'Paket' }),
        showInMarquee: fields.checkbox({ label: 'Tampil di strip klien', defaultValue: true }),
        order: fields.integer({ label: 'Urutan', defaultValue: 99 }),
        tint,
        screenshotDesktop: fields.image({
          label: 'Screenshot desktop',
          directory: 'src/assets/portfolio',
          publicPath: '/images/portfolio/',
        }),
        screenshotMobile: fields.image({
          label: 'Screenshot mobile',
          directory: 'src/assets/portfolio',
          publicPath: '/images/portfolio/',
        }),
        summary: fields.object(
          {
            id: fields.text({ label: 'Ringkasan (ID)', multiline: true }),
            en: fields.text({ label: 'Ringkasan (EN)', multiline: true }),
            ar: fields.text({ label: 'Ringkasan (AR)', multiline: true }),
          },
          { label: 'Ringkasan website', description: 'Hanya fakta yang terlihat di website klien.' },
        ),
        highlights: fields.object(
          {
            id: fields.array(fields.text({ label: 'Poin' }), {
              label: 'Isi website (ID)',
              itemLabel: (x) => x.value,
            }),
            en: fields.array(fields.text({ label: 'Point' }), {
              label: 'Isi website (EN)',
              itemLabel: (x) => x.value,
            }),
            ar: fields.array(fields.text({ label: 'نقطة' }), {
              label: 'Isi website (AR)',
              itemLabel: (x) => x.value,
            }),
          },
          { label: 'Isi website' },
        ),
        challenge: text('Tantangan', true),
        solution: text('Solusi', true),
        result: fields.text({
          label: 'Hasil',
          multiline: true,
          description: 'Hanya data nyata. Jangan isi angka karangan.',
        }),
        testimonial: fields.text({ label: 'Testimoni terkait (slug)' }),
        isDummy: fields.checkbox({ label: 'Data dummy', defaultValue: false }),
      },
    }),
    testimonials: collection({
      label: 'Testimoni',
      slugField: 'name',
      path: 'src/content/testimonials/*',
      format: { data: 'json' },
      schema: {
        name: fields.slug({ name: { label: 'Nama' } }),
        industry,
        quote: fields.text({ label: 'Kutipan (persis, jangan diubah)', multiline: true }),
        quoteEn: fields.text({ label: 'Terjemahan EN', multiline: true }),
        quoteAr: fields.text({ label: 'Terjemahan AR [REVIEW AR]', multiline: true }),
        rating: fields.integer({ label: 'Rating', defaultValue: 5, validation: { min: 1, max: 5 } }),
        source: fields.select({
          label: 'Sumber',
          options: [
            { label: 'Google', value: 'google' },
            { label: 'WhatsApp', value: 'whatsapp' },
            { label: 'Lainnya', value: 'lainnya' },
          ],
          defaultValue: 'google',
        }),
        sourceUrl: fields.text({ label: 'URL sumber' }),
        date: fields.text({ label: 'Tanggal ulasan' }),
        initial: fields.text({ label: 'Inisial avatar', validation: { length: { max: 2 } } }),
        tint,
        order: fields.integer({ label: 'Urutan', defaultValue: 99 }),
        isDummy: fields.checkbox({ label: 'DUMMY (tidak boleh tayang di production)', defaultValue: false }),
      },
    }),
    faq: collection({
      label: 'FAQ',
      slugField: 'question',
      path: 'src/content/faq/*',
      format: { data: 'json' },
      columns: ['question', 'locale', 'order'],
      schema: {
        question: fields.slug({ name: { label: 'Pertanyaan' } }),
        answer: fields.text({ label: 'Jawaban', multiline: true }),
        scope: fields.multiselect({
          label: 'Tampil di',
          options: [
            { label: 'Home', value: 'home' },
            { label: 'Harga', value: 'harga' },
            { label: 'Layanan: Landing Page', value: 'layanan:lp' },
            { label: 'Layanan: Company Profile', value: 'layanan:cp' },
            { label: 'Layanan: Toko Online', value: 'layanan:toko' },
            { label: 'Layanan: Aplikasi', value: 'layanan:app' },
            { label: 'Layanan: SEO & GEO', value: 'layanan:seo' },
          ],
          defaultValue: ['home'],
        }),
        order: fields.integer({ label: 'Urutan', defaultValue: 99 }),
        locale: fields.select({
          label: 'Bahasa',
          options: [
            { label: 'Indonesia', value: 'id' },
            { label: 'English', value: 'en' },
            { label: 'العربية', value: 'ar' },
          ],
          defaultValue: 'id',
        }),
      },
    }),
    storeProducts: collection({
      label: 'Produk Rafizastore',
      slugField: 'name',
      path: 'src/content/storeProducts/*',
      format: { data: 'json' },
      schema: {
        name: fields.slug({ name: { label: 'Nama produk' } }),
        price: fields.text({ label: 'Harga (teks)', description: 'Contoh: Rp49.000' }),
        image: fields.image({
          label: 'Foto',
          directory: 'public/images/store',
          publicPath: '/images/store/',
        }),
        url: fields.url({ label: 'Link produk', validation: { isRequired: true } }),
        order: fields.integer({ label: 'Urutan', defaultValue: 99 }),
      },
    }),
  },
  singletons: {
    settings: singleton({
      label: 'Pengaturan situs',
      path: 'src/content/settings',
      format: { data: 'json' },
      schema: {
        businessName: fields.text({ label: 'Nama bisnis' }),
        tagline: fields.text({ label: 'Tagline' }),
        whatsapp: fields.text({ label: 'Nomor WhatsApp (format 628…)', validation: { isRequired: true } }),
        whatsappDisplay: fields.text({ label: 'Nomor WhatsApp (tampilan)' }),
        email: fields.text({ label: 'Email' }),
        address: fields.object(
          {
            street: fields.text({ label: 'Jalan' }),
            city: fields.text({ label: 'Kota' }),
            region: fields.text({ label: 'Provinsi' }),
            postal: fields.text({ label: 'Kode pos' }),
            country: fields.text({ label: 'Kode negara', defaultValue: 'ID' }),
          },
          { label: 'Alamat' },
        ),
        hours: fields.text({ label: 'Jam operasional', description: 'Contoh: Senin–Sabtu, 08.00–17.00 WIB' }),
        geo: fields.object(
          { lat: fields.text({ label: 'Latitude' }), lng: fields.text({ label: 'Longitude' }) },
          { label: 'Koordinat' },
        ),
        gbpUrl: fields.text({ label: 'URL Google Business Profile' }),
        gbpUrlIsPlaceholder: fields.checkbox({ label: 'URL GBP masih sementara', defaultValue: true }),
        foundingDate: fields.text({ label: 'Tanggal berdiri (YYYY-MM)' }),
        rating: fields.text({ label: 'Rating Google (mis. 5,0)' }),
        reviewCount: fields.integer({ label: 'Jumlah ulasan Google' }),
        ratingIsDummy: fields.checkbox({ label: 'Rating masih DUMMY', defaultValue: true }),
        reviewsEnabled: fields.checkbox({
          label: 'Tampilkan rating dan ulasan klien di situs',
          description: 'Matikan sampai rating dan ulasan Google asli tersedia.',
          defaultValue: false,
        }),
        liveSites: fields.text({ label: 'Jumlah website klien live (mis. 6+)' }),
        liveSitesVerified: fields.checkbox({
          label: 'Jumlah website live sudah diverifikasi',
          defaultValue: false,
        }),
        replyPromise: fields.text({ label: 'Janji waktu balas (ID)' }),
        replyPromiseVerified: fields.checkbox({
          label: 'Janji waktu balas dikonfirmasi',
          defaultValue: false,
        }),
        socials: fields.object(
          {
            instagram: fields.text({ label: 'Instagram' }),
            tiktok: fields.text({ label: 'TikTok' }),
            youtube: fields.text({ label: 'YouTube' }),
            facebook: fields.text({ label: 'Facebook' }),
            lynk: fields.text({ label: 'Rafizastore (lynk.id)' }),
          },
          { label: 'Sosial media' },
        ),
        founder: fields.object(
          {
            name: fields.text({ label: 'Nama founder' }),
            fullName: fields.text({ label: 'Nama lengkap' }),
            jobTitle: fields.text({ label: 'Jabatan' }),
            photo: fields.text({ label: 'Path foto (mis. /images/founder.webp)' }),
            bio: fields.text({ label: 'Bio', multiline: true }),
            sameAs: fields.array(fields.url({ label: 'URL profil' }), {
              label: 'Profil publik (LinkedIn, GitHub, dll.)',
              itemLabel: (x) => x.value ?? '',
            }),
            knowsAbout: fields.array(fields.text({ label: 'Keahlian' }), {
              label: 'Keahlian',
              itemLabel: (x) => x.value,
            }),
          },
          { label: 'Founder' },
        ),
        revisionCount: fields.text({ label: 'Jumlah revisi desain' }),
      },
    }),
    services: singleton({
      label: 'Layanan',
      path: 'src/content/services',
      format: { data: 'json' },
      schema: {
        arReviewed: fields.checkbox({ label: 'Teks Arab sudah direview penutur asli', defaultValue: false }),
        items: fields.array(
          fields.object({
            key: fields.text({ label: 'Kunci (lp, cp, toko, app, seo, kelas)' }),
            slug: fields.text({ label: 'Slug ID (kosong = tanpa halaman detail)' }),
            slugEn: fields.text({ label: 'Slug EN/AR' }),
            soon: fields.checkbox({ label: 'Segera hadir', defaultValue: false }),
            priceFrom: fields.integer({ label: 'Harga mulai (angka, kosong = lewat konsultasi)' }),
            plan: fields.text({ label: 'Paket terkait (starter/growth/prime)' }),
            ...l10n(() => ({
              name: text('Nama'),
              tagline: text('Tagline'),
              priceShort: text('Harga singkat (chip)'),
              price: text('Harga (panel)'),
              desc: text('Deskripsi', true),
              points: fields.array(text('Poin'), { label: 'Poin', itemLabel: (p) => p.value }),
              problems: fields.array(text('Masalah'), {
                label: 'Masalah yang diselesaikan',
                itemLabel: (p) => p.value,
              }),
            })),
          }),
          { label: 'Daftar layanan', itemLabel: (p) => p.fields.id.fields.name.value },
        ),
      },
    }),
    plans: singleton({
      label: 'Paket harga',
      path: 'src/content/plans',
      format: { data: 'json' },
      schema: {
        arReviewed: fields.checkbox({ label: 'Teks Arab sudah direview penutur asli', defaultValue: false }),
        defaultStage: fields.text({ label: 'Tahap default', defaultValue: 'tumbuh' }),
        stages: fields.array(
          fields.object({
            key: text('Kunci tahap'),
            plan: text('Paket (starter/growth/prime)'),
            id: text('Label ID'),
            en: text('Label EN'),
            ar: text('Label AR [REVIEW AR]'),
          }),
          { label: 'Tahap bisnis', itemLabel: (p) => p.fields.id.value },
        ),
        plans: fields.array(
          fields.object({
            key: text('Kunci paket'),
            price: fields.integer({ label: 'Harga (Rp)' }),
            renewal: fields.integer({ label: 'Perpanjangan per tahun (Rp)' }),
            pages: text('Jumlah halaman'),
            articles: fields.integer({ label: 'Artikel blog', defaultValue: 0 }),
            emails: fields.integer({ label: 'Email bisnis', defaultValue: 0 }),
            supportMonths: fields.integer({ label: 'Support (bulan)', defaultValue: 1 }),
            ...l10n(() => ({
              name: text('Nama'),
              desc: text('Deskripsi'),
              time: text('Waktu pengerjaan'),
              features: fields.array(text('Fitur'), { label: 'Fitur', itemLabel: (p) => p.value }),
            })),
          }),
          { label: 'Paket', itemLabel: (p) => p.fields.id.fields.name.value },
        ),
      },
    }),
    process: singleton({
      label: 'Proses kerja',
      path: 'src/content/process',
      format: { data: 'json' },
      schema: {
        arReviewed: fields.checkbox({ label: 'Teks Arab sudah direview penutur asli', defaultValue: false }),
        steps: fields.array(
          fields.object({
            day: text('Label hari'),
            ...l10n(() => ({ title: text('Judul'), desc: text('Deskripsi', true) })),
          }),
          { label: 'Langkah', itemLabel: (p) => p.fields.id.fields.title.value },
        ),
      },
    }),
  },
});
