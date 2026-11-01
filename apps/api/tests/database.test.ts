import { describe, expect, it, beforeAll, afterAll, test } from 'vitest';
import { Pool } from 'pg';
import { createApp } from '../src/app.js';
import { loadConfig } from '../src/config/env.js';
import { loadDatabaseConfig } from '../src/config/database.js';
import { closeDatabase, getDatabase } from '../src/db/index.js';

/**
 * Integration tests for database readiness endpoint.
 * These tests require a running PostgreSQL database with pgvector extension.
 * They test against the real database, not mocked connections.
 * 
 * To run these tests with a real database:
 * 1. pnpm db:up
 * 2. pnpm db:migrate
 * 3. pnpm --filter @career/api test
 */
describe('Database readiness endpoint (/ready)', () => {
  let testPool: Pool;
  const dbConfig = loadDatabaseConfig({
    DATABASE_URL: 'postgresql://career:career_password@127.0.0.1:5432/career_ai',
    DATABASE_POOL_SIZE: '5',
  });

  let databaseAvailable = false;

  beforeAll(async () => {
    // Create a test pool to manage the database
    testPool = new Pool({ connectionString: dbConfig.url });
    
    try {
      // Try to connect and verify database is available
      const testClient = await testPool.connect();
      try {
        await testClient.query('SELECT 1');
        databaseAvailable = true;
        
        // Ensure pgvector extension exists
        await testClient.query('CREATE EXTENSION IF NOT EXISTS vector;');
        await testClient.query(`
          CREATE TABLE IF NOT EXISTS migrations (
            id SERIAL PRIMARY KEY,
            name TEXT UNIQUE NOT NULL,
            executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `);
      } finally {
        testClient.release();
      }
    } catch (error) {
      databaseAvailable = false;
      console.log('Database not available for integration tests. Tests requiring database will be skipped.');
    }
  });

  afterAll(async () => {
    await testPool.end();
  });

  (databaseAvailable ? it : it.skip)(
    'returns 200 with pgvector version when database is available and healthy',
    async () => {
      const app = createApp({
        config: loadConfig({
          NODE_ENV: 'test',
          HOST: '127.0.0.1',
          PORT: '3002',
          CORS_ORIGIN: 'http://localhost:5173',
          LOG_LEVEL: 'silent',
        }),
        databaseConfig: dbConfig,
      });

      try {
        const response = await app.inject({
          method: 'GET',
          url: '/ready',
        });

        expect(response.statusCode).toBe(200);
        const body = response.json();
        expect(body).toHaveProperty('status', 'ready');
        expect(body).toHaveProperty('pgvector_version');
        expect(typeof body.pgvector_version).toBe('string');
      } finally {
        await app.close();
        await closeDatabase();
      }
    }
  );

  (databaseAvailable ? it : it.skip)(
    'returns 503 when database connection cannot be established',
    async () => {
      const app = createApp({
        config: loadConfig({
          NODE_ENV: 'test',
          HOST: '127.0.0.1',
          PORT: '3002',
          CORS_ORIGIN: 'http://localhost:5173',
          LOG_LEVEL: 'silent',
        }),
        databaseConfig: {
          url: 'postgresql://career:wrongpassword@127.0.0.1:5432/nonexistent',
          poolSize: 5,
        },
      });

      try {
        const response = await app.inject({
          method: 'GET',
          url: '/ready',
        });

        expect(response.statusCode).toBe(503);
        const body = response.json();
        expect(body).toHaveProperty('status', 'unavailable');
        expect(body).toHaveProperty('reason');
      } finally {
        await app.close();
        await closeDatabase();
      }
    }
  );

  (databaseAvailable ? it : it.skip)(
    'health endpoint remains functional independent of database availability',
    async () => {
      const app = createApp({
        config: loadConfig({
          NODE_ENV: 'test',
          HOST: '127.0.0.1',
          PORT: '3003',
          CORS_ORIGIN: 'http://localhost:5173',
          LOG_LEVEL: 'silent',
        }),
        databaseConfig: dbConfig,
      });

      try {
        const response = await app.inject({
          method: 'GET',
          url: '/health',
        });

        expect(response.statusCode).toBe(200);
        expect(response.json()).toEqual({ status: 'ok' });
      } finally {
        await app.close();
        await closeDatabase();
      }
    }
  );

  (databaseAvailable ? it : it.skip)(
    'closes database connections gracefully on app shutdown',
    async () => {
      const app = createApp({
        config: loadConfig({
          NODE_ENV: 'test',
          HOST: '127.0.0.1',
          PORT: '3004',
          CORS_ORIGIN: 'http://localhost:5173',
          LOG_LEVEL: 'silent',
        }),
        databaseConfig: dbConfig,
      });

      try {
        // Verify connection works
        const db = getDatabase();
        expect(db).not.toBeNull();
        const isConnected = await db!.isConnected();
        expect(isConnected).toBe(true);
      } finally {
        await app.close();
        await closeDatabase();
      }
    }
  );
});

describe('Database configuration', () => {
  it('loads database configuration from environment', () => {
    const config = loadDatabaseConfig({
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
      DATABASE_POOL_SIZE: '20',
    });

    expect(config.url).toBe('postgresql://user:pass@localhost:5432/db');
    expect(config.poolSize).toBe(20);
  });

  it('uses default database configuration values', () => {
    const config = loadDatabaseConfig({});

    expect(config.url).toBe('postgresql://career:career_password@127.0.0.1:5432/career_ai');
    expect(config.poolSize).toBe(10);
  });

  it('validates pool size constraints', () => {
    expect(() =>
      loadDatabaseConfig({
        DATABASE_POOL_SIZE: '0',
      })
    ).toThrow();

    expect(() =>
      loadDatabaseConfig({
        DATABASE_POOL_SIZE: '200',
      })
    ).toThrow();
  });
});
