import { z } from 'zod';

const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  HOST: z.string().min(1).default('127.0.0.1'),
  PORT: z.coerce.number().int().min(1).max(65_535).default(3001),
  CORS_ORIGIN: z.string().url().default('http://localhost:5173'),
  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
    .default('info'),
});

export type AppConfig = {
  nodeEnv: 'development' | 'test' | 'production';
  host: string;
  port: number;
  corsOrigin: string;
  logLevel: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace' | 'silent';
};

export class ConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const result = environmentSchema.safeParse(env);

  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.join('.') || 'configuration'}: ${issue.message}`)
      .join('; ');
    throw new ConfigurationError(`Invalid environment configuration: ${details}`);
  }

  return {
    nodeEnv: result.data.NODE_ENV,
    host: result.data.HOST,
    port: result.data.PORT,
    corsOrigin: result.data.CORS_ORIGIN,
    logLevel: result.data.LOG_LEVEL,
  };
}
