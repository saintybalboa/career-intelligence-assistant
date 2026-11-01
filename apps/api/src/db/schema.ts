import { pgTable, serial, text, timestamp, uuid, integer, varchar } from 'drizzle-orm/pg-core';

export const migrationsTable = pgTable('migrations', {
  id: serial('id').primaryKey(),
  name: text('name').unique().notNull(),
  executedAt: timestamp('executed_at', { withTimezone: true }).defaultNow(),
});

export const documentsTable = pgTable('documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: varchar('type', { length: 50 }).notNull(),
  originalFileName: text('original_file_name').notNull(),
  storagePath: text('storage_path').notNull(),
  fileSizeBytes: integer('file_size_bytes').notNull(),
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  processingState: varchar('processing_state', { length: 50 }).notNull().default('pending'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
