import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { LocalFileStorageService } from '../src/services/file-storage.js';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const testStoragePath = path.join(__dirname, '.test-storage');

describe('LocalFileStorageService', () => {
  let service: LocalFileStorageService;

  beforeEach(async () => {
    service = new LocalFileStorageService({
      basePath: testStoragePath,
      maxSizeBytes: 10 * 1024 * 1024,
    });
    await service.ensureStorageDirectory();
  });

  afterEach(async () => {
    // Clean up test storage
    try {
      await fs.rm(testStoragePath, { recursive: true, force: true });
    } catch (_error) {
      // Ignore cleanup errors
    }
  });

  it('creates storage directory if it does not exist', async () => {
    const testPath = path.join(__dirname, '.test-new-storage');
    const newService = new LocalFileStorageService({
      basePath: testPath,
      maxSizeBytes: 10 * 1024 * 1024,
    });

    await newService.ensureStorageDirectory();

    const stat = await fs.stat(testPath);
    expect(stat.isDirectory()).toBe(true);

    await fs.rm(testPath, { recursive: true, force: true });
  });

  it('stores a file with UUID-based naming', async () => {
    const fileBuffer = Buffer.from('test content');
    const stored = await service.storeFile(fileBuffer, 'test.pdf', 'application/pdf');

    expect(stored.id).toBeDefined();
    expect(stored.path).toMatch(/^[0-9a-f-]+\.pdf$/);
    expect(stored.sizeBytes).toBe(fileBuffer.length);

    const filePath = path.join(testStoragePath, stored.path);
    const contents = await fs.readFile(filePath);
    expect(contents).toEqual(fileBuffer);
  });

  it('prevents duplicate file writes by generating unique IDs', async () => {
    const buffer1 = Buffer.from('content1');
    const stored1 = await service.storeFile(buffer1, 'file.pdf', 'application/pdf');

    const buffer2 = Buffer.from('content2');
    const stored2 = await service.storeFile(buffer2, 'file.pdf', 'application/pdf');

    expect(stored1.path).not.toBe(stored2.path);
    expect(stored1.id).not.toBe(stored2.id);
  });

  it('rejects files exceeding maximum size', async () => {
    const oversizedBuffer = Buffer.alloc(11 * 1024 * 1024);
    await expect(
      service.storeFile(oversizedBuffer, 'large.pdf', 'application/pdf')
    ).rejects.toThrow(/exceeds maximum size/);
  });

  it('retrieves a stored file by ID', async () => {
    const originalContent = Buffer.from('test file content');
    const stored = await service.storeFile(originalContent, 'document.pdf', 'application/pdf');

    const retrieved = await service.getFile(stored.id);
    expect(retrieved).toEqual(originalContent);
  });

  it('throws error when retrieving non-existent file', async () => {
    const nonExistentId = '550e8400-e29b-41d4-a716-446655440099';
    await expect(service.getFile(nonExistentId)).rejects.toThrow(/not found/);
  });

  it('deletes a stored file', async () => {
    const fileBuffer = Buffer.from('deletable content');
    const stored = await service.storeFile(fileBuffer, 'deleteme.pdf', 'application/pdf');

    await service.deleteFile(stored.id);

    // Verify file is deleted
    await expect(service.getFile(stored.id)).rejects.toThrow(/not found/);
  });

  it('handles deletion of non-existent file gracefully', async () => {
    const nonExistentId = '550e8400-e29b-41d4-a716-446655440099';
    await expect(service.deleteFile(nonExistentId)).resolves.not.toThrow();
  });

  it('preserves file extension from original filename', async () => {
    const docxBuffer = Buffer.from('docx content');
    const stored = await service.storeFile(
      docxBuffer,
      'document.docx',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );

    expect(stored.path).toMatch(/\.docx$/);

    const txtBuffer = Buffer.from('text content');
    const storedTxt = await service.storeFile(txtBuffer, 'notes.txt', 'text/plain');
    expect(storedTxt.path).toMatch(/\.txt$/);
  });
});
