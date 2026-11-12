import { afterEach, describe, expect, it, vi } from 'vitest';
import { appendToSheet } from '../../src/lib/server/sheets';

afterEach(() => vi.unstubAllGlobals());
const mock = (status: number, body: string) =>
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response(body, { status })),
  );

describe('appendToSheet', () => {
  it('ok bila skrip menjawab {ok:true} dan mengirim sheet + data', async () => {
    mock(200, '{"ok":true}');
    expect(await appendToSheet('https://x/exec', 'waitlist', { email: 'a@b.co' })).toBe('ok');
    const body = JSON.parse((fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0]![1].body);
    expect(body).toMatchObject({ sheet: 'waitlist', email: 'a@b.co' });
  });
  it('duplicate bila skrip memberi tahu', async () => {
    mock(200, '{"ok":true,"duplicate":true}');
    expect(await appendToSheet('https://x/exec', 'waitlist', { email: 'a@b.co' })).toBe('duplicate');
  });
  it('error bila skrip gagal', async () => {
    mock(500, 'boom');
    expect(await appendToSheet('https://x/exec', 'messages', {})).toBe('error');
  });
});
