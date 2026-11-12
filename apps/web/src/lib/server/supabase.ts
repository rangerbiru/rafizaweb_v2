/**
 * Akses Supabase lewat REST (PostgREST) dengan service role key — HANYA di server.
 * RLS aktif tanpa policy publik, jadi hanya service role yang bisa insert/select.
 */
export type SupabaseConfig = { url: string; key: string };

const headers = (c: SupabaseConfig, extra: Record<string, string> = {}) => ({
  apikey: c.key,
  authorization: `Bearer ${c.key}`,
  'content-type': 'application/json',
  ...extra,
});

export type InsertResult = 'ok' | 'duplicate' | 'error';

export async function insertRow(
  c: SupabaseConfig,
  table: 'messages' | 'waitlist',
  row: Record<string, unknown>,
): Promise<InsertResult> {
  const res = await fetch(`${c.url}/rest/v1/${table}`, {
    method: 'POST',
    headers: headers(c, { prefer: 'return=minimal' }),
    body: JSON.stringify(row),
  });
  if (res.ok) return 'ok';
  if (res.status === 409) return 'duplicate';
  console.error(`[supabase] insert ${table} gagal`, res.status, await res.text().catch(() => ''));
  return 'error';
}

/** Jumlah baris dari ip_hash yang sama sejak waktu tertentu (untuk rate limit). */
export async function countSince(
  c: SupabaseConfig,
  table: 'messages' | 'waitlist',
  ipHash: string,
  since: Date,
): Promise<number> {
  const q = new URLSearchParams({
    select: 'id',
    ip_hash: `eq.${ipHash}`,
    created_at: `gte.${since.toISOString()}`,
  });
  const res = await fetch(`${c.url}/rest/v1/${table}?${q}`, {
    headers: headers(c, { prefer: 'count=exact', range: '0-0' }),
  });
  const total = res.headers.get('content-range')?.split('/')[1];
  return total && total !== '*' ? Number(total) : 0;
}
