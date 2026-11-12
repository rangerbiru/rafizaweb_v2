/** Perekat runtime (Astro API route) ↔ handler: baca body JSON/form, cek Origin, respons JSON atau redirect (tanpa JS). */
import type { APIContext } from 'astro';
import { getSecret } from 'astro:env/server';
import { type Deps, type Result } from './handlers';
import { sendMail } from './mail';
import { clientIp, ipHash, originAllowed } from './security';
import { appendToSheet } from './sheets';
import { countSince, insertRow } from './supabase';
import { verifyTurnstile } from './turnstile';

const secret = (k: string) => {
  try {
    return getSecret(k) || undefined;
  } catch {
    return undefined;
  }
};

async function readBody(req: Request): Promise<{ data: Record<string, unknown>; isJson: boolean }> {
  const type = req.headers.get('content-type') ?? '';
  if (type.includes('application/json'))
    return { data: (await req.json().catch(() => ({}))) as Record<string, unknown>, isJson: true };
  const fd = await req.formData().catch(() => new FormData());
  return { data: Object.fromEntries([...fd.entries()].map(([k, v]) => [k, String(v)])), isJson: false };
}

export async function runForm(
  ctx: APIContext,
  handler: (raw: Record<string, unknown>, deps: Deps) => Promise<Result>,
  successHash: string,
): Promise<Response> {
  const req = ctx.request;
  if (!originAllowed(req, secret('PUBLIC_SITE_URL'))) {
    return Response.json({ ok: false, errors: { form: 'origin' } }, { status: 403 });
  }
  const { data, isJson } = await readBody(req);
  const ip = clientIp(req);
  const sbUrl = secret('SUPABASE_URL');
  const sbKey = secret('SUPABASE_SERVICE_ROLE_KEY');
  const sb = sbUrl && sbKey ? { url: sbUrl, key: sbKey } : null;
  const hash = await ipHash(ip, secret('IP_HASH_SALT') ?? 'dev-salt');
  const deps: Deps = {
    verifyTurnstile: (token) => verifyTurnstile(token, secret('TURNSTILE_SECRET_KEY'), ip),
    ipHash: hash,
    userAgent: req.headers.get('user-agent') ?? undefined,
    countRecent: (table, since) => (sb ? countSince(sb, table, hash, since) : Promise.resolve(0)),
    insert: async (table, row) => {
      if (sb) return insertRow(sb, table, row);
      const sheetUrl = secret('SHEETS_WEBHOOK_URL');
      if (sheetUrl) return appendToSheet(sheetUrl, table, row);
      console.info(`[dev] Supabase/Sheets belum dikonfigurasi, data tidak disimpan: ${table}`, row);
      return 'ok';
    },
    sendMail: (mail) =>
      sendMail(secret('RESEND_API_KEY'), secret('MAIL_FROM') ?? 'Rafizaweb <noreply@rafizaweb.com>', mail),
    mailTo: secret('MAIL_TO') ?? 'admin@rafizaweb.com',
  };
  const result = await handler(data, deps);

  if (isJson || req.headers.get('accept')?.includes('application/json')) {
    return Response.json(result.body, { status: result.status, headers: { 'cache-control': 'no-store' } });
  }
  // Fallback tanpa JS: kembali ke halaman asal.
  const back =
    typeof data.source_page === 'string' && data.source_page.startsWith('/') ? data.source_page : '/';
  const target = result.body.ok ? `${back}?terkirim=1${successHash}` : `${back}?gagal=1`;
  return ctx.redirect(target, 303);
}
