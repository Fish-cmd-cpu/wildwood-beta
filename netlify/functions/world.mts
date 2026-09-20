import { randomUUID, createHash } from 'node:crypto';
import { drizzle } from 'drizzle-orm/netlify-db';
import { eq } from 'drizzle-orm';
import type { Context, Config } from '@netlify/functions';
import * as schema from '../../db/schema.js';

/** Anonymous, cookie-scoped save slot. Browser code cannot choose another slot. */
export default async function handler(req: Request, context: Context) {
  const headers = { 'Cache-Control': 'no-store' };
  if (!['GET', 'PUT'].includes(req.method)) return new Response('Method not allowed', { status: 405, headers });
  if (req.method === 'PUT') {
    const origin = req.headers.get('origin');
    if (origin && origin !== new URL(req.url).origin) return new Response('Forbidden', { status: 403, headers });
    if (!req.headers.get('content-type')?.includes('application/json')) return new Response('JSON required', { status: 415, headers });
  }
  let token = context.cookies.get('wildwood-slot');
  if (!token || !/^[0-9a-f-]{36}$/.test(token)) {
    token = randomUUID();
    context.cookies.set({ name: 'wildwood-slot', value: token, httpOnly: true, secure: true, sameSite: 'Strict', path: '/', maxAge: 31536000 });
  }
  const id = createHash('sha256').update(token).digest('hex');
  try {
    const db = drizzle({ schema });
    if (req.method === 'GET') {
      const [world] = await db.select().from(schema.worlds).where(eq(schema.worlds.id, id)).limit(1);
      if (!world) return Response.json({ save: null }, { headers });
      const chunks = await db.select().from(schema.edits).where(eq(schema.edits.worldId, id));
      return Response.json({ save: { version: 1, seed: world.seed, player: world.player, inventory: world.inventory, progress: world.progress, updatedAt: world.updatedAt.getTime(), diffs: Object.fromEntries(chunks.map(c => [c.chunkKey, c.blocks])) } }, { headers });
    }
    const text = await req.text();
    if (text.length > 4_000_000) return new Response('Save too large', { status: 413, headers });
    const data = JSON.parse(text);
    if (typeof data.seed !== 'string' || data.seed.length > 80 || !data.player || !Array.isArray(data.player.position) || data.player.position.length !== 3 || !data.player.position.every((n: unknown) => typeof n === 'number' && Number.isFinite(n) && Math.abs(n) < 30000000) || !Array.isArray(data.inventory) || data.inventory.length !== 36 || !data.diffs || typeof data.diffs !== 'object') return new Response('Invalid save', { status: 400, headers });
    const entries = Object.entries(data.diffs);
    if (entries.length > 12000) return new Response('Too many edited chunks', { status: 413, headers });
    for (const [key, blocks] of entries) {
      if (!/^-?\d+,-?\d+$/.test(key) || !blocks || typeof blocks !== 'object') return new Response('Invalid chunk', { status: 400, headers });
      for (const [index, block] of Object.entries(blocks)) if (!/^\d+$/.test(index) || Number(index) >= 32768 || !Number.isInteger(block) || Number(block) < 0 || Number(block) > 18) return new Response('Invalid block', { status: 400, headers });
    }
    const now = new Date();
    await db.transaction(async tx => {
      const [current] = await tx.select().from(schema.worlds).where(eq(schema.worlds.id, id)).limit(1);
      if (current && current.seed !== data.seed) await tx.delete(schema.edits).where(eq(schema.edits.worldId, id));
      await tx.insert(schema.worlds).values({ id, seed: data.seed, player: data.player, inventory: data.inventory, progress: data.progress || {}, updatedAt: now }).onConflictDoUpdate({ target: schema.worlds.id, set: { seed: data.seed, player: data.player, inventory: data.inventory, progress: data.progress || {}, updatedAt: now } });
      for (let start = 0; start < entries.length; start += 100) {
        for (const [chunkKey, blocks] of entries.slice(start, start + 100)) {
          await tx.insert(schema.edits).values({ id: `${id}:${chunkKey}`, worldId: id, chunkKey, blocks, updatedAt: now }).onConflictDoUpdate({ target: schema.edits.id, set: { blocks, updatedAt: now } });
        }
      }
    });
    return Response.json({ saved: true, updatedAt: now.getTime() }, { headers });
  } catch {
    return Response.json({ error: 'Cloud save is temporarily unavailable. Your browser copy remains available.' }, { status: 503, headers });
  }
}
export const config: Config = { path: '/api/world' };
