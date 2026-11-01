import { z } from 'zod';

const databaseConfigSchema = z.object({
  DATABASE_URL: z.string().min(1).default('postgresql://career:career_password@127.0.0.1:5432/career_ai'),
  DATABASE_POOL_SIZE: z.coerce.number().int().min(1).max(100).default(10),
});

export type DatabaseConfig = {
  url: string;
  poolSize: number;
};

export class DatabaseConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DatabaseConfigurationError';
  }
}

export function loadDatabaseConfig(env: NodeJS.ProcessEnv = process.env): DatabaseConfig {
  const result = databaseConfigSchema.safeParse(env);

  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.join('.') || 'configuration'}: ${issue.message}`)
      .join('; ');
    throw new DatabaseConfigurationError(`Invalid database configuration: ${details}`);
  }

  return {
    url: result.data.DATABASE_URL,
    poolSize: result.data.DATABASE_POOL_SIZE,
  };
}
