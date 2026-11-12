/** Kirim email via Resend API. Tanpa RESEND_API_KEY (dev), email hanya dicatat ke log. */
export type Mail = { to: string; subject: string; html: string; replyTo?: string };

export async function sendMail(apiKey: string | undefined, from: string, mail: Mail): Promise<boolean> {
  if (!apiKey) {
    console.info('[mail:dev]', mail.to, mail.subject);
    return true;
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [mail.to],
        subject: mail.subject,
        html: mail.html,
        ...(mail.replyTo ? { reply_to: mail.replyTo } : {}),
      }),
    });
    if (!res.ok) console.error('[mail] gagal', res.status, await res.text().catch(() => ''));
    return res.ok;
  } catch (err) {
    console.error('[mail] error', err);
    return false;
  }
}

export const esc = (s: unknown) =>
  String(s ?? '').replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  );

/** Nomor WA pengirim → link wa.me siap klik (0813… → 62813…). */
export function waLinkFor(number: string): string {
  let n = number.replace(/[^0-9]/g, '');
  if (n.startsWith('0')) n = `62${n.slice(1)}`;
  return `https://wa.me/${n}`;
}
