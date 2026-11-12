/**
 * Form waitlist Academy (Home) dan form kontak (/kontak/).
 * Progressive enhancement: tanpa JS form tetap POST biasa ke endpoint (redirect ?terkirim=1).
 * Dengan JS: validasi inline (aria-invalid + aria-describedby), fokus ke field error pertama,
 * kirim JSON ke /api/*, state loading/sukses/error. Turnstile dimuat lazy saat form dipakai.
 */
import { track } from './analytics';

const TURNSTILE_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
let turnstileLoading = false;
function loadTurnstile() {
  if (turnstileLoading || !document.querySelector('.cf-turnstile')) return;
  turnstileLoading = true;
  const s = document.createElement('script');
  s.src = TURNSTILE_SRC;
  s.async = true;
  s.defer = true;
  document.head.appendChild(s);
}

const PHONE_RE = /^\+?[0-9 -]{8,20}$/;
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

type ApiResult = { ok: boolean; errors?: Record<string, string> };

async function postForm(form: HTMLFormElement): Promise<ApiResult> {
  const data = Object.fromEntries(new FormData(form).entries());
  const res = await fetch(form.action, {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify(data),
  });
  let body: ApiResult = { ok: false };
  try {
    body = (await res.json()) as ApiResult;
  } catch {
    /* non-JSON */
  }
  if (!res.ok && body.ok) body.ok = false;
  return body;
}

/* ---------------- Waitlist ---------------- */
document.querySelectorAll<HTMLElement>('[data-waitlist]').forEach((root) => {
  const form = root.querySelector<HTMLFormElement>('[data-waitlist-form]');
  const open = root.querySelector<HTMLButtonElement>('[data-waitlist-open]');
  const retry = root.querySelector<HTMLButtonElement>('[data-waitlist-retry]');
  const err = root.querySelector<HTMLElement>('[data-waitlist-err]');
  const done = root.querySelector<HTMLElement>('[data-waitlist-done]');
  const waLink = root.querySelector<HTMLAnchorElement>('[data-waitlist-wa]');
  const nameInput = form?.querySelector<HTMLInputElement>('input[name="name"]');
  const phone = form?.querySelector<HTMLInputElement>('input[name="whatsapp"]');
  const email = form?.querySelector<HTMLInputElement>('input[name="email"]');
  const consent = form?.querySelector<HTMLInputElement>('input[name="consent"]');
  const submit = form?.querySelector<HTMLButtonElement>('button[type="submit"]');
  if (!form || !nameInput || !phone || !email || !consent || !submit) return;
  const msgs = {
    name: root.dataset.errName ?? '',
    phone: root.dataset.errPhone ?? '',
    email: root.dataset.errEmail ?? '',
    consent: root.dataset.errConsent ?? '',
  };

  const setState = (s: 'idle' | 'form' | 'sending' | 'done' | 'error') => {
    root.dataset.state = s;
    submit.textContent = s === 'sending' ? (submit.dataset.sending ?? '…') : (submit.dataset.label ?? '');
    submit.disabled = s === 'sending';
  };

  // Jika kembali dari POST tanpa JS (?terkirim=1#waitlist-terkirim).
  if (location.hash === '#waitlist-terkirim') setState('done');

  open?.addEventListener('click', () => {
    setState('form');
    open.setAttribute('aria-expanded', 'true');
    loadTurnstile();
    requestAnimationFrame(() => nameInput.focus());
  });
  retry?.addEventListener('click', () => {
    setState('form');
    requestAnimationFrame(() => nameInput.focus());
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const checks: [HTMLInputElement, boolean, string][] = [
      [nameInput, nameInput.value.trim().length < 2, msgs.name],
      [email, !EMAIL_RE.test(email.value.trim()), msgs.email],
      [phone, !PHONE_RE.test(phone.value.trim()), msgs.phone],
      [consent, !consent.checked, msgs.consent],
    ];
    for (const [el, bad] of checks) el.setAttribute('aria-invalid', String(bad));
    const first = checks.find(([, bad]) => bad);
    if (first) {
      if (err) err.textContent = first[2];
      first[0].focus();
      return;
    }
    if (err) err.textContent = '';
    // Kirim data ke WhatsApp Rafizaweb (pesan terisi otomatis). Dibuka di sini, selagi masih dalam aksi klik pengguna,
    // agar tidak diblokir pop-up blocker. Tombol di state "done" menjadi cadangan.
    const waUrl =
      (root.dataset.waBase ?? '') +
      encodeURIComponent(
        (root.dataset.waTpl ?? '')
          .replace('{name}', nameInput.value.trim())
          .replace('{email}', email.value.trim())
          .replace('{phone}', phone.value.trim()),
      );
    if (waLink) {
      waLink.href = waUrl;
      waLink.hidden = false;
    }
    window.open(waUrl, '_blank', 'noopener');
    setState('sending');
    try {
      const r = await postForm(form);
      if (r.ok) {
        setState('done');
        track('submit_waitlist', { product: 'academy' });
        requestAnimationFrame(() => done?.focus());
      } else if (r.errors?.email) {
        setState('form');
        if (err) err.textContent = r.errors.email;
        email.setAttribute('aria-invalid', 'true');
        email.focus();
      } else {
        setState('error');
      }
    } catch {
      setState('error');
    }
  });
});

/* ---------------- Form kontak ---------------- */
document.querySelectorAll<HTMLFormElement>('[data-contact-form]').forEach((form) => {
  const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  const status = form.querySelector<HTMLElement>('[data-form-status]');
  const success = document.getElementById('kontak-terkirim');
  let messages: Record<string, string> = {};
  try {
    messages = JSON.parse(form.dataset.messages ?? '{}');
  } catch {
    /* default kosong */
  }
  form.addEventListener('focusin', loadTurnstile, { once: true });

  const fieldErr = (name: string) => form.querySelector<HTMLElement>(`[data-error-for="${name}"]`);
  const setError = (name: string, msg: string) => {
    const input = form.elements.namedItem(name) as HTMLInputElement | null;
    const box = fieldErr(name);
    if (input) input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (box) box.textContent = msg;
  };

  function validate(): Record<string, string> {
    const f = (n: string) => ((form.elements.namedItem(n) as HTMLInputElement | null)?.value ?? '').trim();
    const errs: Record<string, string> = {};
    if (f('name').length < 2) errs.name = messages.name ?? '';
    if (!/^\+?[0-9 -]{8,20}$/.test(f('whatsapp'))) errs.whatsapp = messages.whatsapp ?? '';
    if (f('email') && !EMAIL_RE.test(f('email'))) errs.email = messages.email ?? '';
    if (f('message').length < 10) errs.message = messages.message ?? '';
    const consent = form.elements.namedItem('consent') as HTMLInputElement | null;
    if (consent && !consent.checked) errs.consent = messages.consent ?? '';
    return errs;
  }

  function showErrors(errs: Record<string, string>) {
    const names = ['name', 'whatsapp', 'email', 'service', 'budget', 'message', 'consent'];
    for (const n of names) setError(n, errs[n] ?? '');
    const first = names.find((n) => errs[n]);
    if (first) (form.elements.namedItem(first) as HTMLElement | null)?.focus();
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errs = validate();
    showErrors(errs);
    if (Object.keys(errs).length) return;
    if (submit) {
      submit.disabled = true;
      submit.dataset.label ??= submit.textContent ?? '';
      submit.textContent = submit.dataset.sending ?? '…';
    }
    if (status) status.textContent = '';
    try {
      const r = await postForm(form);
      if (r.ok) {
        const fd = new FormData(form);
        track('submit_contact', {
          service: String(fd.get('service') ?? ''),
          budget: String(fd.get('budget') ?? ''),
        });
        form.reset();
        form.hidden = true;
        if (success) {
          success.setAttribute('data-show', '');
          success.focus();
        }
      } else if (r.errors && Object.keys(r.errors).length) {
        showErrors(r.errors);
      } else if (status) {
        status.textContent = messages.server ?? '';
      }
    } catch {
      if (status) status.textContent = messages.network ?? '';
    } finally {
      if (submit) {
        submit.disabled = false;
        submit.textContent = submit.dataset.label ?? '';
      }
    }
  });
});
