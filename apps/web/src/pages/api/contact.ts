import type { APIRoute } from 'astro';
import { runForm } from '../../lib/server/endpoint';
import { handleContact } from '../../lib/server/handlers';

export const prerender = false;
export const POST: APIRoute = (ctx) => runForm(ctx, handleContact, '#kontak-terkirim');
