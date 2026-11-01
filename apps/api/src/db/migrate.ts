import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { loadDatabaseConfig } from '../config/database.js';

async function runMigrations(): Promise<void> {
  const config = loadDatabaseConfig();
  const pool = new Pool({ connectionString: config.url });

  try {
    const db = drizzle(pool);
    console.log('Running migrations...');
    await migrate(db, { migrationsFolder: './src/db/migrations' });
    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

runMigrations().catch((error) => {
  console.error('Fatal migration error:', error);
  process.exitCode = 1;
});
