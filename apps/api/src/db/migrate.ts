import { Pool } from 'pg';
import { loadDatabaseConfig } from '../config/database.js';

const MIGRATIONS = [
  {
    name: '001-enable-pgvector',
    up: 'CREATE EXTENSION IF NOT EXISTS vector;',
    down: 'DROP EXTENSION IF EXISTS vector;',
  },
];

async function runMigrations(): Promise<void> {
  const config = loadDatabaseConfig();
  const pool = new Pool({ connectionString: config.url });

  try {
    const client = await pool.connect();
    try {
      // Create migrations table
      await client.query(`
        CREATE TABLE IF NOT EXISTS migrations (
          id SERIAL PRIMARY KEY,
          name TEXT UNIQUE NOT NULL,
          executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Run each migration
      for (const migration of MIGRATIONS) {
        const result = await client.query('SELECT name FROM migrations WHERE name = $1', [migration.name]);

        if (result.rows.length === 0) {
          console.log(`Running migration: ${migration.name}`);
          await client.query(migration.up);
          await client.query('INSERT INTO migrations (name) VALUES ($1)', [migration.name]);
          console.log(`Completed migration: ${migration.name}`);
        } else {
          console.log(`Skipping migration (already executed): ${migration.name}`);
        }
      }

      console.log('All migrations completed successfully');
    } finally {
      client.release();
    }
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
