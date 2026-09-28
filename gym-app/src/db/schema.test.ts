// Las restricciones de la base: la última red contra datos corruptos (propuesta, sección 3.4).

import { createTestDatabase, type TestDatabase } from "./testing/test-database";

const NOW = Date.UTC(2026, 8, 28);

describe("esquema de SQLite", () => {
  let test: TestDatabase;
  const run = (statement: string, ...params: unknown[]) =>
    test.raw.prepare(statement).run(...params);

  function insertExercise(id = "e1") {
    run(
      `INSERT INTO exercises (id, name_es, name_en, is_custom, primary_muscle, equipment,
         movement_pattern, laterality, tracking_type, created_at, updated_at)
       VALUES (?, 'Press', 'Press', 0, 'chest', 'barbell', 'horizontal_push', 'bilateral',
         'weight_reps', ?, ?)`,
      id,
      NOW,
      NOW,
    );
  }

  function insertSession(id = "s1", started: number | null = NOW, ended: number | null = null) {
    run(
      `INSERT INTO workout_sessions (id, status, started_at, ended_at, created_at, updated_at)
       VALUES (?, 'active', ?, ?, ?, ?)`,
      id,
      started,
      ended,
      NOW,
      NOW,
    );
  }

  function insertWorkoutExercise(id = "we1", sessionId = "s1", exerciseId = "e1") {
    run(
      `INSERT INTO workout_exercises (id, session_id, exercise_id, exercise_name_snapshot,
         position, created_at, updated_at)
       VALUES (?, ?, ?, 'Press', 0, ?, ?)`,
      id,
      sessionId,
      exerciseId,
      NOW,
      NOW,
    );
  }

  function insertSet(values: Record<string, unknown>) {
    const columns = {
      id: "set1",
      workout_exercise_id: "we1",
      position: 0,
      type: "working",
      ...values,
    };
    const names = Object.keys(columns);
    run(
      `INSERT INTO sets (${names.join(", ")}, created_at, updated_at)
       VALUES (${names.map(() => "?").join(", ")}, ?, ?)`,
      ...Object.values(columns),
      NOW,
      NOW,
    );
  }

  beforeEach(async () => {
    test = await createTestDatabase();
    insertExercise();
    insertSession();
    insertWorkoutExercise();
  });
  afterEach(() => test.close());

  it("crea las tablas de M2", () => {
    const tables = test.raw
      .prepare(
        "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE '\\_%' ESCAPE '\\' AND name NOT LIKE 'sqlite%'",
      )
      .all()
      .map((row) => (row as { name: string }).name)
      .sort();
    expect(tables).toEqual(["exercises", "sets", "workout_exercises", "workout_sessions"]);
  });

  it("acepta una serie normal: 80 kg × 8 con RIR 2", () => {
    expect(() => insertSet({ weight_kg: 80, entered_unit: "kg", reps: 8, rir: 2 })).not.toThrow();
  });

  it.each([
    ["peso negativo", { weight_kg: -1 }],
    ["peso sobre 1.500 kg", { weight_kg: 1500.5 }],
    ["reps negativas", { reps: -1 }],
    ["RIR sobre 10", { rir: 11 }],
    ["RPE bajo 1", { rpe: 0.5 }],
    ["RPE que no va en pasos de 0,5", { rpe: 8.3 }],
    ["unidad desconocida", { entered_unit: "stone" }],
    ["tipo de serie desconocido", { type: "giant" }],
  ])("rechaza %s", (_label, values) => {
    expect(() => insertSet(values)).toThrow(/CHECK constraint failed/);
  });

  it("acepta RPE en pasos de 0,5", () => {
    expect(() => insertSet({ rpe: 7.5 })).not.toThrow();
  });

  it("rechaza un término anterior al inicio", () => {
    expect(() => insertSession("s2", NOW, NOW - 1)).toThrow(/CHECK constraint failed/);
  });

  it("acepta un entrenamiento planificado que se abandonó sin empezar", () => {
    expect(() => insertSession("s3", null, NOW)).not.toThrow();
  });

  it("rechaza series de un ejercicio que no existe en el entrenamiento", () => {
    expect(() => insertSet({ workout_exercise_id: "no-existe" })).toThrow(/FOREIGN KEY/);
  });

  it("no deja borrar de verdad un ejercicio usado en un entrenamiento", () => {
    expect(() => run("DELETE FROM exercises WHERE id = 'e1'")).toThrow(/FOREIGN KEY/);
  });

  it("borrar un entrenamiento borra sus ejercicios y series, nada queda huérfano", () => {
    insertSet({ weight_kg: 80, reps: 8 });
    run("DELETE FROM workout_sessions WHERE id = 's1'");
    const count = (table: string) =>
      (test.raw.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get() as { n: number }).n;
    expect(count("workout_exercises")).toBe(0);
    expect(count("sets")).toBe(0);
    expect(count("exercises")).toBe(1);
  });
});
