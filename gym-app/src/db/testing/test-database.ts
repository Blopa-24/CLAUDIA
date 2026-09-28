// Base real de SQLite en memoria para los tests, con el mismo migrador y las mismas migraciones
// que usa el teléfono.

import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

import { type AppDatabase, CONNECTION_PRAGMAS, createAppDatabase } from "../database";
import { type MigrationBundle, runMigrations } from "../migrator";

const MIGRATIONS_FOLDER = path.join(__dirname, "..", "migrations");

/** Lo mismo que arma migrations.js en la app, leído desde el disco. */
export function readMigrationBundle(): MigrationBundle {
  const journal = JSON.parse(
    fs.readFileSync(path.join(MIGRATIONS_FOLDER, "meta", "_journal.json"), "utf8"),
  ) as MigrationBundle["journal"];
  const migrations = Object.fromEntries(
    journal.entries.map((entry) => [
      `m${String(entry.idx).padStart(4, "0")}`,
      fs.readFileSync(path.join(MIGRATIONS_FOLDER, `${entry.tag}.sql`), "utf8"),
    ]),
  );
  return { journal, migrations };
}

export interface TestDatabase {
  db: AppDatabase;
  /** SQL directo, para revisar lo que quedó guardado sin pasar por los repositorios. */
  raw: Database.Database;
  close: () => void;
}

/** Base vacía con la conexión configurada, sin migrar. */
export function openTestDatabase(): TestDatabase {
  const raw = new Database(":memory:");
  raw.exec(CONNECTION_PRAGMAS);
  const db = createAppDatabase(async (query, params, method) => {
    const statement = raw.prepare(query);
    if (method === "run" || !statement.reader) {
      statement.run(...params);
      return { rows: [] };
    }
    if (method === "get") return { rows: statement.raw().get(...params) as never };
    return { rows: statement.raw().all(...params) };
  });
  return { db, raw, close: () => raw.close() };
}

/** Base migrada y lista para usar. */
export async function createTestDatabase(): Promise<TestDatabase> {
  const test = openTestDatabase();
  await runMigrations(test.db, readMigrationBundle());
  return test;
}
