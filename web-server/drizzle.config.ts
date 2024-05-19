import type { Config } from 'drizzle-kit';

export default {
  schema: './src/database/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    dbName: 'sqlite.db',
    url: 'sqlite.db',
  },
} satisfies Config;
