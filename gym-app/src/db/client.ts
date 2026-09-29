// Conexión a la base del teléfono. Es la única que abre expo-sqlite para los entrenamientos.

import { openDatabaseAsync, type SQLiteBindValue, type SQLiteDatabase } from "expo-sqlite";

import {
  type AppDatabase,
  CONNECTION_PRAGMAS,
  createAppDatabase,
  DATABASE_NAME,
  type SqlRunner,
} from "./database";
import { createLock } from "./lock";
import migrations from "./migrations/migrations";
import { runMigrations } from "./migrator";
import { seedExerciseCatalog } from "./seed/seed-exercises";

/** Ejecuta cada consulta de Drizzle con la API asíncrona de expo-sqlite, en modo arreglo. */
function expoRunner(client: SQLiteDatabase): SqlRunner {
  return async (query, params, method) => {
    const statement = await client.prepareAsync(query);
    try {
      const result = await statement.executeForRawResultAsync(params as SQLiteBindValue[]);
      if (method === "run") return { rows: [] };
      if (method === "get") return { rows: (await result.getFirstAsync()) ?? undefined } as never;
      return { rows: await result.getAllAsync() };
    } finally {
      await statement.finalizeAsync();
    }
  };
}

let connection: AppDatabase | null = null;
let opening: Promise<AppDatabase> | null = null;

async function open(): Promise<AppDatabase> {
  const client = await openDatabaseAsync(DATABASE_NAME);
  // WAL: las lecturas no esperan a las escrituras y un cierre inesperado no corrompe la base.
  await client.execAsync(`${CONNECTION_PRAGMAS} PRAGMA journal_mode = WAL;`);
  connection = createAppDatabase(expoRunner(client));
  return connection;
}

/** Una sola apertura aunque se pida dos veces a la vez: en web, un segundo acceso al archivo falla. */
function connect(): Promise<AppDatabase> {
  if (connection !== null) return Promise.resolve(connection);
  opening ??= open().finally(() => {
    opening = null;
  });
  return opening;
}

const lock = createLock();

/**
 * Usa la base ya preparada. Todas las tareas pasan de a una (ver lock.ts): así una transacción
 * nunca se mezcla con otra consulta. La app solo se muestra después de `prepareDatabase`.
 */
export function withDatabase<T>(task: (db: AppDatabase) => Promise<T>): Promise<T> {
  return lock(() => {
    if (connection === null) {
      throw new Error("La base de datos se usó antes de prepararla (prepareDatabase).");
    }
    return task(connection);
  });
}

/**
 * Deja la base lista antes de mostrar la app: aplica las migraciones pendientes y carga la
 * biblioteca incluida. Se puede reintentar si falla.
 */
export function prepareDatabase(now: number = Date.now()): Promise<void> {
  return lock(async () => {
    const db = await connect();
    await runMigrations(db, migrations);
    await seedExerciseCatalog(db, now);
  });
}
