import cors from '@fastify/cors';
import Fastify, { type FastifyInstance } from 'fastify';

import { loadConfig, type AppConfig } from './config/env.js';
import { registerHealthRoute } from './routes/health.js';

export function createApp(config: AppConfig = loadConfig()): FastifyInstance {
  const app = Fastify({
    logger: {
      level: config.logLevel,
    },
    requestIdHeader: 'x-request-id',
  });

  void app.register(cors, {
    origin: (origin, callback) => {
      callback(null, origin === config.corsOrigin);
    },
  });

  void app.register(registerHealthRoute);

  app.setNotFoundHandler((_request, reply) => {
    void reply.code(404).send({
      error: {
        code: 'NOT_FOUND',
        message: 'Route not found',
      },
    });
  });

  app.setErrorHandler((error, request, reply) => {
    request.log.error({ err: error }, 'Unexpected request error');
    const errorStatusCode =
      typeof error === 'object' &&
      error !== null &&
      'statusCode' in error &&
      typeof error.statusCode === 'number'
        ? error.statusCode
        : undefined;
    const statusCode =
      errorStatusCode !== undefined && errorStatusCode >= 400 && errorStatusCode < 500
        ? errorStatusCode
        : 500;
    const clientError = statusCode < 500;

    void reply.code(statusCode).send({
      error: {
        code: clientError ? 'BAD_REQUEST' : 'INTERNAL_SERVER_ERROR',
        message: clientError ? 'Bad request' : 'Internal server error',
      },
    });
  });

  return app;
}
