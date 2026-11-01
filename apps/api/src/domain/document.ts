import { z } from 'zod';

export const DocumentTypeEnum = z.enum(['cv', 'job_description']);
export type DocumentType = z.infer<typeof DocumentTypeEnum>;

export const ProcessingStateEnum = z.enum(['pending', 'processing', 'completed', 'failed']);
export type ProcessingState = z.infer<typeof ProcessingStateEnum>;

export interface Document {
  id: string;
  type: DocumentType;
  originalFileName: string;
  storagePath: string;
  fileSizeBytes: number;
  mimeType: string;
  processingState: ProcessingState;
  createdAt: Date;
  updatedAt: Date;
}

export const UploadDocumentRequestSchema = z.object({
  type: DocumentTypeEnum,
});

export type UploadDocumentRequest = z.infer<typeof UploadDocumentRequestSchema>;

export const AllowedMimeTypes = [
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
