import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

export interface FileStorageConfig {
  basePath: string;
  maxSizeBytes: number;
}

export interface StoredFile {
  id: string;
  path: string;
  sizeBytes: number;
}

export interface FileStorageService {
  storeFile(fileBuffer: Buffer, originalFileName: string, mimeType: string): Promise<StoredFile>;
  getFile(fileId: string): Promise<Buffer>;
  deleteFile(fileId: string): Promise<void>;
  ensureStorageDirectory(): Promise<void>;
}

export class LocalFileStorageService implements FileStorageService {
  private basePath: string;
  private maxSizeBytes: number;

  constructor(config: FileStorageConfig) {
    this.basePath = config.basePath;
    this.maxSizeBytes = config.maxSizeBytes;
  }

  async ensureStorageDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.basePath, { recursive: true });
    } catch (error) {
      throw new Error(`Failed to create storage directory: ${String(error)}`, { cause: error });
    }
  }

  async storeFile(fileBuffer: Buffer, originalFileName: string, _mimeType: string): Promise<StoredFile> {
    if (fileBuffer.length > this.maxSizeBytes) {
      throw new Error(`File exceeds maximum size of ${this.maxSizeBytes} bytes`);
    }

    const fileId = randomUUID();
    const ext = path.extname(originalFileName);
    const filename = `${fileId}${ext}`;
    const filePath = path.join(this.basePath, filename);

    try {
      await fs.writeFile(filePath, fileBuffer, { flag: 'wx' });
      return {
        id: fileId,
        path: filename,
        sizeBytes: fileBuffer.length,
      };
    } catch (error) {
      throw new Error(`Failed to store file: ${String(error)}`, { cause: error });
    }
  }

  async getFile(fileId: string): Promise<Buffer> {
    try {
      // Find file with matching UUID prefix
      const files = await fs.readdir(this.basePath);
      const matchingFile = files.find((f) => f.startsWith(fileId));

      if (!matchingFile) {
        throw new Error(`File not found: ${fileId}`);
      }

      const filePath = path.join(this.basePath, matchingFile);
      return await fs.readFile(filePath);
    } catch (error) {
      throw new Error(`Failed to read file: ${String(error)}`, { cause: error });
    }
  }

  async deleteFile(fileId: string): Promise<void> {
    try {
      const files = await fs.readdir(this.basePath);
      const matchingFile = files.find((f) => f.startsWith(fileId));

      if (!matchingFile) {
        // File already deleted or doesn't exist
        return;
      }

      const filePath = path.join(this.basePath, matchingFile);
      await fs.unlink(filePath);
    } catch (error) {
      throw new Error(`Failed to delete file: ${String(error)}`, { cause: error });
    }
  }
}
