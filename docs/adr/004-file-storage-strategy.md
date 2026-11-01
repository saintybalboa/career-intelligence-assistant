# ADR-004: File Storage Strategy

- Status: Proposed
- Date: 2026-11-01

## Context

Career Intelligence Assistant accepts CV and job description uploads from users. The system needs to store these files durably and associate them with metadata for retrieval and analysis.

Design options include:

1. **Local filesystem storage** — store files in a directory mounted/managed by the operating system.
2. **Database blob storage** — store file contents directly in PostgreSQL.
3. **Cloud object storage** — delegate to managed services (S3, Azure Blob Storage, GCS).

For a take-home assessment with a single-machine setup, this decision optimises for simplicity, local testability and clear path to production.

## Requirements

- Store uploaded files durably within the environment.
- Support retrieval by document ID for subsequent processing.
- Enable deletion of documents and associated files.
- Track file metadata (size, storage path, upload timestamp).
- Validate file uploads before storage (type, size, encoding).
- Support the initial development and testing workflow with Docker Compose.

## Decision

**Use local filesystem storage with metadata persistence in PostgreSQL.**

Files are stored in a configurable local directory (`./storage/documents/` by default, configurable via `DOCUMENTS_STORAGE_PATH`). The database maintains document metadata, including:

- Document ID (UUID)
- File name and storage path
- File size and MIME type
- Document type (CV or job description)
- Upload timestamp
- Processing state (pending, processing, completed, failed)

This approach:

- Keeps the initial implementation simple and testable without external service dependencies.
- Allows Docker Compose volumes to persist files across restarts.
- Supports easy local development and debugging.
- Stores only metadata in PostgreSQL, keeping blob size queries performant.
- Enables a clear migration path to cloud object storage (S3, Azure Blob) later.

## Consequences

### Advantages

- No external service dependencies for local development.
- Simple to implement and understand.
- Fast file I/O compared to database blobs.
- Files can be inspected and debugged directly on the filesystem.
- Clear upgrade path to cloud storage (migrate files, update storage adapter).

### Disadvantages

- Requires filesystem management (permissions, cleanup, quotas).
- Single-instance only until a distributed storage layer is added.
- Filesystem failures are not automatically replicated.
- Requires operational discipline to prevent disk-space exhaustion.

## Mitigations

- Use environment variables to configure storage path (`DOCUMENTS_STORAGE_PATH`).
- Implement file size validation to prevent unbounded uploads.
- Document deletion removes both database records and files.
- Use Sequelize or similar ORM migrations to track schema evolution.
- Add metrics/logging for storage usage in production.
- For multi-instance deployment, migrate to S3 or Azure Blob Storage.

## Implementation notes

- Store files with UUID-based filenames to avoid collisions and simplify deletion.
- Keep original file names in database metadata for UX purposes.
- Use atomic file operations (write to temporary file, then rename) to avoid partial writes.
- Restrict storage directory permissions to the application process.
- Monitor free disk space in operational readiness checks.

## Revisit conditions

Reconsider this decision if:

- The application scales beyond single-instance deployment.
- File retention and compliance requirements demand immutable storage.
- Storage costs or latency become production concerns.
- Multi-region availability is a requirement.
