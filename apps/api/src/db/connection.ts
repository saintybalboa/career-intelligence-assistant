import { Pool, type PoolClient } from 'pg';

export interface Logger {
  error(obj: unknown, msg?: string): void;
  info(obj: unknown, msg?: string): void;
  warn(obj: unknown, msg?: string): void;
}

export interface DatabaseConnection {
  isConnected(): Promise<boolean>;
  close(): Promise<void>;
  query(text: string, values?: unknown[]): Promise<{ rows: unknown[] }>;
  getClient(): PoolClient | null;
}

export class PostgresConnection implements DatabaseConnection {
  private pool: Pool;
  private logger: Logger;

  constructor(connectionString: string, poolSize: number, logger: Logger) {
    this.pool = new Pool({
      connectionString,
      max: poolSize,
    });
    this.logger = logger;
  }

  async isConnected(): Promise<boolean> {
    try {
      const client = await this.pool.connect();
      try {
        await client.query('SELECT 1');
        return true;
      } finally {
        client.release();
      }
    } catch (error) {
      this.logger.error({ err: error }, 'Database connection check failed');
      return false;
    }
  }

  async query(text: string, values?: unknown[]) {
    const client = await this.pool.connect();
    try {
      return await client.query(text, values);
    } finally {
      client.release();
    }
  }

  getClient(): PoolClient | null {
    // For migration purposes - returns null for now
    return null;
  }

  async close(): Promise<void> {
    try {
      await this.pool.end();
      this.logger.info({}, 'Database connection pool closed');
    } catch (error) {
      this.logger.error({ err: error }, 'Error closing database connection pool');
      throw error;
    }
  }
}
