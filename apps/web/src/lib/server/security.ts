/** Utilitas keamanan endpoint: hash IP harian, cek Origin, ambil IP klien. */

export async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** ip_hash = SHA-256(IP + salt harian). IP mentah tidak pernah disimpan. */
export async function ipHash(ip: string, salt: string, now = new Date()): Promise<string> {
  return sha256Hex(`${ip}|${salt}|${now.toISOString().slice(0, 10)}`);
}

export function clientIp(req: Request): string {
  return (
    req.headers.get('cf-connecting-ip') ??
    req.headers.get('x-real-ip') ??
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    '0.0.0.0'
  );
}

/** Tolak origin asing. Request tanpa header Origin (mis. curl) juga ditolak. */
export function originAllowed(req: Request, siteUrl?: string): boolean {
  const origin = req.headers.get('origin');
  if (!origin) return false;
  const allowed = new Set([new URL(req.url).origin, 'https://rafizaweb.com', 'https://www.rafizaweb.com']);
  if (siteUrl) allowed.add(new URL(siteUrl).origin);
  if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return true;
  return allowed.has(origin);
}
