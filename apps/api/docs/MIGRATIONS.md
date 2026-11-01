# Database Migrations

This project uses [Drizzle ORM](https://orm.drizzle.team/) and Drizzle Kit for type-safe database management and migration generation.

## Workflow

### Adding a new table

1. **Define the schema** in [`src/db/schema.ts`](../src/db/schema.ts):

```typescript
import { pgTable, serial, text, varchar } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  name: text('name'),
});
```

2. **Generate the migration**:

```bash
pnpm db:generate
```

This creates a new SQL migration file in `src/db/migrations/` based on schema changes.

3. **Review the generated SQL** to ensure it matches your intent.

4. **Run migrations** to apply the changes to your database:

```bash
pnpm db:migrate
```

### Creating a SQL-only migration

For operations that don't fit the Drizzle schema (e.g., enabling extensions, custom SQL functions):

1. Create a new SQL file in `src/db/migrations/`:

```sql
-- src/db/migrations/0002_add_custom_function.sql
CREATE OR REPLACE FUNCTION custom_func() RETURNS text AS $$
  SELECT 'result';
$$ LANGUAGE SQL;
```

2. Update `src/db/migrations/meta/_journal.json` to add the migration metadata:

```json
{
  "idx": 2,
  "version": "7",
  "digest": "...",
  "when": 1730470287000,
  "tag": "0002_add_custom_function",
  "loc": {
    "directory": "src/db/migrations",
    "file": "0002_add_custom_function.sql"
  }
}
```

3. Run `pnpm db:migrate` to apply the migration.

## Available Commands

| Command | Purpose |
|---------|---------|
| `pnpm db:generate` | Generate new migrations from schema changes (must run before migrations are applied) |
| `pnpm db:push` | Push schema changes directly to the database without creating migration files (use for development only) |
| `pnpm db:migrate` | Apply all pending migrations to the database |

## Files and Structure

- **`drizzle.config.ts`** — Drizzle Kit configuration
- **`src/db/schema.ts`** — TypeScript schema definitions (source of truth for types and structure)
- **`src/db/migrations/`** — Generated SQL migration files
- **`src/db/migrations/meta/_journal.json`** — Migration tracking metadata
- **`src/db/migrate.ts`** — Migration runner (executes migrations using Drizzle)

## Migration Naming

Migrations are numbered sequentially:
- `0000_enable_pgvector.sql` — Enable pgvector extension (manual, prerequisite for semantic search)
- `0001_create_migrations_table.sql` — Create migrations tracking table (auto-generated from schema)
- `0002_*.sql` — Additional migrations (numbered sequentially)

## Important Notes

- **Always generate before migrating**: Run `pnpm db:generate` to create migrations from schema changes
- **Never manually edit migrations**: Let Drizzle Kit generate them from the schema
- **Schema is the source of truth**: Update `src/db/schema.ts`, not the SQL files
- **Test migrations locally**: Run migrations against the local database before committing
- **Order matters**: Migrations run in sequence. Extensions (like pgvector) must come before tables that depend on them

## Troubleshooting

**Migration fails with "column does not exist"**
- Ensure migrations run in order. Check `src/db/migrations/meta/_journal.json` for correct sequencing.
- Verify the schema definition matches the migration intent.

**`pnpm db:generate` produces no changes**
- This is expected if there are no schema differences. No action needed.

**Database connection fails during migration**
- Ensure the database is running: `pnpm db:up`
- Check the `DATABASE_URL` environment variable is correct
- Verify the database is healthy: `pnpm db:up` waits for readiness before returning

## Further Reading

- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Drizzle Kit Documentation](https://orm.drizzle.team/kit-docs/overview)
- [PostgreSQL pgvector Extension](https://github.com/pgvector/pgvector)
