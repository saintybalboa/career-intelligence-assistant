import type { FastifyInstance } from 'fastify';
import { getDatabase } from '../db/index.js';

interface PgExtensionRow {
  extversion?: string;
}

export async function registerReadyRoute(app: FastifyInstance): Promise<void> {
  app.get('/ready', async (request, reply) => {
    const db = getDatabase();

    if (!db) {
      request.log.warn('Database not initialized');
      return reply.code(503).send({
        status: 'unavailable',
        reason: 'database_not_initialized',
      });
    }

    try {
      const isConnected = await db.isConnected();

      if (!isConnected) {
        request.log.warn('Database connection check failed');
        return reply.code(503).send({
          status: 'unavailable',
          reason: 'database_unreachable',
        });
      }

      // Verify pgvector extension is available
      const result = await db.query(
        "SELECT extversion FROM pg_extension WHERE extname = 'vector';"
      );

      if (result.rows.length === 0) {
        request.log.warn('pgvector extension not found');
        return reply.code(503).send({
          status: 'unavailable',
          reason: 'pgvector_not_available',
        });
      }

      const row = result.rows[0] as PgExtensionRow;
      return reply.code(200).send({
        status: 'ready',
        pgvector_version: row.extversion || 'unknown',
      });
    } catch (error) {
      request.log.error({ err: error }, 'Ready check error');
      return reply.code(503).send({
        status: 'unavailable',
        reason: 'check_failed',
      });
    }
  });
}
