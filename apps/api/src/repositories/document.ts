import { eq, desc } from 'drizzle-orm';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { documentsTable } from '../db/schema.js';
import { Document, DocumentType, ProcessingState } from '../domain/document.js';

export interface DocumentRepository {
  create(data: {
    type: DocumentType;
    originalFileName: string;
    storagePath: string;
    fileSizeBytes: number;
    mimeType: string;
  }): Promise<Document>;
  findById(id: string): Promise<Document | null>;
  findAll(): Promise<Document[]>;
  update(id: string, data: Partial<{ processingState: ProcessingState }>): Promise<Document | null>;
  delete(id: string): Promise<boolean>;
}

export class PostgresDocumentRepository implements DocumentRepository {
  private db: ReturnType<typeof drizzle>;

  constructor(private pool: Pool) {
    this.db = drizzle(pool);
  }

  async create(data: {
    type: DocumentType;
    originalFileName: string;
    storagePath: string;
    fileSizeBytes: number;
    mimeType: string;
  }): Promise<Document> {
    const result = await this.db
      .insert(documentsTable)
      .values({
        type: data.type,
        originalFileName: data.originalFileName,
        storagePath: data.storagePath,
        fileSizeBytes: data.fileSizeBytes,
        mimeType: data.mimeType,
        processingState: 'pending' as const,
      })
      .returning();

    return this.mapRow(result[0]);
  }

  async findById(id: string): Promise<Document | null> {
    const results = await this.db.select().from(documentsTable).where(eq(documentsTable.id, id));

    if (results.length === 0) {
      return null;
    }

    return this.mapRow(results[0]);
  }

  async findAll(): Promise<Document[]> {
    const results = await this.db
      .select()
      .from(documentsTable)
      .orderBy(desc(documentsTable.createdAt));

    return results.map((row) => this.mapRow(row));
  }

  async update(
    id: string,
    data: Partial<{ processingState: ProcessingState }>
  ): Promise<Document | null> {
    const updateData: Record<string, unknown> = {};

    if (data.processingState !== undefined) {
      updateData.processingState = data.processingState;
    }

    if (Object.keys(updateData).length === 0) {
      return this.findById(id);
    }

    const results = await this.db
      .update(documentsTable)
      .set(updateData)
      .where(eq(documentsTable.id, id))
      .returning();

    if (results.length === 0) {
      return null;
    }

    return this.mapRow(results[0]);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db.delete(documentsTable).where(eq(documentsTable.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  private mapRow(row: typeof documentsTable.$inferSelect): Document {
    return {
      id: row.id,
      type: row.type as DocumentType,
      originalFileName: row.originalFileName,
      storagePath: row.storagePath,
      fileSizeBytes: row.fileSizeBytes,
      mimeType: row.mimeType,
      processingState: row.processingState as ProcessingState,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
