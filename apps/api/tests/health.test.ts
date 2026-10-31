import { afterEach, describe, expect, it } from 'vitest';

import { createApp } from '../src/app.js';
import { ConfigurationError, loadConfig } from '../src/config/env.js';

describe('API HTTP behavior', () => {
  const apps: ReturnType<typeof createApp>[] = [];

  afterEach(async () => {
    await Promise.all(apps.map((app) => app.close()));
    apps.length = 0;
  });

  function createTestApp() {
    const app = createApp(
      loadConfig({
        NODE_ENV: 'test',
        HOST: '127.0.0.1',
        PORT: '3001',
        CORS_ORIGIN: 'http://localhost:5173',
        LOG_LEVEL: 'silent',
      }),
    );
    apps.push(app);
    return app;
  }

  it('returns a healthy JSON response', async () => {
    const response = await createTestApp().inject({
      method: 'GET',
      url: '/health',
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toMatch(/^application\/json/);
    expect(response.json()).toEqual({ status: 'ok' });
  });

  it('returns a consistent JSON response for unknown routes', async () => {
    const response = await createTestApp().inject({
      method: 'GET',
      url: '/missing',
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({
      error: {
        code: 'NOT_FOUND',
        message: 'Route not found',
      },
    });
  });

  it('allows the configured frontend origin and rejects other origins', async () => {
    const app = createTestApp();
    const allowed = await app.inject({
      method: 'OPTIONS',
      url: '/health',
      headers: {
        origin: 'http://localhost:5173',
        'access-control-request-method': 'GET',
      },
    });
    const disallowed = await app.inject({
      method: 'OPTIONS',
      url: '/health',
      headers: {
        origin: 'https://malicious.example',
        'access-control-request-method': 'GET',
      },
    });

    expect(allowed.statusCode).toBe(204);
    expect(allowed.headers['access-control-allow-origin']).toBe('http://localhost:5173');
    expect(disallowed.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('does not expose unexpected error details', async () => {
    const app = createTestApp();
    app.get('/failure', async () => {
      throw new Error('private implementation detail');
    });

    const response = await app.inject({
      method: 'GET',
      url: '/failure',
    });

    expect(response.statusCode).toBe(500);
    expect(response.json()).toEqual({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Internal server error',
      },
    });
    expect(response.body).not.toContain('private implementation detail');
  });

  it('preserves appropriate client error status codes', async () => {
    const app = createTestApp();
    app.get('/bad-request', async () => {
      const error = new Error('invalid input');
      Object.assign(error, { statusCode: 400 });
      throw error;
    });

    const response = await app.inject({
      method: 'GET',
      url: '/bad-request',
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({
      error: {
        code: 'BAD_REQUEST',
        message: 'Bad request',
      },
    });
  });
});

describe('environment configuration', () => {
  it('loads defaults for an empty environment', () => {
    expect(loadConfig({})).toEqual({
      nodeEnv: 'development',
      host: '127.0.0.1',
      port: 3001,
      corsOrigin: 'http://localhost:5173',
      logLevel: 'info',
    });
  });

  it('rejects invalid environment values with a useful error', () => {
    expect(() => loadConfig({ PORT: 'not-a-port' })).toThrowError(ConfigurationError);
    expect(() => loadConfig({ PORT: 'not-a-port' })).toThrowError(/PORT/);
  });
});
