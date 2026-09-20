import { pgTable, text, jsonb, timestamp } from 'drizzle-orm/pg-core';

export const worlds = pgTable('wildwood_worlds', {
  id: text('id').primaryKey(),
  seed: text('seed').notNull(),
  player: jsonb('player').notNull(),
  inventory: jsonb('inventory').notNull(),
  progress: jsonb('progress').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
export const edits = pgTable('wildwood_chunk_edits', {
  id: text('id').primaryKey(),
  worldId: text('world_id').notNull().references(() => worlds.id, { onDelete: 'cascade' }),
  chunkKey: text('chunk_key').notNull(),
  blocks: jsonb('blocks').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
