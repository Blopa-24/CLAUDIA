import {
  type AsyncRemoteCallback,
  drizzle,
  type SqliteRemoteDatabase,
} from "drizzle-orm/sqlite-proxy";

import * as schema from "./schema";

/**
 * La base con la que trabajan los repositorios: Drizzle sobre una función que ejecuta SQL. En el
 * teléfono esa función usa la API asíncrona de expo-sqlite; en los tests, better-sqlite3 en
 * memoria. Todo es asíncrono: la API síncrona de expo-sqlite bloquea la app y en web corta los
 * resultados de más de 255 bytes (expo-sqlite 57, web/WorkerChannel.ts).
 */
export type AppDatabase = SqliteRemoteDatabase<typeof schema>;

/** Ejecuta una consulta. `get` devuelve una fila (arreglo de valores); el resto, filas. */
export type SqlRunner = AsyncRemoteCallback;

/** Una transacción abierta con `db.transaction`. */
export type AppTransaction = Parameters<Parameters<AppDatabase["transaction"]>[0]>[0];

/** La base o una transacción: para funciones que deben poder correr dentro de una. */
export type AppExecutor = AppDatabase | AppTransaction;

export function createAppDatabase(runner: SqlRunner): AppDatabase {
  return drizzle(runner, { schema });
}

export const DATABASE_NAME = "gymsuper.db";

/** Se aplica a cada conexión: SQLite no revisa claves foráneas si no se le pide. */
export const CONNECTION_PRAGMAS = "PRAGMA foreign_keys = ON;";
