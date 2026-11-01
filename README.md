# Career Intelligence Assistant

An AI-powered career intelligence assistant that uses Retrieval-Augmented Generation (RAG) to analyse CVs against job descriptions, identify skill gaps, assess role suitability, and provide personalised career insights and interview preparation.

## Prerequisites

- Node.js 22
- pnpm 12.16.1 (provided through Corepack)
- Docker and Docker Compose (for local database development)

## Initial setup

Enable Corepack and install the workspace dependencies from the repository root:

```bash
corepack enable
pnpm install
```

List the workspace packages to verify the repository setup:

```bash
pnpm -r list --depth -1
```

The workspace contains:

- `apps/web`: React frontend application using TypeScript and Vite
- `apps/api`: Fastify backend API with PostgreSQL and pgvector integration
- `packages/contracts`: Shared API contracts and schemas

## Database development

The project uses PostgreSQL with pgvector for semantic search capabilities.

### Starting the local database

Start the database service using Docker Compose:

```bash
pnpm db:up
```

This starts a PostgreSQL 17 container with pgvector extension enabled.
The database service:

- Runs on `postgresql://career:career_password@127.0.0.1:5432/career_ai`
- Includes health checks that verify readiness every 10 seconds
- Persists data in a Docker volume between restarts

### Running migrations

After starting the database, run migrations to set up the database schema:

```bash
pnpm db:migrate
```

This creates the necessary extensions (pgvector) and initialisation tables.

### Resetting the database

To reset the database and delete all local data:

```bash
pnpm db:reset
```

**Warning:** This deletes the database volume and all data. Use with caution.

### Stopping the database

To stop the database without deleting data:

```bash
pnpm db:down
```

## Development

The project uses shared development tooling to ensure consistent code quality across frontend and backend applications. All quality checks run locally before commit and in CI on every pull request.

### Quality gates

Check all code quality gates before committing:

```bash
pnpm check
```

This runs formatting, linting and type checking in one command. The individual commands are:

#### Formatting

Format code consistently using Prettier:

```bash
pnpm format          # Apply formatting to all files
pnpm format:check    # Check if files need formatting (non-destructive)
```

Configuration is in `.prettierrc.json` and applies to TypeScript, JavaScript, JSON, Markdown and configuration files.

#### Linting

Check code style with ESLint:

```bash
pnpm lint            # Show linting errors
pnpm lint:fix        # Fix auto-fixable issues
```

ESLint enforces:

- React and React Hooks best practices (frontend)
- TypeScript type safety
- Consistent code style
- Best practices for Node.js (backend)

Configuration is in `eslint.config.js` (shared root configuration).

#### Type Checking

Run TypeScript type checking across all workspaces:

```bash
pnpm typecheck
```

This runs type checking on frontend and backend separately. TypeScript strict mode is enabled in both.

### Testing

Run tests for all workspaces:

```bash
pnpm test
```

Individual workspaces:

```bash
pnpm --filter @career/web test -- --run         # Frontend tests (once)
pnpm --filter @career/api test                  # Backend tests
```

#### Database-dependent tests

Backend integration tests in `apps/api/tests/database.test.ts` require a running PostgreSQL database with pgvector. These tests are excluded from the default test run (both locally and in CI) to keep the main test suite deterministic and fast.

To run database integration tests locally:

1. **Setup database:**

   ```bash
   pnpm db:up
   pnpm db:migrate
   ```

2. **Run database tests explicitly:**

   ```bash
   INCLUDE_DB_TESTS=true pnpm --filter @career/api test
   ```

3. **Clean up:**

   ```bash
   pnpm db:down        # Stop database
   pnpm db:reset       # Stop and delete database data
   ```

In CI, the main `pnpm test` command excludes database tests via the vitest configuration. Database tests can be run in a separate optional job later if needed.

### Building

Build all applications for production:

```bash
pnpm build
```

Build individual workspaces:

```bash
pnpm --filter @career/web run build      # Frontend only
pnpm --filter @career/api run build      # Backend only
```

### Continuous Integration

The repository uses GitHub Actions for automated validation. The workflow (`.github/workflows/ci.yml`) runs on:

- Pull requests targeting `main`
- Pushes to `main`

The CI pipeline validates:

1. Code formatting (Prettier)
2. Code style (ESLint)
3. Type safety (TypeScript)
4. Unit and integration tests
5. Production builds

All checks must pass before merge. The workflow uses:

- Node.js LTS (currently 22)
- pnpm (currently 12.16.1)
- Cached dependency installation for speed
- Minimal GitHub Actions permissions for security

### Development prerequisites

- Node.js 22 (managed via `.nvmrc`)
- pnpm 12.16.1 (managed via `packageManager` in `package.json`)
- Docker and Docker Compose (for PostgreSQL with pgvector)

Enable Corepack to use the correct pnpm version automatically:

```bash
corepack enable
pnpm install
```

Build for production:

```bash
pnpm --filter @career/web build
```

Preview production build:

```bash
pnpm --filter @career/web preview
```

## Backend development

The backend is an independently runnable Fastify application in `apps/api`.
It uses strict TypeScript checking, Zod-validated environment configuration and
Fastify's built-in Pino logging.

### Environment variables

Use the example environment file as a reference when setting environment
variables in your shell:

```bash
export NODE_ENV=development
export HOST=127.0.0.1
export PORT=3001
export CORS_ORIGIN=http://localhost:5173
export LOG_LEVEL=info
export DATABASE_URL=postgresql://career:career_password@127.0.0.1:5432/career_ai
export DATABASE_POOL_SIZE=10
```

All available settings are documented in [`apps/api/.env.example`](apps/api/.env.example).
Defaults are suitable for local development.

### Commands

Run the backend in development mode with automatic restarting:

```bash
pnpm --filter @career/api dev
```

Run backend tests:

```bash
pnpm --filter @career/api test
```

Build the backend:

```bash
pnpm --filter @career/api build
```

Start the built backend:

```bash
pnpm --filter @career/api start
```

### Health and readiness endpoints

The application exposes two health check endpoints:

**`GET /health`** — Application liveness

- Returns HTTP 200 with `{ "status": "ok" }` when the application is running
- Does not depend on database availability
- Use this for container orchestration liveness probes

**`GET /ready`** — Application readiness

- Returns HTTP 200 with pgvector version when the database is available and pgvector is active
- Returns HTTP 503 when the database is unavailable or pgvector is not available
- Use this for container orchestration readiness probes
- Useful for orchestration, load balancers and startup sequencing

Example readiness response when ready:

```json
{
  "status": "ready",
  "pgvector_version": "0.7.4"
}
```

Example readiness response when unavailable:

```json
{
  "status": "unavailable",
  "reason": "database_unreachable"
}
```

### Database integration

The backend connects to PostgreSQL using `pg` with connection pooling.

**Connection pooling** is configured via environment variables:

- `DATABASE_URL`: PostgreSQL connection string (required)
- `DATABASE_POOL_SIZE`: Connection pool size, 1-100 (default: 10)

The database connection is:

- Initialized when the app starts
- Gracefully closed when the app shuts down
- Verified through the `/ready` endpoint

**Migrations** are managed through `pnpm db:migrate`, which:

- Creates a `migrations` table if it doesn't exist
- Tracks applied migrations by name
- Runs repeatable migrations (e.g., extensions) on each execution
- Ensures pgvector is available for semantic search

### Configuration

The backend configuration follows these principles:

- **Environment-driven**: All configuration comes from environment variables, validated with Zod
- **Explicit defaults**: Defaults are documented and suitable for local development
- **Strict typing**: TypeScript strict mode ensures type safety
- **Validated startup**: Configuration errors fail fast at startup with helpful messages
- **Secrets-safe**: Sensitive values like passwords are not logged

### Project structure

```
apps/api/
├── src/
│   ├── app.ts              # Application factory
│   ├── server.ts           # Server startup and lifecycle
│   ├── config/
│   │   ├── env.ts          # Environment configuration and validation
│   │   └── database.ts     # Database configuration and validation
│   ├── db/
│   │   ├── index.ts        # Database instance manager
│   │   ├── connection.ts   # PostgreSQL connection and pooling
│   │   └── migrate.ts      # Database migration runner
│   └── routes/
│       ├── health.ts       # GET /health liveness endpoint
│       └── ready.ts        # GET /ready readiness endpoint
├── tests/
│   ├── health.test.ts      # Health endpoint and configuration tests
│   └── database.test.ts    # Database integration and readiness tests
├── .env.example            # Environment variable reference
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
└── vitest.config.ts        # Vitest configuration
```

### Testing

The backend uses Vitest for unit and integration testing:

```bash
pnpm --filter @career/api test
```

Tests include:

- **Unit tests**: Environment configuration, error handling, HTTP responses
- **Integration tests**: Real PostgreSQL connection, pgvector availability, connection pooling
- **Skipped tests**: Database integration tests are automatically skipped if the database is unavailable

To run database integration tests:

```bash
pnpm db:up          # Start the database
pnpm db:migrate     # Run migrations
pnpm --filter @career/api test  # Run tests (database tests will run)
```
