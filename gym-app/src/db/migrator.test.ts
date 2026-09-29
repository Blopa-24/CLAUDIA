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

  it("actualiza una base con datos a la versión nueva sin perder nada (teléfono que ya tenía M2)", async () => {
    const full = readMigrationBundle();
    const [first] = full.journal.entries;
    if (!first) throw new Error("no hay migraciones");
    await runMigrations(test.db, { ...full, journal: { entries: [first] } });

    const now = 1_000;
    test.raw
      .prepare(
        `INSERT INTO exercises (id, name_es, name_en, is_custom, primary_muscle, equipment,
           movement_pattern, laterality, tracking_type, created_at, updated_at)
         VALUES ('e1', 'Press', 'Press', 0, 'chest', 'barbell', 'horizontal_push', 'bilateral',
           'weight_reps', ?, ?)`,
      )
      .run(now, now);
    test.raw
      .prepare(
        "INSERT INTO workout_sessions (id, status, created_at, updated_at) VALUES ('s1', 'planned', ?, ?)",
      )
      .run(now, now);
    test.raw
      .prepare(
        `INSERT INTO workout_exercises (id, session_id, exercise_id, exercise_name_snapshot,
           position, created_at, updated_at) VALUES ('we1', 's1', 'e1', 'Press', 0, ?, ?)`,
      )
      .run(now, now);

    await runMigrations(test.db, full);

    expect(test.raw.prepare("SELECT id, load_count FROM exercises").all()).toEqual([
      { id: "e1", load_count: 1 },
    ]);
    expect(test.raw.prepare("SELECT exercise_id FROM workout_exercises").all()).toEqual([
      { exercise_id: "e1" },
    ]);
    // Las claves foráneas quedan activas y siguen protegiendo el historial.
    expect(test.raw.pragma("foreign_keys", { simple: true })).toBe(1);
    expect(() => test.raw.prepare("DELETE FROM exercises WHERE id = 'e1'").run()).toThrow(
      /FOREIGN KEY/,
    );
    // Los valores nuevos se aceptan.
    expect(() =>
      test.raw
        .prepare(
          `INSERT INTO exercises (id, name_es, name_en, is_custom, primary_muscle, equipment,
             movement_pattern, laterality, tracking_type, load_count, created_at, updated_at)
           VALUES ('e2', 'Kelso', 'Kelso', 0, 'traps', 'dumbbell', 'isolation', 'bilateral',
             'weight_reps', 2, ?, ?)`,
        )
        .run(now, now),
    ).not.toThrow();
  });

  it("rechaza una migración que deja claves foráneas rotas y vuelve a activarlas", async () => {
    const orphan: MigrationBundle = {
      journal: { entries: [{ idx: 0, when: 100, tag: "0000_huerfana", breakpoints: true }] },
      migrations: {
        m0000: [
          "CREATE TABLE padre (id integer PRIMARY KEY);",
          "CREATE TABLE hijo (padre_id integer REFERENCES padre(id));",
          "INSERT INTO hijo VALUES (99);",
        ].join("\n--> statement-breakpoint\n"),
      },
    };
    await expect(runMigrations(test.db, orphan)).rejects.toThrow("claves foráneas rotas");
    expect(tables(test)).not.toContain("hijo");
    expect(test.raw.pragma("foreign_keys", { simple: true })).toBe(1);
  });

  it("avisa si falta el SQL de una migración del registro", async () => {
    const missing: MigrationBundle = {
      journal: { entries: [{ idx: 0, when: 100, tag: "0000_falta", breakpoints: true }] },
      migrations: {},
    };
    await expect(runMigrations(test.db, missing)).rejects.toThrow("0000_falta");
  });
});
