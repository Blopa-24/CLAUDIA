import { findExerciseById } from "@/db/repositories/exercise-repository";
import { systemExerciseId } from "@/db/seed/exercise-catalog";
import { seedExerciseCatalog } from "@/db/seed/seed-exercises";
import { createTestDatabase, type TestDatabase } from "@/db/testing/test-database";
import type { TargetDraft } from "@/domain/routine";
import {
  addExercise,
  getWorkout,
  type ServiceDeps,
  startWorkout,
  startWorkoutFromRoutine,
} from "@/features/workout/services/workout-service";

import {
  deleteRoutine,
  getRoutine,
  listRoutines,
  type RoutineInput,
  saveRoutine,
} from "./routine-service";

const T0 = Date.UTC(2026, 8, 29, 18);
const SQUAT = systemExerciseId("back-squat");
const RDL = systemExerciseId("romanian-deadlift");
const CALF = systemExerciseId("standing-calf-raise");

const target = (over: Partial<TargetDraft> = {}): TargetDraft => ({
  sets: "",
  repsMin: "",
  repsMax: "",
  rir: "",
  ...over,
});

const legDay = (over: Partial<RoutineInput> = {}): RoutineInput => ({
  name: "Día de pierna",
  items: [
    {
      exerciseId: SQUAT,
      target: target({ sets: "4", repsMin: "6", repsMax: "8", rir: "2" }),
      restS: 180,
    },
    { exerciseId: RDL, target: target({ sets: "3", repsMin: "10" }), restS: null },
  ],
  ...over,
});

function unwrap<T>(result: { ok: true; value: T } | { ok: false; error: unknown }): T {
  if (!result.ok) throw new Error(`Se esperaba ok: ${JSON.stringify(result.error)}`);
  return result.value;
}

describe("routine-service", () => {
  let test: TestDatabase;
  let ids: number;
  let deps: ServiceDeps;

  beforeEach(async () => {
    test = await createTestDatabase();
    await seedExerciseCatalog(test.db, T0);
    ids = 0;
    deps = { now: () => T0, newId: () => `id-${ids++}` };
  });
  afterEach(() => test.close());

  it("crea una rutina con sus ejercicios en orden y sus objetivos", async () => {
    const id = unwrap(await saveRoutine(test.db, deps, null, legDay()));
    const routine = await getRoutine(test.db, id);
    expect(routine?.name).toBe("Día de pierna");
    expect(routine?.exercises.map((e) => [e.exercise.id, e.position, e.target, e.restS])).toEqual([
      [SQUAT, 0, { sets: 4, repsMin: 6, repsMax: 8, rir: 2 }, 180],
      [RDL, 1, { sets: 3, repsMin: 10, repsMax: 10, rir: null }, null],
    ]);
  });

  it("editar reemplaza nombre y ejercicios, sin duplicar", async () => {
    const id = unwrap(await saveRoutine(test.db, deps, null, legDay()));
    unwrap(
      await saveRoutine(test.db, deps, id, {
        name: "Pierna B",
        items: [{ exerciseId: CALF, target: target({ sets: "5" }), restS: 60 }],
      }),
    );
    const routine = await getRoutine(test.db, id);
    expect(routine?.name).toBe("Pierna B");
    expect(routine?.exercises.map((e) => e.exercise.id)).toEqual([CALF]);
    expect(await listRoutines(test.db)).toHaveLength(1);
  });

  it.each([
    ["sin nombre", { name: "  " }, { code: "name", error: "required" }],
    ["sin ejercicios", { items: [] }, { code: "no_exercises" }],
    [
      "un objetivo inválido, indicando cuál",
      {
        items: [
          { exerciseId: SQUAT, target: target(), restS: null },
          { exerciseId: RDL, target: target({ sets: "0" }), restS: null },
        ],
      },
      { code: "target", index: 1, error: { field: "sets", code: "out_of_range" } },
    ],
    [
      "un descanso fuera de rango",
      { items: [{ exerciseId: SQUAT, target: target(), restS: 5000 }] },
      { code: "invalid_rest", index: 0 },
    ],
    [
      "un ejercicio que no existe",
      { items: [{ exerciseId: "no-existe", target: target(), restS: null }] },
      { code: "unknown_exercise", index: 0 },
    ],
  ] as const)("rechaza %s sin guardar nada", async (_label, over, error) => {
    expect(await saveRoutine(test.db, deps, null, legDay(over as Partial<RoutineInput>))).toEqual({
      ok: false,
      error,
    });
    expect(await listRoutines(test.db)).toEqual([]);
  });

  it("borrar la saca de la lista, pero los entrenamientos hechos con ella siguen intactos", async () => {
    const id = unwrap(await saveRoutine(test.db, deps, null, legDay()));
    const { workoutId } = unwrap(
      await startWorkoutFromRoutine(test.db, deps, id, (e) => e.name.es),
    );
    unwrap(await deleteRoutine(test.db, deps, id));

    expect(await listRoutines(test.db)).toEqual([]);
    expect(await getRoutine(test.db, id)).toBeNull();
    const workout = await getWorkout(test.db, workoutId);
    expect(workout?.routineName).toBe("Día de pierna");
    expect(workout?.exercises).toHaveLength(2);
  });

  it("empezar desde la rutina carga los ejercicios con su nombre, objetivos y descanso", async () => {
    const id = unwrap(await saveRoutine(test.db, deps, null, legDay()));
    const { workoutId, resumed } = unwrap(
      await startWorkoutFromRoutine(test.db, deps, id, (e) => e.name.es),
    );
    expect(resumed).toBe(false);
    const workout = await getWorkout(test.db, workoutId);
    expect(workout?.routineName).toBe("Día de pierna");
    expect(workout?.timing.status).toBe("active");
    expect(
      workout?.exercises.map((e) => [e.nameSnapshot, e.target, e.restS, e.completedAt, e.sets]),
    ).toEqual([
      ["Sentadilla con barra", { sets: 4, repsMin: 6, repsMax: 8, rir: 2 }, 180, null, []],
      ["Peso muerto rumano", { sets: 3, repsMin: 10, repsMax: 10, rir: null }, null, null, []],
    ]);
  });

  it("editar la rutina después no cambia el entrenamiento ya empezado", async () => {
    const id = unwrap(await saveRoutine(test.db, deps, null, legDay()));
    const { workoutId } = unwrap(
      await startWorkoutFromRoutine(test.db, deps, id, (e) => e.name.es),
    );
    unwrap(
      await saveRoutine(test.db, deps, id, {
        name: "Otra cosa",
        items: [{ exerciseId: CALF, target: target({ sets: "1" }), restS: null }],
      }),
    );
    const workout = await getWorkout(test.db, workoutId);
    expect(workout?.routineName).toBe("Día de pierna");
    expect(workout?.exercises[0]?.target?.sets).toBe(4);
  });

  it("si ya hay un entrenamiento abierto, lo retoma en vez de empezar otro", async () => {
    const id = unwrap(await saveRoutine(test.db, deps, null, legDay()));
    const { workoutId: open } = await startWorkout(test.db, deps);
    expect(await startWorkoutFromRoutine(test.db, deps, id, (e) => e.name.es)).toEqual({
      ok: true,
      value: { workoutId: open, resumed: true },
    });
  });

  it("una rutina borrada o inexistente no se puede empezar", async () => {
    expect(await startWorkoutFromRoutine(test.db, deps, "no-existe", (e) => e.name.es)).toEqual({
      ok: false,
      error: { code: "not_found" },
    });
  });

  it("un entrenamiento libre sigue sin rutina ni objetivos", async () => {
    const squat = await findExerciseById(test.db, SQUAT);
    if (!squat) throw new Error("falta el catálogo");
    const { workoutId } = await startWorkout(test.db, deps);
    unwrap(await addExercise(test.db, deps, workoutId, squat, "Sentadilla"));
    const workout = await getWorkout(test.db, workoutId);
    expect(workout?.routineName).toBeNull();
    expect(workout?.exercises[0]?.target).toBeNull();
    expect(workout?.exercises[0]?.restS).toBeNull();
  });
});
