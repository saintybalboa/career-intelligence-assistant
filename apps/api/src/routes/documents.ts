import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import multipart from '@fastify/multipart';
import { DocumentRepository } from '../repositories/document.js';
import { FileStorageService } from '../services/file-storage.js';
import { DocumentTypeEnum, AllowedMimeTypes } from '../domain/document.js';

export interface DocumentRouteOptions {
  documentRepository: DocumentRepository;
  fileStorageService: FileStorageService;
  maxUploadSizeMb: number;
}

interface DocumentParams {
  id: string;
}

export async function registerDocumentRoutes(
  app: FastifyInstance,
  options: DocumentRouteOptions
): Promise<void> {
  const { documentRepository, fileStorageService, maxUploadSizeMb } = options;

  // Register multipart plugin
  await app.register(multipart, {
    limits: {
      fileSize: maxUploadSizeMb * 1024 * 1024,
    },
  });

  // POST /documents/upload - Upload a new document
  app.post<{ Body: unknown; Querystring: unknown }>(
    '/documents/upload',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const data = await request.file();
        if (!data) {
          return reply.status(400).send({
            error: {
              code: 'MISSING_FILE',
              message: 'No file was provided in the request',
            },
          });
        }

        // Extract type from query string or default to first form field
        const typeValue = (request.query as Record<string, unknown>)?.type || 'cv';

        const typeResult = DocumentTypeEnum.safeParse(typeValue);
        if (!typeResult.success) {
          return reply.status(400).send({
            error: {
              code: 'INVALID_DOCUMENT_TYPE',
              message: `Document type must be one of: cv, job_description`,
            },
          });
        }

        const mimeType = data.mimetype;
        if (!AllowedMimeTypes.includes(mimeType)) {
          return reply.status(400).send({
            error: {
              code: 'UNSUPPORTED_FILE_TYPE',
              message: `File type not supported. Allowed types: ${AllowedMimeTypes.join(', ')}`,
            },
          });
        }

        // Read file buffer
        const chunks: Buffer[] = [];
        for await (const chunk of data.file) {
          chunks.push(chunk as Buffer);
        }
        const fileBuffer = Buffer.concat(chunks);

        // Store file
        const storedFile = await fileStorageService.storeFile(fileBuffer, data.filename, mimeType);

        // Create document record
        const document = await documentRepository.create({
          type: typeResult.data,
          originalFileName: data.filename,
          storagePath: storedFile.path,
          fileSizeBytes: storedFile.sizeBytes,
          mimeType,
        });

        request.log.info({ documentId: document.id, fileName: data.filename }, 'Document uploaded successfully');

        return reply.status(201).send({
          id: document.id,
          type: document.type,
          originalFileName: document.originalFileName,
          fileSizeBytes: document.fileSizeBytes,
          mimeType: document.mimeType,
          processingState: document.processingState,
          createdAt: document.createdAt,
        });
      } catch (error) {
        if (error instanceof Error && error.message.includes('exceeds maximum size')) {
          return reply.status(413).send({
            error: {
              code: 'FILE_TOO_LARGE',
              message: error.message,
            },
          });
        }

        request.log.error({ err: error }, 'Failed to upload document');
        return reply.status(500).send({
          error: {
            code: 'UPLOAD_FAILED',
            message: 'Failed to upload document',
          },
        });
      }
    }
  );

  // GET /documents - List all documents
  app.get<{ Querystring: unknown }>(
    '/documents',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const documents = await documentRepository.findAll();
        return reply.send({
          documents: documents.map((doc) => ({
            id: doc.id,
            type: doc.type,
            originalFileName: doc.originalFileName,
            fileSizeBytes: doc.fileSizeBytes,
            mimeType: doc.mimeType,
            processingState: doc.processingState,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
          })),
        });
      } catch (error) {
        request.log.error({ err: error }, 'Failed to list documents');
        return reply.status(500).send({
          error: {
            code: 'LIST_FAILED',
            message: 'Failed to list documents',
          },
        });
      }
    }
  );

  // GET /documents/:id - Get document metadata
  app.get<{ Params: DocumentParams }>(
    '/documents/:id',
    async (request: FastifyRequest<{ Params: DocumentParams }>, reply: FastifyReply) => {
      try {
        const document = await documentRepository.findById(request.params.id);
        if (!document) {
          return reply.status(404).send({
            error: {
              code: 'NOT_FOUND',
              message: 'Document not found',
            },
          });
        }

        return reply.send({
          id: document.id,
          type: document.type,
          originalFileName: document.originalFileName,
          fileSizeBytes: document.fileSizeBytes,
          mimeType: document.mimeType,
          processingState: document.processingState,
          createdAt: document.createdAt,
          updatedAt: document.updatedAt,
        });
      } catch (error) {
        request.log.error({ err: error }, 'Failed to fetch document');
        return reply.status(500).send({
          error: {
            code: 'FETCH_FAILED',
            message: 'Failed to fetch document',
          },
        });
      }
    }
  );

  // DELETE /documents/:id - Delete a document
  app.delete<{ Params: DocumentParams }>(
    '/documents/:id',
    async (request: FastifyRequest<{ Params: DocumentParams }>, reply: FastifyReply) => {
      try {
        const document = await documentRepository.findById(request.params.id);
        if (!document) {
          return reply.status(404).send({
            error: {
              code: 'NOT_FOUND',
              message: 'Document not found',
            },
          });
        }

        // Delete file from storage
        await fileStorageService.deleteFile(document.id);

        // Delete document record
        await documentRepository.delete(request.params.id);

        request.log.info({ documentId: request.params.id }, 'Document deleted successfully');

        return reply.status(204).send();
      } catch (error) {
        request.log.error({ err: error }, 'Failed to delete document');
        return reply.status(500).send({
          error: {
            code: 'DELETE_FAILED',
            message: 'Failed to delete document',
          },
        });
      }
    }
  );
}

