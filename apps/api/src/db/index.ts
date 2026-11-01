import type { DatabaseConfig } from '../config/database.js';
import { PostgresConnection, type DatabaseConnection, type Logger } from './connection.js';

let instance: DatabaseConnection | null = null;

export function getDatabase(): DatabaseConnection | null {
  return instance;
}

export function initializeDatabase(config: DatabaseConfig, logger: Logger): DatabaseConnection {
  if (instance) {
    throw new Error('Database already initialized');
  }

  instance = new PostgresConnection(config.url, config.poolSize, logger);
  return instance;
}

export async function closeDatabase(): Promise<void> {
  if (instance) {
    await instance.close();
    instance = null;
  }
}
