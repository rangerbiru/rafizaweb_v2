/**
 * Tujuan penyimpanan sementara: Google Apps Script web app yang menulis ke Google Sheets.
 * Dipakai hanya bila Supabase belum dikonfigurasi (lihat endpoint.ts dan docs/SHEETS.md).
 * Apps Script menjawab 302 ke googleusercontent.com setelah menjalankan skrip; fetch mengikuti redirect itu.
 */
import type { InsertResult } from './supabase';

export async function appendToSheet(
  url: string,
  table: 'messages' | 'waitlist',
  row: Record<string, unknown>,
): Promise<InsertResult> {
  try {
    const res = await fetch(url, {
      method: 'POST',
      // text/plain agar tidak memicu preflight CORS di sisi Apps Script
      headers: { 'content-type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ sheet: table, createdAt: new Date().toISOString(), ...row }),
      redirect: 'follow',
    });
    const text = await res.text();
    let data: { ok?: boolean; duplicate?: boolean } = {};
    try {
      data = JSON.parse(text);
    } catch {
      /* skrip belum mengembalikan JSON */
    }
    if (data.duplicate) return 'duplicate';
    if (res.ok && data.ok !== false) return 'ok';
    console.error('[sheets] gagal', res.status, text.slice(0, 200));
    return 'error';
  } catch (err) {
    console.error('[sheets] error', err);
    return 'error';
  }
}
