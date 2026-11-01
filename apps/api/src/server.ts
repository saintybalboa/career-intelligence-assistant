import { pathToFileURL } from 'node:url';
import { createApp } from './app.js';
import { loadConfig } from './config/env.js';
import { loadDatabaseConfig } from './config/database.js';

export async function startServer(): Promise<void> {
  const config = loadConfig();
  const databaseConfig = loadDatabaseConfig();
  const app = createApp({ config, databaseConfig });

  const shutdown = async (signal: string): Promise<void> => {
    app.log.info({ signal }, 'Shutting down server');
    try {
      await app.close();
    } catch (error) {
      app.log.error({ err: error }, 'Server shutdown failed');
      process.exitCode = 1;
    }
  };

  process.once('SIGINT', () => void shutdown('SIGINT'));
  process.once('SIGTERM', () => void shutdown('SIGTERM'));

  try {
    await app.listen({ host: config.host, port: config.port });
    app.log.info({ host: config.host, port: config.port }, 'Server listening');
  } catch (error) {
    app.log.error({ err: error }, 'Server startup failed');
    await app.close();
    process.exitCode = 1;
  }
}

const entrypoint = process.argv[1];
if (entrypoint && import.meta.url === pathToFileURL(entrypoint).href) {
  void startServer();
}
