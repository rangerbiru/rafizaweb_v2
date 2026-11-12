import type { APIRoute } from 'astro';
import { llmsTxt } from '../lib/llms';

export const GET: APIRoute = async () =>
  new Response(await llmsTxt(false), { headers: { 'content-type': 'text/plain; charset=utf-8' } });
