import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  out: './drizzle',
  dbCredentials: { url: process.env.DATABASE_URL! },
  schemaFilter: ['public'],
  tablesFilter: ['users', 'products', 'orders', 'order_items'], // start small
  entities: { roles: false },
});
