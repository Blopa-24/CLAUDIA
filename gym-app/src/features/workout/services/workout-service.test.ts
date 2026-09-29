import { findExerciseById } from "@/db/repositories/exercise-repository";
import { systemExerciseId } from "@/db/seed/exercise-catalog";
import { seedExerciseCatalog } from "@/db/seed/seed-exercises";
import { createTestDatabase, type TestDatabase } from "@/db/testing/test-database";
import type { Exercise } from "@/domain/exercise";
import type { SetDraft } from "@/domain/set-input";

import {
  addExercise,
  changeWorkoutStatus,
  completeSet,
  deleteSet,
  editSet,
  getOpenWorkoutId,
  getWorkout,
  getWorkoutSummary,
  listWorkoutHistory,
  previousPerformance,
  removeExercise,
  type ServiceDeps,
  startWorkout,
} from "./workout-service";

const MIN = 60_000;
const T0 = Date.UTC(2026, 8, 28, 18);

const draft = (over: Partial<SetDraft> = {}): SetDraft => ({
  type: "working",
  weight: "80",
  unit: "kg",
  reps: "8",
  rir: "",
  rpe: "",
  durationS: "",
  distanceM: "",
  ...over,
});

function unwrap<T>(result: { ok: true; value: T } | { ok: false; error: unknown }): T {
  if (!result.ok) throw new Error(`Se esperaba ok: ${JSON.stringify(result.error)}`);
  return result.value;
}

describe("workout-service", () => {
  let test: TestDatabase;
  let clock: number;
  let ids: number;
  let deps: ServiceDeps;
  let bench: Exercise;
  let curl: Exercise;

  beforeEach(async () => {
    test = await createTestDatabase();
    await seedExerciseCatalog(test.db, T0 - 60 * MIN);
    clock = T0;
    ids = 0;
    deps = { now: () => clock, newId: () => `id-${ids++}` };
    const found = await findExerciseById(test.db, systemExerciseId("barbell-bench-press"));
    const foundCurl = await findExerciseById(test.db, systemExerciseId("dumbbell-curl"));
    if (!found || !foundCurl) throw new Error("falta el catálogo");
    bench = found;
    curl = foundCurl;
  });
  afterEach(() => test.close());

  /** Un entrenamiento terminado con press de banca, a la hora `start`. */
  async function pastWorkout(start: number, sets: Partial<SetDraft>[]) {
    clock = start;
    const { workoutId } = await startWorkout(test.db, deps);
    const entry = unwrap(await addExercise(test.db, deps, workoutId, bench, "Press de banca"));
    for (const set of sets) unwrap(await completeSet(test.db, deps, entry, draft(set)));
    clock = start + 30 * MIN;
    unwrap(await changeWorkoutStatus(test.db, deps, workoutId, "finish"));
    return workoutId;
  }

  it("empieza un entrenamiento activo y queda guardado de inmediato", async () => {
    const { workoutId, resumed } = await startWorkout(test.db, deps);
    expect(resumed).toBe(false);
    expect(await getOpenWorkoutId(test.db)).toBe(workoutId);
    expect((await getWorkout(test.db, workoutId))?.timing).toEqual({
      status: "active",
      startedAt: T0,
      endedAt: null,
      pausedAt: null,
      pausedMs: 0,
    });
  });

  it("nunca hay dos entrenamientos abiertos: empezar de nuevo retoma el que quedó", async () => {
    const first = await startWorkout(test.db, deps);
    const second = await startWorkout(test.db, deps);
    expect(second).toEqual({ workoutId: first.workoutId, resumed: true });
  });

  it("registra series en orden, con el nombre del ejercicio al momento de entrenar", async () => {
    const { workoutId } = await startWorkout(test.db, deps);
    const entry = unwrap(await addExercise(test.db, deps, workoutId, bench, "Press de banca"));
    unwrap(await completeSet(test.db, deps, entry, draft({ rir: "2" })));
    clock += 3 * MIN;
    unwrap(await completeSet(test.db, deps, entry, draft({ reps: "7", rir: "1" })));

    const workout = await getWorkout(test.db, workoutId);
    expect(workout?.exercises).toHaveLength(1);
    expect(workout?.exercises[0]?.nameSnapshot).toBe("Press de banca");
    expect(workout?.exercises[0]?.sets.map((s) => [s.position, s.weightKg, s.reps, s.rir])).toEqual(
      [
        [0, 80, 8, 2],
        [1, 80, 7, 1],
      ],
    );
    expect(workout?.exercises[0]?.sets[1]?.completedAt).toBe(T0 + 3 * MIN);
  });

  it("rechaza una serie inválida sin guardar nada", async () => {
    const { workoutId } = await startWorkout(test.db, deps);
    const entry = unwrap(await addExercise(test.db, deps, workoutId, bench, "Press"));
    expect(await completeSet(test.db, deps, entry, draft({ reps: "" }))).toEqual({
      ok: false,
      error: { code: "invalid_set", error: { field: "reps", code: "required" } },
    });
    expect((await getWorkout(test.db, workoutId))?.exercises[0]?.sets).toEqual([]);
  });

  it("edita y borra series; una borrada no reaparece ni reutiliza su posición", async () => {
    const { workoutId } = await startWorkout(test.db, deps);
    const entry = unwrap(await addExercise(test.db, deps, workoutId, bench, "Press"));
    const first = unwrap(await completeSet(test.db, deps, entry, draft()));
    const second = unwrap(await completeSet(test.db, deps, entry, draft()));
    unwrap(await editSet(test.db, deps, first, draft({ weight: "82,5", reps: "6" })));
    unwrap(await deleteSet(test.db, deps, second));
    unwrap(await completeSet(test.db, deps, entry, draft({ reps: "5" })));

    const sets = (await getWorkout(test.db, workoutId))?.exercises[0]?.sets ?? [];
    expect(sets.map((s) => [s.position, s.weightKg, s.reps])).toEqual([
      [0, 82.5, 6],
      [2, 80, 5],
    ]);
  });

  it("quitar un ejercicio lo saca del entrenamiento", async () => {
    const { workoutId } = await startWorkout(test.db, deps);
    const entry = unwrap(await addExercise(test.db, deps, workoutId, bench, "Press"));
    unwrap(await addExercise(test.db, deps, workoutId, curl, "Curl"));
    unwrap(await removeExercise(test.db, deps, entry));
    expect((await getWorkout(test.db, workoutId))?.exercises.map((e) => e.nameSnapshot)).toEqual([
      "Curl",
    ]);
  });

  it("pausa y reanuda; registrar una serie en pausa reanuda solo", async () => {
    const { workoutId } = await startWorkout(test.db, deps);
    const entry = unwrap(await addExercise(test.db, deps, workoutId, bench, "Press"));
    clock += 10 * MIN;
    unwrap(await changeWorkoutStatus(test.db, deps, workoutId, "pause"));
    clock += 5 * MIN;
    unwrap(await completeSet(test.db, deps, entry, draft()));
    expect((await getWorkout(test.db, workoutId))?.timing).toEqual(
      expect.objectContaining({ status: "active", pausedAt: null, pausedMs: 5 * MIN }),
    );
  });

  it("no deja cambiar un entrenamiento terminado", async () => {
    const { workoutId } = await startWorkout(test.db, deps);
    const entry = unwrap(await addExercise(test.db, deps, workoutId, bench, "Press"));
    const set = unwrap(await completeSet(test.db, deps, entry, draft()));
    unwrap(await changeWorkoutStatus(test.db, deps, workoutId, "finish"));

    expect(await completeSet(test.db, deps, entry, draft())).toEqual({
      ok: false,
      error: { code: "not_open" },
    });
    expect(await editSet(test.db, deps, set, draft())).toEqual({
      ok: false,
      error: { code: "not_open" },
    });
    expect(await changeWorkoutStatus(test.db, deps, workoutId, "pause")).toEqual({
      ok: false,
      error: { code: "invalid_transition" },
    });
    expect(await getOpenWorkoutId(test.db)).toBeNull();
  });

  it("descartar conserva el entrenamiento, pero ya no queda abierto", async () => {
    const { workoutId } = await startWorkout(test.db, deps);
    unwrap(await changeWorkoutStatus(test.db, deps, workoutId, "abandon"));
    expect((await getWorkout(test.db, workoutId))?.timing.status).toBe("abandoned");
    expect(await getOpenWorkoutId(test.db)).toBeNull();
  });

  it("tras un cierre inesperado, el entrenamiento abierto se recupera con sus series", async () => {
    const { workoutId } = await startWorkout(test.db, deps);
    const entry = unwrap(await addExercise(test.db, deps, workoutId, bench, "Press"));
    unwrap(await completeSet(test.db, deps, entry, draft()));
    // "Reabrir la app": nada en memoria, solo la base.
    const reopened = await getOpenWorkoutId(test.db);
    expect(reopened).toBe(workoutId);
    expect((await getWorkout(test.db, reopened ?? ""))?.exercises[0]?.sets).toHaveLength(1);
  });

  it("muestra el rendimiento de la última vez, sin mezclar el entrenamiento actual", async () => {
    await pastWorkout(T0 - 3 * 24 * 60 * MIN, [{ weight: "75", reps: "8" }]);
    await pastWorkout(T0 - 24 * 60 * MIN, [{ weight: "80", reps: "8", rir: "2" }, { reps: "7" }]);
    clock = T0;
    const { workoutId } = await startWorkout(test.db, deps);
    const entry = unwrap(await addExercise(test.db, deps, workoutId, bench, "Press"));
    unwrap(await completeSet(test.db, deps, entry, draft({ weight: "100" })));

    const previous = await previousPerformance(test.db, [bench.id, curl.id], T0);
    expect(previous.get(bench.id)?.map((s) => [s.weightKg, s.reps, s.rir])).toEqual([
      [80, 8, 2],
      [80, 7, null],
    ]);
    expect(previous.has(curl.id)).toBe(false);
  });

  it("el resumen cuenta duración, series y volumen, y detecta récords", async () => {
    await pastWorkout(T0 - 24 * 60 * MIN, [{ weight: "80", reps: "8" }]);
    clock = T0;
    const { workoutId } = await startWorkout(test.db, deps);
    const entry = unwrap(await addExercise(test.db, deps, workoutId, bench, "Press de banca"));
    unwrap(
      await completeSet(test.db, deps, entry, draft({ type: "warmup", weight: "40", reps: "10" })),
    );
    unwrap(await completeSet(test.db, deps, entry, draft({ weight: "85", reps: "5" })));
    const curlEntry = unwrap(
      await addExercise(test.db, deps, workoutId, curl, "Curl con mancuernas"),
    );
    unwrap(await completeSet(test.db, deps, curlEntry, draft({ weight: "15", reps: "10" })));
    clock = T0 + 45 * MIN;
    unwrap(await changeWorkoutStatus(test.db, deps, workoutId, "finish"));

    const { summary } = unwrap(await getWorkoutSummary(test.db, workoutId, clock));
    expect(summary.durationMs).toBe(45 * MIN);
    expect(summary.exerciseCount).toBe(2);
    expect(summary.workingSets).toBe(2);
    // 85×5 del press + 15×10×2 de las dos mancuernas.
    expect(summary.volumeKg).toBe(425 + 300);
    // Récord de peso (85 > 80), pero no de 1RM estimado: 85 × 5 ≈ 99,2 no supera 80 × 8 ≈ 101,3.
    // El curl se hace por primera vez: fija su marca sin reportar récord.
    expect(summary.records).toEqual([
      expect.objectContaining({
        kind: "heaviest_weight",
        value: 85,
        previous: 80,
        exerciseName: "Press de banca",
      }),
    ]);
  });

  it("el historial lista solo los terminados, del más reciente al más antiguo", async () => {
    const older = await pastWorkout(T0 - 2 * 24 * 60 * MIN, [{ weight: "75" }]);
    const newer = await pastWorkout(T0 - 24 * 60 * MIN, [{ weight: "80" }]);
    clock = T0;
    await startWorkout(test.db, deps);

    const history = await listWorkoutHistory(test.db, T0);
    expect(history.map((item) => item.workout.id)).toEqual([newer, older]);
    expect(history[0]?.summary.volumeKg).toBe(640);
  });
});
