import { Pool } from 'pg';
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
  constructor(private pool: Pool) {}

  async create(data: {
    type: DocumentType;
    originalFileName: string;
    storagePath: string;
    fileSizeBytes: number;
    mimeType: string;
  }): Promise<Document> {
    const query = `
      INSERT INTO documents (type, original_file_name, storage_path, file_size_bytes, mime_type, processing_state)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, type, original_file_name, storage_path, file_size_bytes, mime_type, processing_state, created_at, updated_at
    `;

    const result = await this.pool.query(query, [
      data.type,
      data.originalFileName,
      data.storagePath,
      data.fileSizeBytes,
      data.mimeType,
      'pending',
    ]);

    const row = result.rows[0];
    return this.mapRow(row);
  }

  async findById(id: string): Promise<Document | null> {
    const query = `
      SELECT id, type, original_file_name, storage_path, file_size_bytes, mime_type, processing_state, created_at, updated_at
      FROM documents
      WHERE id = $1
    `;

    const result = await this.pool.query(query, [id]);
    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRow(result.rows[0]);
  }

  async findAll(): Promise<Document[]> {
    const query = `
      SELECT id, type, original_file_name, storage_path, file_size_bytes, mime_type, processing_state, created_at, updated_at
      FROM documents
      ORDER BY created_at DESC
    `;

    const result = await this.pool.query(query);
    return result.rows.map((row) => this.mapRow(row));
  }

  async update(
    id: string,
    data: Partial<{ processingState: ProcessingState }>
  ): Promise<Document | null> {
    const updates: string[] = [];
    const values: unknown[] = [];
    let paramCount = 1;

    if (data.processingState !== undefined) {
      updates.push(`processing_state = $${paramCount++}`);
      values.push(data.processingState);
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE documents
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, type, original_file_name, storage_path, file_size_bytes, mime_type, processing_state, created_at, updated_at
    `;

    const result = await this.pool.query(query, values);
    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRow(result.rows[0]);
  }

  async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM documents WHERE id = $1';
    const result = await this.pool.query(query, [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  private mapRow(row: Record<string, unknown>): Document {
    return {
      id: row.id as string,
      type: row.type as DocumentType,
      originalFileName: row.original_file_name as string,
      storagePath: row.storage_path as string,
      fileSizeBytes: row.file_size_bytes as number,
      mimeType: row.mime_type as string,
      processingState: row.processing_state as ProcessingState,
      createdAt: new Date(row.created_at as string),
      updatedAt: new Date(row.updated_at as string),
    };
  }
}
