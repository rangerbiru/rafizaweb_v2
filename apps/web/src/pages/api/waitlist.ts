import type { APIRoute } from 'astro';
import { runForm } from '../../lib/server/endpoint';
import { handleWaitlist } from '../../lib/server/handlers';

export const prerender = false;
export const POST: APIRoute = (ctx) => runForm(ctx, handleWaitlist, '#waitlist-terkirim');
