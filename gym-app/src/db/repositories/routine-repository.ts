// Única puerta de entrada a routines y routine_exercises (skill database, sección 7).
// Una rutina es una plantilla: al editarla se reemplazan sus ejercicios. Los entrenamientos ya
// hechos no dependen de estas filas (copian lo que necesitan al empezar).

import { and, asc, eq, inArray, isNull, max } from "drizzle-orm";

import type { Routine, RoutineExercise, RoutineTarget } from "@/domain/routine";

import type { AppDatabase, AppExecutor } from "../database";
import { exercises, routineExercises, routines } from "../schema";

import { toExercise } from "./exercise-repository";
import { targetFromRow } from "./workout-repository";

export interface RoutineItemRow {
  id: string;
  exerciseId: string;
  position: number;
  target: RoutineTarget;
  restS: number | null;
}

async function loadExercisesFor(
  db: AppDatabase,
  routineIds: readonly string[],
): Promise<Map<string, RoutineExercise[]>> {
  const byRoutine = new Map<string, RoutineExercise[]>();
  if (routineIds.length === 0) return byRoutine;
  const rows = await db
    .select({ item: routineExercises, exercise: exercises })
    .from(routineExercises)
    .innerJoin(exercises, eq(exercises.id, routineExercises.exerciseId))
    .where(
      and(inArray(routineExercises.routineId, [...routineIds]), isNull(routineExercises.deletedAt)),
    )
    .orderBy(asc(routineExercises.position))
    .all();
  for (const { item, exercise } of rows) {
    const list = byRoutine.get(item.routineId) ?? [];
    list.push({
      id: item.id,
      exercise: toExercise(exercise),
      position: item.position,
      target: targetFromRow(item) ?? { sets: null, repsMin: null, repsMax: null, rir: null },
      restS: item.restS,
    });
    byRoutine.set(item.routineId, list);
  }
  return byRoutine;
}

/** Rutinas vigentes, en el orden en que se crearon. */
export async function listRoutines(db: AppDatabase): Promise<Routine[]> {
  const rows = await db
    .select()
    .from(routines)
    .where(isNull(routines.deletedAt))
    .orderBy(asc(routines.position), asc(routines.createdAt))
    .all();
  const items = await loadExercisesFor(
    db,
    rows.map((row) => row.id),
  );
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    notes: row.notes,
    exercises: items.get(row.id) ?? [],
  }));
}

export async function findRoutine(db: AppDatabase, id: string): Promise<Routine | null> {
  const row = await db
    .select()
    .from(routines)
    .where(and(eq(routines.id, id), isNull(routines.deletedAt)))
    .get();
  if (!row) return null;
  const items = await loadExercisesFor(db, [id]);
  return { id: row.id, name: row.name, notes: row.notes, exercises: items.get(id) ?? [] };
}

export async function nextRoutinePosition(db: AppDatabase): Promise<number> {
  const row = await db
    .select({ last: max(routines.position) })
    .from(routines)
    .get();
  return row?.last === null || row?.last === undefined ? 0 : row.last + 1;
}

export async function insertRoutine(
  db: AppExecutor,
  routine: { id: string; name: string; position: number; now: number },
): Promise<void> {
  await db
    .insert(routines)
    .values({
      id: routine.id,
      name: routine.name,
      position: routine.position,
      createdAt: routine.now,
      updatedAt: routine.now,
    })
    .run();
}

export async function renameRoutine(
  db: AppExecutor,
  id: string,
  name: string,
  now: number,
): Promise<void> {
  await db.update(routines).set({ name, updatedAt: now }).where(eq(routines.id, id)).run();
}

export async function softDeleteRoutine(db: AppDatabase, id: string, now: number): Promise<void> {
  await db
    .update(routines)
    .set({ deletedAt: now, updatedAt: now })
    .where(eq(routines.id, id))
    .run();
}

/** Deja la rutina con exactamente estos ejercicios, en este orden. */
export async function replaceRoutineExercises(
  db: AppExecutor,
  routineId: string,
  items: readonly RoutineItemRow[],
  now: number,
): Promise<void> {
  await db.delete(routineExercises).where(eq(routineExercises.routineId, routineId)).run();
  if (items.length === 0) return;
  await db
    .insert(routineExercises)
    .values(
      items.map((item) => ({
        id: item.id,
        routineId,
        exerciseId: item.exerciseId,
        position: item.position,
        targetSets: item.target.sets,
        targetRepsMin: item.target.repsMin,
        targetRepsMax: item.target.repsMax,
        targetRir: item.target.rir,
        restS: item.restS,
        createdAt: now,
        updatedAt: now,
      })),
    )
    .run();
}
