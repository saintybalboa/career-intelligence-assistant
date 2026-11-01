import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    exclude: process.env.INCLUDE_DB_TESTS ? [] : ['tests/database.test.ts'],
  },
});
