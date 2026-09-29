// Única puerta de entrada a workout_sessions, workout_exercises y sets (skill database, sección 7).
// Borrar es lógico (deleted_at): nada del historial desaparece de verdad.

import { and, asc, desc, eq, inArray, isNull, lt, max } from "drizzle-orm";

import { hasTarget, type RoutineTarget } from "@/domain/routine";
import type { ValidSet } from "@/domain/set-input";
import type { Workout, WorkoutExercise, WorkoutSet } from "@/domain/workout";
import type { SessionStatus, SessionTiming } from "@/domain/workout-session";

import type { AppDatabase, AppExecutor } from "../database";
import { exercises, sets, workoutExercises, workoutSessions } from "../schema";

import { toExercise } from "./exercise-repository";

type SetRow = typeof sets.$inferSelect;

/** Objetivo guardado en una fila; null si no fija nada. */
export function targetFromRow(row: {
  targetSets: number | null;
  targetRepsMin: number | null;
  targetRepsMax: number | null;
  targetRir: number | null;
}): RoutineTarget | null {
  const target: RoutineTarget = {
    sets: row.targetSets,
    repsMin: row.targetRepsMin,
    repsMax: row.targetRepsMax,
    rir: row.targetRir,
  };
  return hasTarget(target) ? target : null;
}

function toWorkoutSet(row: SetRow): WorkoutSet {
  return {
    id: row.id,
    position: row.position,
    type: row.type,
    weightKg: row.weightKg,
    enteredUnit: row.enteredUnit,
    reps: row.reps,
    rir: row.rir,
    rpe: row.rpe,
    durationS: row.durationS,
    distanceM: row.distanceM,
    completedAt: row.completedAt ?? row.createdAt,
  };
}

const OPEN_STATUSES: SessionStatus[] = ["planned", "active", "paused"];

export async function insertSession(
  db: AppExecutor,
  session: {
    id: string;
    timing: SessionTiming;
    now: number;
    routine?: { id: string; name: string } | null;
  },
): Promise<void> {
  const { timing } = session;
  await db
    .insert(workoutSessions)
    .values({
      id: session.id,
      status: timing.status,
      startedAt: timing.startedAt,
      endedAt: timing.endedAt,
      pausedAt: timing.pausedAt,
      pausedMs: timing.pausedMs,
      routineId: session.routine?.id ?? null,
      routineNameSnapshot: session.routine?.name ?? null,
      createdAt: session.now,
      updatedAt: session.now,
    })
    .run();
}

export async function updateSessionTiming(
  db: AppDatabase,
  id: string,
  timing: SessionTiming,
  now: number,
): Promise<void> {
  await db
    .update(workoutSessions)
    .set({
      status: timing.status,
      startedAt: timing.startedAt,
      endedAt: timing.endedAt,
      pausedAt: timing.pausedAt,
      pausedMs: timing.pausedMs,
      updatedAt: now,
    })
    .where(eq(workoutSessions.id, id))
    .run();
}

/** El entrenamiento sin terminar, si hay uno: es el que se recupera tras un cierre inesperado. */
export async function findOpenWorkoutId(db: AppDatabase): Promise<string | null> {
  const row = await db
    .select({ id: workoutSessions.id })
    .from(workoutSessions)
    .where(and(inArray(workoutSessions.status, OPEN_STATUSES), isNull(workoutSessions.deletedAt)))
    .orderBy(desc(workoutSessions.createdAt))
    .limit(1)
    .get();
  return row?.id ?? null;
}

/** Entrenamientos completos (con ejercicios y series), en el orden de `ids`. */
export async function loadWorkouts(db: AppDatabase, ids: readonly string[]): Promise<Workout[]> {
  if (ids.length === 0) return [];
  const sessionRows = await db
    .select()
    .from(workoutSessions)
    .where(and(inArray(workoutSessions.id, [...ids]), isNull(workoutSessions.deletedAt)))
    .all();
  const exerciseRows = await db
    .select({ entry: workoutExercises, exercise: exercises })
    .from(workoutExercises)
    .innerJoin(exercises, eq(exercises.id, workoutExercises.exerciseId))
    .where(and(inArray(workoutExercises.sessionId, [...ids]), isNull(workoutExercises.deletedAt)))
    .orderBy(asc(workoutExercises.position))
    .all();
  const entryIds = exerciseRows.map(({ entry }) => entry.id);
  const setRows =
    entryIds.length === 0
      ? []
      : await db
          .select()
          .from(sets)
          .where(and(inArray(sets.workoutExerciseId, entryIds), isNull(sets.deletedAt)))
          .orderBy(asc(sets.position))
          .all();

  const setsByEntry = new Map<string, WorkoutSet[]>();
  for (const row of setRows) {
    const list = setsByEntry.get(row.workoutExerciseId) ?? [];
    list.push(toWorkoutSet(row));
    setsByEntry.set(row.workoutExerciseId, list);
  }
  const entriesBySession = new Map<string, WorkoutExercise[]>();
  for (const { entry, exercise } of exerciseRows) {
    const list = entriesBySession.get(entry.sessionId) ?? [];
    list.push({
      id: entry.id,
      exercise: toExercise(exercise),
      nameSnapshot: entry.exerciseNameSnapshot,
      position: entry.position,
      completedAt: entry.completedAt,
      target: targetFromRow(entry),
      restS: entry.restS,
      sets: setsByEntry.get(entry.id) ?? [],
    });
    entriesBySession.set(entry.sessionId, list);
  }

  const byId = new Map(
    sessionRows.map((row): [string, Workout] => [
      row.id,
      {
        id: row.id,
        routineName: row.routineNameSnapshot,
        notes: row.notes,
        timing: {
          status: row.status,
          startedAt: row.startedAt,
          endedAt: row.endedAt,
          pausedAt: row.pausedAt,
          pausedMs: row.pausedMs,
        },
        exercises: entriesBySession.get(row.id) ?? [],
      },
    ]),
  );
  return ids.flatMap((id) => byId.get(id) ?? []);
}

export async function loadWorkout(db: AppDatabase, id: string): Promise<Workout | null> {
  const [workout] = await loadWorkouts(db, [id]);
  return workout ?? null;
}

/** Entrenamientos terminados, del más reciente al más antiguo. */
export async function listCompletedWorkoutIds(db: AppDatabase): Promise<string[]> {
  const rows = await db
    .select({ id: workoutSessions.id })
    .from(workoutSessions)
    .where(and(eq(workoutSessions.status, "completed"), isNull(workoutSessions.deletedAt)))
    .orderBy(desc(workoutSessions.startedAt))
    .all();
  return rows.map((row) => row.id);
}

export async function insertWorkoutExercise(
  db: AppExecutor,
  entry: {
    id: string;
    sessionId: string;
    exerciseId: string;
    nameSnapshot: string;
    position: number;
    target?: RoutineTarget | null;
    restS?: number | null;
    now: number;
  },
): Promise<void> {
  await db
    .insert(workoutExercises)
    .values({
      id: entry.id,
      sessionId: entry.sessionId,
      exerciseId: entry.exerciseId,
      exerciseNameSnapshot: entry.nameSnapshot,
      position: entry.position,
      targetSets: entry.target?.sets ?? null,
      targetRepsMin: entry.target?.repsMin ?? null,
      targetRepsMax: entry.target?.repsMax ?? null,
      targetRir: entry.target?.rir ?? null,
      restS: entry.restS ?? null,
      createdAt: entry.now,
      updatedAt: entry.now,
    })
    .run();
}

export async function softDeleteWorkoutExercise(
  db: AppDatabase,
  id: string,
  now: number,
): Promise<void> {
  await db
    .update(workoutExercises)
    .set({ deletedAt: now, updatedAt: now })
    .where(eq(workoutExercises.id, id))
    .run();
}

const setValues = (set: ValidSet) => ({
  type: set.type,
  weightKg: set.weightKg,
  enteredUnit: set.enteredUnit,
  reps: set.reps,
  rir: set.rir,
  rpe: set.rpe,
  durationS: set.durationS,
  distanceM: set.distanceM,
});

/** Siguiente posición libre para una serie del ejercicio (cuenta también las borradas). */
export async function nextSetPosition(db: AppDatabase, workoutExerciseId: string): Promise<number> {
  const row = await db
    .select({ last: max(sets.position) })
    .from(sets)
    .where(eq(sets.workoutExerciseId, workoutExerciseId))
    .get();
  return row?.last === null || row?.last === undefined ? 0 : row.last + 1;
}

export async function insertSet(
  db: AppDatabase,
  entry: { id: string; workoutExerciseId: string; position: number; set: ValidSet; now: number },
): Promise<void> {
  await db
    .insert(sets)
    .values({
      id: entry.id,
      workoutExerciseId: entry.workoutExerciseId,
      position: entry.position,
      ...setValues(entry.set),
      completedAt: entry.now,
      createdAt: entry.now,
      updatedAt: entry.now,
    })
    .run();
}

export async function updateSet(
  db: AppDatabase,
  id: string,
  set: ValidSet,
  now: number,
): Promise<void> {
  await db
    .update(sets)
    .set({ ...setValues(set), updatedAt: now })
    .where(eq(sets.id, id))
    .run();
}

export async function softDeleteSet(db: AppDatabase, id: string, now: number): Promise<void> {
  await db.update(sets).set({ deletedAt: now, updatedAt: now }).where(eq(sets.id, id)).run();
}

/** A qué entrenamiento y ejercicio pertenece una serie. */
export async function findSetOwner(
  db: AppDatabase,
  setId: string,
): Promise<{ workoutId: string; workoutExerciseId: string; exerciseId: string } | null> {
  const row = await db
    .select({
      workoutId: workoutExercises.sessionId,
      workoutExerciseId: workoutExercises.id,
      exerciseId: workoutExercises.exerciseId,
    })
    .from(sets)
    .innerJoin(workoutExercises, eq(workoutExercises.id, sets.workoutExerciseId))
    .where(and(eq(sets.id, setId), isNull(sets.deletedAt)))
    .get();
  return row ?? null;
}

/** A qué entrenamiento pertenece un ejercicio del entrenamiento. */
export async function findWorkoutExerciseOwner(
  db: AppDatabase,
  workoutExerciseId: string,
): Promise<{ workoutId: string; exerciseId: string } | null> {
  const row = await db
    .select({ workoutId: workoutExercises.sessionId, exerciseId: workoutExercises.exerciseId })
    .from(workoutExercises)
    .where(and(eq(workoutExercises.id, workoutExerciseId), isNull(workoutExercises.deletedAt)))
    .get();
  return row ?? null;
}

/**
 * Series de cada ejercicio en los entrenamientos terminados que empezaron antes de `before`, de la
 * sesión más antigua a la más nueva. Es la base del rendimiento anterior y de los récords.
 */
export async function exerciseHistory(
  db: AppDatabase,
  exerciseIds: readonly string[],
  before: number,
): Promise<Map<string, WorkoutSet[][]>> {
  const history = new Map<string, WorkoutSet[][]>();
  if (exerciseIds.length === 0) return history;
  const rows = await db
    .select({ set: sets, exerciseId: workoutExercises.exerciseId, sessionId: workoutSessions.id })
    .from(sets)
    .innerJoin(workoutExercises, eq(workoutExercises.id, sets.workoutExerciseId))
    .innerJoin(workoutSessions, eq(workoutSessions.id, workoutExercises.sessionId))
    .where(
      and(
        inArray(workoutExercises.exerciseId, [...exerciseIds]),
        eq(workoutSessions.status, "completed"),
        lt(workoutSessions.startedAt, before),
        isNull(workoutSessions.deletedAt),
        isNull(workoutExercises.deletedAt),
        isNull(sets.deletedAt),
      ),
    )
    .orderBy(
      asc(workoutSessions.startedAt),
      asc(workoutSessions.id),
      asc(workoutExercises.position),
      asc(sets.position),
    )
    .all();

  const lastSession = new Map<string, string>();
  for (const { set, exerciseId, sessionId } of rows) {
    const sessions = history.get(exerciseId) ?? [];
    if (lastSession.get(exerciseId) !== sessionId) {
      sessions.push([]);
      lastSession.set(exerciseId, sessionId);
    }
    sessions[sessions.length - 1]?.push(toWorkoutSet(set));
    history.set(exerciseId, sessions);
  }
  return history;
}

/** Marca un ejercicio del entrenamiento como terminado (con la hora) o lo vuelve a abrir (null). */
export async function setWorkoutExerciseCompletion(
  db: AppDatabase,
  id: string,
  completedAt: number | null,
  now: number,
): Promise<void> {
  await db
    .update(workoutExercises)
    .set({ completedAt, updatedAt: now })
    .where(eq(workoutExercises.id, id))
    .run();
}
