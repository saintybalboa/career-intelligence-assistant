import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const migrationsTable = pgTable('migrations', {
  id: serial('id').primaryKey(),
  name: text('name').unique().notNull(),
  executedAt: timestamp('executed_at', { withTimezone: true }).defaultNow(),
});
