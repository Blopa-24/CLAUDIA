import type { Exercise } from "./exercise";
import type { SetPerformance } from "./types";
import {
  bestsFromHistory,
  summarizeWorkout,
  summarySet,
  type Workout,
  type WorkoutExercise,
  type WorkoutSet,
} from "./workout";

const MIN = 60_000;

function exercise(id: string, over: Partial<Exercise> = {}): Exercise {
  return {
    id,
    slug: null,
    name: { es: id, en: id },
    isCustom: false,
    primaryMuscle: "chest",
    secondaryMuscles: [],
    equipment: "barbell",
    movementPattern: "horizontal_push",
    laterality: "bilateral",
    trackingType: "weight_reps",
    loadCount: 1,
    notes: null,
    ...over,
  };
}

let nextId = 0;
const set = (weightKg: number | null, reps: number | null, over: Partial<WorkoutSet> = {}) => ({
  id: `set-${nextId++}`,
  position: 0,
  type: "working" as const,
  weightKg,
  enteredUnit: weightKg === null ? null : ("kg" as const),
  reps,
  rir: null,
  rpe: null,
  durationS: null,
  distanceM: null,
  completedAt: 0,
  ...over,
});

const perf = (weightKg: number, reps: number): SetPerformance => ({
  type: "working",
  weightKg,
  reps,
  completed: true,
});

const bench = exercise("bench");
const curls = exercise("curls", { equipment: "dumbbell", loadCount: 2 });
const pullUps = exercise("pullups", { trackingType: "reps_only" });

function workout(entries: [Exercise, WorkoutSet[]][]): Workout {
  return {
    id: "w1",
    routineName: null,
    notes: null,
    timing: {
      status: "completed",
      startedAt: 0,
      endedAt: 60 * MIN,
      pausedAt: null,
      pausedMs: 5 * MIN,
    },
    exercises: entries.map(([ex, sets], position) => ({
      id: `we-${position}`,
      exercise: ex,
      nameSnapshot: ex.name.es,
      position,
      completedAt: null,
      target: null,
      restS: null,
      sets,
    })),
  };
}

describe("summarizeWorkout", () => {
  it("cuenta duración sin pausas, ejercicios, series de trabajo y volumen", () => {
    const summary = summarizeWorkout(
      workout([
        [bench, [set(60, 10, { type: "warmup" }), set(80, 8), set(80, 8)]],
        [curls, [set(15, 10)]],
        [pullUps, [set(null, 10)]],
      ]),
      new Map(),
      60 * MIN,
    );
    expect(summary).toEqual({
      durationMs: 55 * MIN,
      exerciseCount: 3,
      workingSets: 4,
      // 80×8×2 del press + 15×10×2 de las dos mancuernas; el calentamiento y las dominadas no suman.
      volumeKg: 1280 + 300,
      records: [],
    });
  });

  it("la primera vez que se hace un ejercicio no hay récord: fija la marca", () => {
    const summary = summarizeWorkout(workout([[bench, [set(100, 5)]]]), new Map(), 60 * MIN);
    expect(summary.records).toEqual([]);
  });

  it("reporta récords contra el historial, con el nombre del ejercicio", () => {
    const history = new Map([["bench", [[perf(80, 8)], [perf(85, 5)]]]]);
    const summary = summarizeWorkout(workout([[bench, [set(90, 3)]]]), history, 60 * MIN);
    expect(summary.records).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: "heaviest_weight",
          value: 90,
          previous: 85,
          exerciseId: "bench",
          exerciseName: "bench",
        }),
      ]),
    );
  });

  it("si el mismo ejercicio aparece dos veces hoy, lo evalúa como uno", () => {
    const summary = summarizeWorkout(
      workout([
        [bench, [set(80, 8)]],
        [bench, [set(80, 8)]],
      ]),
      new Map([["bench", [[perf(80, 8)]]]]),
      60 * MIN,
    );
    expect(summary.exerciseCount).toBe(1);
    expect(summary.workingSets).toBe(2);
    expect(summary.records).toEqual([
      expect.objectContaining({ kind: "best_session_volume", value: 1280, previous: 640 }),
    ]);
  });
});

describe("bestsFromHistory", () => {
  it("null si el ejercicio nunca se hizo o solo hay sesiones vacías", () => {
    expect(
      bestsFromHistory([], { trackingType: "weight_reps", laterality: "bilateral", loadCount: 1 }),
    ).toBeNull();
    expect(
      bestsFromHistory([[]], {
        trackingType: "weight_reps",
        laterality: "bilateral",
        loadCount: 1,
      }),
    ).toBeNull();
  });

  it("acumula lo mejor de todas las sesiones", () => {
    const bests = bestsFromHistory([[perf(80, 8)], [perf(90, 2)], [perf(70, 12)]], {
      trackingType: "weight_reps",
      laterality: "bilateral",
      loadCount: 1,
    });
    expect(bests?.heaviestWeightKg).toBe(90);
    expect(bests?.bestSessionVolumeKg).toBe(840);
  });
});

describe("summarySet", () => {
  const entry = (ex: Exercise, sets: WorkoutSet[]): WorkoutExercise => ({
    id: "we",
    exercise: ex,
    nameSnapshot: ex.id,
    position: 0,
    completedAt: null,
    target: null,
    restS: null,
    sets,
  });

  it("en ejercicios de peso elige la serie de trabajo más pesada, y a igual peso la de más reps", () => {
    const sets = [set(100, 3, { type: "warmup" }), set(80, 8), set(85, 5), set(85, 6), set(70, 10)];
    expect(summarySet(entry(bench, sets))).toEqual(
      expect.objectContaining({ weightKg: 85, reps: 6 }),
    );
  });

  it("en el resto elige la última de trabajo", () => {
    expect(summarySet(entry(pullUps, [set(null, 12), set(null, 10)]))?.reps).toBe(10);
  });

  it("si solo hubo calentamiento, usa esas series; sin series, nada", () => {
    expect(summarySet(entry(bench, [set(40, 10, { type: "warmup" })]))?.weightKg).toBe(40);
    expect(summarySet(entry(bench, []))).toBeUndefined();
  });
});
