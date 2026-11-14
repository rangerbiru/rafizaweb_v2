/**
 * DRAF kebijakan privasi & syarat ketentuan (PRD §7). Wajib direview ahli hukum sebelum tayang.
 * [REVIEW AR] Teks Arab wajib direview penutur asli.
 */
import type { Locale } from './routes';

type Doc = { updated: string; sections: { h: string; p: string[] }[] };
type Legal = { privacy: Doc; terms: Doc };

const UPDATED = '2026-11-08';

const id: Legal = {
  privacy: {
    updated: UPDATED,
    sections: [
      {
        h: 'Siapa kami',
        p: [
          'Rafizaweb adalah jasa pembuatan website di BTR 2, Jl. Kakatua 2 No.49 Blok K1, Burangkeng, Kec. Setu, Kota Bekasi, Jawa Barat 17530. Kebijakan ini menjelaskan bagaimana kami memproses data pribadi sesuai Undang-Undang No. 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP).',
        ],
      },
      {
        h: 'Data yang kami kumpulkan',
        p: [
          'Form kontak: nama, nomor WhatsApp, email (opsional), jenis layanan, perkiraan budget, isi pesan, bahasa halaman, halaman asal, parameter kampanye (UTM), dan persetujuan Anda.',
          'Daftar tunggu Rafizaweb Academy: alamat email, bahasa halaman, halaman asal, dan persetujuan Anda.',
          'Data teknis: alamat IP yang langsung diubah menjadi hash satu arah (tidak disimpan dalam bentuk asli) dan jenis peramban (user agent), untuk mencegah spam dan penyalahgunaan.',
          'Analytics: jika diaktifkan, kami memakai Google Analytics 4 dengan IP dianonimkan untuk memahami penggunaan situs secara agregat.',
        ],
      },
      {
        h: 'Tujuan pemrosesan',
        p: [
          'Menjawab pertanyaan dan permintaan konsultasi Anda, mengirim kabar saat kelas Rafizaweb Academy dibuka, menjaga keamanan formulir dari spam, serta meningkatkan kualitas situs.',
          'Kami tidak menjual data pribadi Anda kepada pihak mana pun.',
        ],
      },
      {
        h: 'Dasar pemrosesan',
        p: [
          'Persetujuan yang Anda berikan lewat kotak centang pada formulir, serta kepentingan yang sah untuk menjaga keamanan layanan.',
        ],
      },
      {
        h: 'Penyimpanan dan pihak pemroses',
        p: [
          'Data formulir disimpan di basis data Supabase (server region Singapura). Notifikasi email dikirim melalui Resend. Perlindungan spam memakai Cloudflare Turnstile. Situs di-hosting di Cloudflare.',
          'Data disimpan selama diperlukan untuk tujuan di atas, dan dapat dihapus lebih awal atas permintaan Anda.',
        ],
      },
      {
        h: 'Hak Anda',
        p: [
          'Sesuai UU PDP, Anda berhak meminta akses, perbaikan, penghapusan data, menarik persetujuan, dan mengajukan keberatan atas pemrosesan. Kirim permintaan ke admin@rafizaweb.com atau WhatsApp +62 813-1743-5630.',
        ],
      },
      {
        h: 'Perubahan kebijakan',
        p: ['Kebijakan ini dapat diperbarui. Tanggal pembaruan terakhir tercantum di halaman ini.'],
      },
    ],
  },
  terms: {
    updated: UPDATED,
    sections: [
      {
        h: 'Lingkup layanan',
        p: [
          'Rafizaweb menyediakan jasa pembuatan website (landing page, company profile, toko online), aplikasi web & mobile, serta SEO & GEO sesuai paket atau kesepakatan tertulis dengan klien.',
          'Isi setiap paket mengikuti rincian di halaman Harga pada saat pemesanan.',
        ],
      },
      {
        h: 'Pembayaran',
        p: [
          'Pembayaran mengikuti kesepakatan tertulis di awal proyek. Pengerjaan dimulai setelah uang muka diterima dan materi yang dibutuhkan diserahkan klien; sisa pembayaran dilunasi sebelum website tayang. Pembayaran dilakukan lewat transfer bank atau dompet digital, dan bukti pembayaran dikonfirmasi lewat WhatsApp atau email.',
        ],
      },
      {
        h: 'Waktu pengerjaan dan materi',
        p: [
          'Estimasi waktu pengerjaan: 4–7 hari kerja (Starter UMKM), 5–9 hari kerja (Bisnis Growth), dan sekitar 15 hari kerja (Bisnis Prime), dihitung setelah materi dari klien lengkap.',
        ],
      },
      {
        h: 'Revisi',
        p: ['Setiap paket termasuk 3 kali revisi desain sebelum website tayang.'],
      },
      {
        h: 'Garansi dan support',
        p: [
          'Perbaikan bug, panduan penggunaan fitur, dan konsultasi update konten selama 1 bulan untuk Starter UMKM, atau 3 bulan untuk Bisnis Growth dan Bisnis Prime.',
        ],
      },
      {
        h: 'Perpanjangan',
        p: [
          'Paket sudah termasuk hosting dan domain .com tahun pertama. Perpanjangan Rp500.000/tahun untuk Starter UMKM dan Bisnis Growth, serta Rp1.000.000/tahun untuk Bisnis Prime.',
        ],
      },
      {
        h: 'Kepemilikan aset',
        p: [
          'Setelah pembayaran lunas, klien berhak menggunakan website beserta konten dan desain yang dibuat khusus untuk proyeknya, dan domain serta akses admin diserahkan kepada klien. Aset pihak ketiga seperti font, foto stok, dan plugin tetap mengikuti lisensi masing-masing. Rafizaweb dapat menampilkan website yang sudah tayang sebagai portofolio, kecuali klien menyatakan keberatan secara tertulis.',
        ],
      },
      {
        h: 'Pembatalan',
        p: [
          'Klien dapat membatalkan proyek dengan memberi tahu Rafizaweb secara tertulis lewat WhatsApp atau email. Pekerjaan yang sudah berjalan sampai saat pembatalan tetap dihitung, dan uang muka tidak dikembalikan bila pengerjaan sudah dimulai. Jika Rafizaweb tidak dapat menyelesaikan proyek sesuai kesepakatan, pembayaran untuk pekerjaan yang belum dikerjakan dikembalikan.',
        ],
      },
      {
        h: 'Kontak',
        p: [
          'Pertanyaan tentang syarat ini dapat dikirim ke admin@rafizaweb.com atau WhatsApp +62 813-1743-5630.',
        ],
      },
    ],
  },
};

const en: Legal = {
  privacy: {
    updated: UPDATED,
    sections: [
      {
        h: 'Who we are',
        p: [
          'Rafizaweb is a website design service located at BTR 2, Jl. Kakatua 2 No.49 Blok K1, Burangkeng, Setu, Bekasi City, West Java 17530, Indonesia. This policy explains how we process personal data under Indonesian Law No. 27 of 2022 on Personal Data Protection (PDP Law).',
        ],
      },
      {
        h: 'Data we collect',
        p: [
          'Contact form: name, WhatsApp number, email (optional), service type, estimated budget, message, page language, source page, campaign parameters (UTM), and your consent.',
          'Rafizaweb Academy waitlist: email address, page language, source page, and your consent.',
          'Technical data: your IP address, immediately converted into a one-way hash (never stored in raw form), and your browser type (user agent), to prevent spam and abuse.',
          'Analytics: if enabled, we use Google Analytics 4 with anonymized IP to understand site usage in aggregate.',
        ],
      },
      {
        h: 'Why we process it',
        p: [
          'To answer your questions and consultation requests, to notify you when Rafizaweb Academy classes open, to protect our forms from spam, and to improve the site.',
          'We never sell your personal data.',
        ],
      },
      {
        h: 'Legal basis',
        p: [
          'Your consent given through the form checkbox, and our legitimate interest in keeping the service secure.',
        ],
      },
      {
        h: 'Storage and processors',
        p: [
          'Form data is stored in a Supabase database (Singapore region). Email notifications are sent through Resend. Spam protection uses Cloudflare Turnstile. The site is hosted on Cloudflare.',
          'Data is kept as long as needed for these purposes and can be deleted earlier on request.',
        ],
      },
      {
        h: 'Your rights',
        p: [
          'Under the PDP Law you may request access, correction, or deletion of your data, withdraw consent, and object to processing. Send requests to admin@rafizaweb.com or WhatsApp +62 813-1743-5630.',
        ],
      },
      { h: 'Changes', p: ['We may update this policy. The last updated date is shown on this page.'] },
    ],
  },
  terms: {
    updated: UPDATED,
    sections: [
      {
        h: 'Scope of service',
        p: [
          'Rafizaweb provides website design (landing pages, company profiles, online stores), web & mobile apps, and SEO & GEO services according to the chosen package or a written agreement.',
          'Each package includes what is listed on the Pricing page at the time of ordering.',
        ],
      },
      {
        h: 'Payment',
        p: [
          'Payment follows the written agreement made at the start of the project. Work begins after the down payment is received and the client has provided the required materials; the remaining balance is paid before the website goes live. Payment is made by bank transfer or e-wallet, and proof of payment is confirmed via WhatsApp or email.',
        ],
      },
      {
        h: 'Timeline and materials',
        p: [
          'Estimated delivery: 4–7 working days (Small Business Starter), 5–9 working days (Business Growth), and about 15 working days (Business Prime), counted once all client materials are complete.',
        ],
      },
      {
        h: 'Revisions',
        p: ['Every package includes 3 design revisions before the website goes live.'],
      },
      {
        h: 'Warranty and support',
        p: [
          'Bug fixes, feature guidance, and content update consultations for 1 month (Small Business Starter) or 3 months (Business Growth and Business Prime).',
        ],
      },
      {
        h: 'Renewal',
        p: [
          'Packages include hosting and a .com domain for the first year. Renewal is Rp500,000/year for Small Business Starter and Business Growth, and Rp1,000,000/year for Business Prime.',
        ],
      },
      {
        h: 'Asset ownership',
        p: [
          'Once paid in full, the client may use the website and the content and design created specifically for the project, and the domain and admin access are handed over to the client. Third-party assets such as fonts, stock photos, and plugins remain subject to their own licenses. Rafizaweb may showcase the live website in its portfolio unless the client objects in writing.',
        ],
      },
      {
        h: 'Cancellation',
        p: [
          'The client may cancel a project by notifying Rafizaweb in writing via WhatsApp or email. Work already carried out up to the cancellation is still charged, and the down payment is not refunded once work has started. If Rafizaweb is unable to complete the project as agreed, payment for work not yet carried out is refunded.',
        ],
      },
      {
        h: 'Contact',
        p: ['Questions about these terms can be sent to admin@rafizaweb.com or WhatsApp +62 813-1743-5630.'],
      },
    ],
  },
};

const ar: Legal = {
  privacy: {
    updated: UPDATED,
    sections: [
      {
        h: 'من نحن',
        p: [
          'رافيزا ويب خدمة تصميم مواقع إلكترونية في مدينة بيكاسي، جاوة الغربية، إندونيسيا. توضح هذه السياسة كيفية معالجتنا للبيانات الشخصية وفق القانون الإندونيسي رقم 27 لسنة 2022 بشأن حماية البيانات الشخصية.',
        ],
      },
      {
        h: 'البيانات التي نجمعها',
        p: [
          'نموذج التواصل: الاسم، رقم واتساب، البريد الإلكتروني (اختياري)، نوع الخدمة، الميزانية التقديرية، الرسالة، لغة الصفحة، الصفحة المصدر، معلمات الحملات (UTM)، وموافقتك.',
          'قائمة انتظار أكاديمية رافيزا ويب: البريد الإلكتروني، لغة الصفحة، الصفحة المصدر، وموافقتك.',
          'بيانات تقنية: عنوان IP يُحوَّل فورًا إلى بصمة أحادية الاتجاه (لا يُخزَّن بصيغته الأصلية) ونوع المتصفح، لمنع الرسائل المزعجة وإساءة الاستخدام.',
          'التحليلات: عند تفعيلها نستخدم Google Analytics 4 مع إخفاء عنوان IP لفهم استخدام الموقع بشكل إجمالي.',
        ],
      },
      {
        h: 'أغراض المعالجة',
        p: [
          'للرد على أسئلتك وطلبات الاستشارة، وإبلاغك عند افتتاح دورات الأكاديمية، وحماية النماذج من الرسائل المزعجة، وتحسين الموقع. لا نبيع بياناتك الشخصية أبدًا.',
        ],
      },
      {
        h: 'أساس المعالجة',
        p: ['موافقتك عبر خانة الاختيار في النموذج، ومصلحتنا المشروعة في الحفاظ على أمان الخدمة.'],
      },
      {
        h: 'التخزين والجهات المعالِجة',
        p: [
          'تُخزَّن بيانات النماذج في قاعدة بيانات Supabase (منطقة سنغافورة). تُرسل إشعارات البريد عبر Resend. تُستخدم Cloudflare Turnstile للحماية من الرسائل المزعجة، والموقع مستضاف على Cloudflare.',
        ],
      },
      {
        h: 'حقوقك',
        p: [
          'يحق لك طلب الوصول إلى بياناتك أو تصحيحها أو حذفها، وسحب موافقتك، والاعتراض على المعالجة. أرسل طلبك إلى admin@rafizaweb.com أو واتساب ‎+62 813-1743-5630.',
        ],
      },
      { h: 'التغييرات', p: ['قد نحدّث هذه السياسة. يظهر تاريخ آخر تحديث في هذه الصفحة.'] },
    ],
  },
  terms: {
    updated: UPDATED,
    sections: [
      {
        h: 'نطاق الخدمة',
        p: [
          'تقدم رافيزا ويب خدمات تصميم المواقع وتطبيقات الويب والجوال وتحسين محركات البحث وGEO وفق الباقة المختارة أو اتفاق مكتوب.',
        ],
      },
      {
        h: 'الدفع',
        p: [
          'يتبع الدفع الاتفاق المكتوب في بداية المشروع. يبدأ العمل بعد استلام الدفعة المقدمة وتسليم العميل المواد المطلوبة، ويُسدَّد المبلغ المتبقي قبل نشر الموقع. يتم الدفع عبر التحويل البنكي أو المحافظ الإلكترونية، ويُؤكَّد إثبات الدفع عبر واتساب أو البريد الإلكتروني.',
        ],
      },
      {
        h: 'مدة التنفيذ والمواد',
        p: [
          'مدة التنفيذ التقديرية: 4–7 أيام عمل (باقة البداية)، و5–9 أيام عمل (باقة النمو)، وحوالي 15 يوم عمل (الباقة المميزة)، بعد اكتمال مواد العميل.',
        ],
      },
      { h: 'التعديلات', p: ['تتضمن كل باقة 3 تعديلات على التصميم قبل النشر.'] },
      {
        h: 'الضمان والدعم',
        p: [
          'إصلاح الأخطاء والإرشاد واستشارات تحديث المحتوى لمدة شهر (باقة البداية) أو 3 أشهر (باقة النمو والباقة المميزة).',
        ],
      },
      {
        h: 'التجديد',
        p: [
          'تشمل الباقات الاستضافة ونطاق .com للسنة الأولى. التجديد 500,000 روبية سنويًا لباقة البداية وباقة النمو، و1,000,000 روبية سنويًا للباقة المميزة.',
        ],
      },
      {
        h: 'ملكية الأصول',
        p: [
          'بعد السداد الكامل يحق للعميل استخدام الموقع والمحتوى والتصميم المنجزين خصيصًا لمشروعه، وتُسلَّم إليه ملكية النطاق وصلاحيات الإدارة. تظل الأصول الخارجية مثل الخطوط والصور الجاهزة والإضافات خاضعة لتراخيصها. يجوز لرافيزا ويب عرض الموقع المنشور ضمن أعمالها ما لم يعترض العميل كتابيًا.',
        ],
      },
      {
        h: 'الإلغاء',
        p: [
          'يمكن للعميل إلغاء المشروع بإبلاغ رافيزا ويب كتابيًا عبر واتساب أو البريد الإلكتروني. يُحتسب العمل المنجز حتى لحظة الإلغاء، ولا تُسترد الدفعة المقدمة إذا بدأ العمل. وإذا تعذّر على رافيزا ويب إكمال المشروع وفق الاتفاق، يُرد المبلغ المقابل للعمل غير المنجز.',
        ],
      },
      { h: 'التواصل', p: ['للاستفسارات: admin@rafizaweb.com أو واتساب ‎+62 813-1743-5630.'] },
    ],
  },
};

const docs: Record<Locale, Legal> = { id, en, ar };
export const useLegal = (locale: Locale) => docs[locale];
