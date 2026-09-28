import { defineConfig } from "drizzle-kit";

// Genera las migraciones de SQLite a partir de src/db/schema.ts: `npm run db:generate`.
export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "sqlite",
  driver: "expo",
});
