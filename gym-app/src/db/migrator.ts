// Aplica las migraciones que genera drizzle-kit (src/db/migrations). Usa la misma tabla de control
// que el migrador de Drizzle, así las herramientas de drizzle-kit siguen entendiendo la base.
//
// Existe porque el migrador de Drizzle para Expo es síncrono (falla en web, ver database.ts) y el
// asíncrono lee los archivos del disco, que en el teléfono no existen.

import { sql } from "drizzle-orm";

import type { AppDatabase } from "./database";

export interface MigrationBundle {
  journal: { entries: { idx: number; when: number; tag: string; breakpoints: boolean }[] };
  /** SQL de cada migración, con la clave `m0000`, `m0001`… */
  migrations: Record<string, string>;
}

const MIGRATIONS_TABLE = "__drizzle_migrations";
const STATEMENT_BREAKPOINT = "--> statement-breakpoint";

const migrationKey = (idx: number) => `m${String(idx).padStart(4, "0")}`;

/**
 * Aplica, en orden, las migraciones posteriores a la última registrada. Cada una va en su propia
 * transacción: si falla, la base queda como estaba antes de esa migración.
 */
export async function runMigrations(db: AppDatabase, bundle: MigrationBundle): Promise<void> {
  await db.run(
    sql.raw(
      `CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (id INTEGER PRIMARY KEY AUTOINCREMENT, hash text NOT NULL, created_at numeric)`,
    ),
  );
  const [last] = await db.values<[number]>(
    sql.raw(`SELECT created_at FROM ${MIGRATIONS_TABLE} ORDER BY created_at DESC LIMIT 1`),
  );
  const lastApplied = last?.[0] ?? null;

  const pending = [...bundle.journal.entries]
    .sort((a, b) => a.idx - b.idx)
    .filter((entry) => lastApplied === null || entry.when > lastApplied);

  for (const entry of pending) {
    const text = bundle.migrations[migrationKey(entry.idx)];
    if (text === undefined) throw new Error(`Falta el SQL de la migración ${entry.tag}`);
    const statements = text
      .split(STATEMENT_BREAKPOINT)
      .map((statement) => statement.trim())
      .filter(Boolean);

    // Para rehacer una tabla (lo único que permite SQLite para cambiar un CHECK), las claves
    // foráneas se apagan fuera de la transacción y, antes de confirmar, se revisa que ninguna
    // quedó rota (https://www.sqlite.org/lang_altertable.html, sección 7).
    await db.run(sql.raw("PRAGMA foreign_keys = OFF"));
    try {
      await db.transaction(async (tx) => {
        for (const statement of statements) await tx.run(sql.raw(statement));
        const broken = await tx.values(sql.raw("PRAGMA foreign_key_check"));
        if (broken.length > 0) {
          throw new Error(`La migración ${entry.tag} dejó ${broken.length} claves foráneas rotas`);
        }
        await tx.run(
          sql`INSERT INTO ${sql.raw(MIGRATIONS_TABLE)} (hash, created_at) VALUES (${entry.tag}, ${entry.when})`,
        );
      });
    } finally {
      await db.run(sql.raw("PRAGMA foreign_keys = ON"));
    }
  }
}
