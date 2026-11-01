import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { Pool } from 'pg';
import { PostgresDocumentRepository } from '../src/repositories/document.js';
import { loadDatabaseConfig } from '../src/config/database.js';

describe('DocumentRepository', () => {
  let pool: Pool;
  let repository: PostgresDocumentRepository;

  beforeAll(async () => {
    const dbConfig = loadDatabaseConfig({
      ...process.env,
      DATABASE_POOL_SIZE: '5',
    });

    pool = new Pool({ connectionString: dbConfig.url });

    // Verify database is available
    const client = await pool.connect();
    try {
      await client.query('SELECT 1');
    } finally {
      client.release();
    }

    repository = new PostgresDocumentRepository(pool);
  });

  afterAll(async () => {
    // Clean up test documents
    const client = await pool.connect();
    try {
      await client.query('TRUNCATE documents');
    } finally {
      client.release();
    }
    await pool.end();
  });

  beforeEach(async () => {
    // Clear documents before each test
    const client = await pool.connect();
    try {
      await client.query('TRUNCATE documents');
    } finally {
      client.release();
    }
  });

  it('creates a document with required fields', async () => {
    const document = await repository.create({
      type: 'cv',
      originalFileName: 'resume.pdf',
      storagePath: '550e8400-e29b-41d4-a716-446655440000.pdf',
      fileSizeBytes: 1024,
      mimeType: 'application/pdf',
    });

    expect(document.id).toBeDefined();
    expect(document.type).toBe('cv');
    expect(document.originalFileName).toBe('resume.pdf');
    expect(document.storagePath).toBe('550e8400-e29b-41d4-a716-446655440000.pdf');
    expect(document.fileSizeBytes).toBe(1024);
    expect(document.mimeType).toBe('application/pdf');
    expect(document.processingState).toBe('pending');
    expect(document.createdAt).toBeInstanceOf(Date);
    expect(document.updatedAt).toBeInstanceOf(Date);
  });

  it('finds a document by id', async () => {
    const created = await repository.create({
      type: 'job_description',
      originalFileName: 'job.pdf',
      storagePath: '550e8400-e29b-41d4-a716-446655440001.pdf',
      fileSizeBytes: 2048,
      mimeType: 'application/pdf',
    });

    const found = await repository.findById(created.id);
    expect(found).not.toBeNull();
    expect(found?.id).toBe(created.id);
    expect(found?.originalFileName).toBe('job.pdf');
  });

  it('returns null when document not found', async () => {
    const found = await repository.findById('550e8400-e29b-41d4-a716-446655440099');
    expect(found).toBeNull();
  });

  it('lists all documents', async () => {
    await repository.create({
      type: 'cv',
      originalFileName: 'resume1.pdf',
      storagePath: '550e8400-e29b-41d4-a716-446655440000.pdf',
      fileSizeBytes: 1024,
      mimeType: 'application/pdf',
    });

    await repository.create({
      type: 'job_description',
      originalFileName: 'job1.pdf',
      storagePath: '550e8400-e29b-41d4-a716-446655440001.pdf',
      fileSizeBytes: 2048,
      mimeType: 'application/pdf',
    });

    const documents = await repository.findAll();
    expect(documents).toHaveLength(2);
    expect(documents[0].originalFileName).toBe('job1.pdf');
    expect(documents[1].originalFileName).toBe('resume1.pdf');
  });

  it('updates document processing state', async () => {
    const created = await repository.create({
      type: 'cv',
      originalFileName: 'resume.pdf',
      storagePath: '550e8400-e29b-41d4-a716-446655440000.pdf',
      fileSizeBytes: 1024,
      mimeType: 'application/pdf',
    });

    const updated = await repository.update(created.id, { processingState: 'processing' });
    expect(updated).not.toBeNull();
    expect(updated?.processingState).toBe('processing');
    expect(updated?.updatedAt.getTime()).toBeGreaterThan(created.updatedAt.getTime());
  });

  it('deletes a document', async () => {
    const created = await repository.create({
      type: 'cv',
      originalFileName: 'resume.pdf',
      storagePath: '550e8400-e29b-41d4-a716-446655440000.pdf',
      fileSizeBytes: 1024,
      mimeType: 'application/pdf',
    });

    const deleted = await repository.delete(created.id);
    expect(deleted).toBe(true);

    const found = await repository.findById(created.id);
    expect(found).toBeNull();
  });

  it('handles delete for non-existent document', async () => {
    const deleted = await repository.delete('550e8400-e29b-41d4-a716-446655440099');
    expect(deleted).toBe(false);
  });
});
