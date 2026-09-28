import { type MigrationBundle, runMigrations } from "./migrator";
import { openTestDatabase, readMigrationBundle, type TestDatabase } from "./testing/test-database";

const tables = (test: TestDatabase) =>
  test.raw
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name")
    .all()
    .map((row) => (row as { name: string }).name);

const applied = (test: TestDatabase) =>
  test.raw.prepare("SELECT hash, created_at FROM __drizzle_migrations ORDER BY id").all();

describe("runMigrations", () => {
  let test: TestDatabase;
  beforeEach(() => {
    test = openTestDatabase();
  });
  afterEach(() => test.close());

  it("aplica las migraciones del proyecto y las registra", async () => {
    const bundle = readMigrationBundle();
    await runMigrations(test.db, bundle);
    expect(tables(test)).toEqual(
      expect.arrayContaining(["exercises", "sets", "workout_exercises", "workout_sessions"]),
    );
    expect(applied(test)).toHaveLength(bundle.journal.entries.length);
  });

  it("al volver a correr no repite nada (cada arranque de la app)", async () => {
    const bundle = readMigrationBundle();
    await runMigrations(test.db, bundle);
    await runMigrations(test.db, bundle);
    expect(applied(test)).toHaveLength(bundle.journal.entries.length);
  });

  it("aplica solo las nuevas, en orden", async () => {
    const first: MigrationBundle = {
      journal: { entries: [{ idx: 0, when: 100, tag: "0000_a", breakpoints: true }] },
      migrations: { m0000: "CREATE TABLE a (id integer);" },
    };
    await runMigrations(test.db, first);

    const second: MigrationBundle = {
      journal: {
        entries: [
          { idx: 1, when: 200, tag: "0001_b", breakpoints: true },
          ...first.journal.entries,
        ],
      },
      migrations: {
        ...first.migrations,
        m0001: "CREATE TABLE b (id integer);\n--> statement-breakpoint\nINSERT INTO b VALUES (1);",
      },
    };
    await runMigrations(test.db, second);

    expect(applied(test)).toEqual([
      { hash: "0000_a", created_at: 100 },
      { hash: "0001_b", created_at: 200 },
    ]);
    expect(test.raw.prepare("SELECT COUNT(*) AS n FROM b").get()).toEqual({ n: 1 });
  });

  it("si una migración falla, la deshace completa y no la registra", async () => {
    const broken: MigrationBundle = {
      journal: { entries: [{ idx: 0, when: 100, tag: "0000_rota", breakpoints: true }] },
      migrations: {
        m0000: "CREATE TABLE c (id integer);\n--> statement-breakpoint\nESTO NO ES SQL;",
      },
    };
    await expect(runMigrations(test.db, broken)).rejects.toThrow();
    expect(tables(test)).not.toContain("c");
    expect(applied(test)).toEqual([]);
  });

  it("avisa si falta el SQL de una migración del registro", async () => {
    const missing: MigrationBundle = {
      journal: { entries: [{ idx: 0, when: 100, tag: "0000_falta", breakpoints: true }] },
      migrations: {},
    };
    await expect(runMigrations(test.db, missing)).rejects.toThrow("0000_falta");
  });
});
