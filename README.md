# Rafizaweb v2

Rebuild rafizaweb.com: Astro + Keystatic + Supabase, SEO dan GEO friendly, 3 bahasa (ID/EN/AR).

## Menjalankan

```bash
nvm use            # Node 26 (lihat .nvmrc)
npm i -g pnpm
pnpm install
pnpm dev           # http://localhost:4321, admin CMS di /keystatic
```

Dokumen penting: `docs/decisions/ADR-001-hosting.md` (deploy), `docs/BACKEND.md` (Supabase/Turnstile/Resend),
`docs/CARA-MENULIS-ARTIKEL.md` (panduan CMS), `docs/LAUNCH.md` (go-live), `docs/url-inventory.csv` (URL lama).

## Mulai dengan Claude Code

1. Pastikan Node.js LTS, pnpm (`npm i -g pnpm`), dan git terpasang.
2. Buka terminal di folder ini, jalankan `git init`, lalu `claude`.
3. Tempel **Prompt 0** dari `docs/PROMPTS.md`, kemudian lanjutkan fase demi fase (Prompt 1 sampai 9).

## Isi paket

| Path | Untuk apa |
|---|---|
| `CLAUDE.md` | Instruksi tetap yang dibaca Claude Code otomatis setiap sesi (stack, token, aturan) |
| `docs/PRD.md` | Product Requirements Document lengkap: scope, spesifikasi, SEO/GEO, backend, roadmap, acceptance criteria |
| `docs/CONTENT.md` | Semua teks, harga, klien, FAQ, kontak dalam 3 bahasa (sumber fakta) |
| `docs/PROMPTS.md` | Prompt siap tempel per fase + prompt utilitas |
| `design/home.dc.html` | Sumber desain Home final dari kanvas |
| `design/README.md` | Cara membaca file desain dan peta interaksi |
| `design/screenshots/` | Render Home desktop 1440px dan mobile 390px (utuh + potongan) |

## Sebelum launch (ringkas)

Lengkapi data di PRD §14:

- Ulasan Google asli (yang sekarang **dummy**)
- Jam operasional
- Nama dan foto founder
- Jumlah revisi
- Label hari proses kerja
- Domain 2 klien
- Produk Rafizastore
- Logo SVG
- Koordinat dan URL Google Business Profile
