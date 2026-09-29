// Un entrenamiento tal como quedó guardado (skill workout-engine, "CORE FLOW"): sesión → ejercicios
// → series. Solo tipos y cálculos; la base de datos vive en src/db.

import type { Exercise } from "./exercise";
import { evaluateSessionRecords, type ExerciseBests, type NewRecord } from "./personal-records";
import type { ExerciseTracking, SetPerformance, SetType } from "./types";
import type { WeightUnit } from "./units";
import { totalVolume } from "./volume";
import { activeDurationMs, type SessionTiming } from "./workout-session";

export interface WorkoutSet {
  id: string;
  position: number;
  type: SetType;
  weightKg: number | null;
  enteredUnit: WeightUnit | null;
  reps: number | null;
  rir: number | null;
  rpe: number | null;
  durationS: number | null;
  distanceM: number | null;
  /** Hora en que se completó. Una serie guardada siempre está completada. */
  completedAt: number;
}

export interface WorkoutExercise {
  id: string;
  exercise: Exercise;
  /** Nombre al momento de entrenar: el historial no cambia si después se renombra el ejercicio. */
  nameSnapshot: string;
  position: number;
  sets: WorkoutSet[];
}

export interface Workout {
  id: string;
  timing: SessionTiming;
  notes: string | null;
  exercises: WorkoutExercise[];
}

export function toPerformance(set: WorkoutSet): SetPerformance {
  return { type: set.type, weightKg: set.weightKg, reps: set.reps, completed: true };
}

export const trackingOf = (exercise: Exercise): ExerciseTracking => ({
  trackingType: exercise.trackingType,
  laterality: exercise.laterality,
  loadCount: exercise.loadCount,
});

export interface WorkoutRecord extends NewRecord {
  exerciseId: string;
  exerciseName: string;
}

export interface WorkoutSummary {
  durationMs: number;
  exerciseCount: number;
  /** Series que no son de calentamiento. */
  workingSets: number;
  /** Volumen en kg de los ejercicios con peso, sin calentamiento. */
  volumeKg: number;
  records: WorkoutRecord[];
}

/**
 * Mejores marcas de un ejercicio a partir de sus sesiones anteriores, de la más antigua a la más
 * nueva. null si nunca se hizo (así la primera sesión fija la marca sin reportar récords).
 */
export function bestsFromHistory(
  sessions: readonly (readonly SetPerformance[])[],
  exercise: ExerciseTracking,
): ExerciseBests | null {
  let bests: ExerciseBests | null = null;
  for (const sets of sessions) {
    if (sets.length === 0) continue;
    bests = evaluateSessionRecords(bests, sets, exercise).bests;
  }
  return bests;
}

/**
 * Resumen de un entrenamiento. `history` entrega, por ID de ejercicio, las series de cada sesión
 * anterior en orden cronológico; si el mismo ejercicio aparece dos veces hoy, cuenta como una.
 */
export function summarizeWorkout(
  workout: Workout,
  history: ReadonlyMap<string, readonly (readonly SetPerformance[])[]>,
  now: number,
): WorkoutSummary {
  const byExercise = new Map<string, { entry: WorkoutExercise; sets: SetPerformance[] }>();
  for (const entry of workout.exercises) {
    const current = byExercise.get(entry.exercise.id);
    const sets = entry.sets.map(toPerformance);
    if (current) current.sets.push(...sets);
    else byExercise.set(entry.exercise.id, { entry, sets });
  }

  let volumeKg = 0;
  let workingSets = 0;
  const records: WorkoutRecord[] = [];
  for (const [exerciseId, { entry, sets }] of byExercise) {
    const tracking = trackingOf(entry.exercise);
    workingSets += sets.filter((set) => set.type !== "warmup").length;
    volumeKg += totalVolume(sets, tracking) ?? 0;
    const previous = bestsFromHistory(history.get(exerciseId) ?? [], tracking);
    for (const record of evaluateSessionRecords(previous, sets, tracking).newRecords) {
      records.push({ ...record, exerciseId, exerciseName: entry.nameSnapshot });
    }
  }

  return {
    durationMs: activeDurationMs(workout.timing, now),
    exerciseCount: byExercise.size,
    workingSets,
    volumeKg,
    records,
  };
}
