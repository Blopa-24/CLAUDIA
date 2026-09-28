// Única puerta de entrada a la tabla `exercises` (skill database, sección 7).

import { eq, isNull } from "drizzle-orm";

import { type Exercise, isMuscle } from "@/domain/exercise";

import type { AppDatabase } from "../database";
import { type ExerciseRow, exercises } from "../schema";

export function toExercise(row: ExerciseRow): Exercise {
  return {
    id: row.id,
    slug: row.slug,
    name: { es: row.nameEs, en: row.nameEn },
    isCustom: row.isCustom,
    primaryMuscle: row.primaryMuscle,
    // Es JSON: si alguna vez se dañara, se descarta lo desconocido en vez de romper la lista.
    secondaryMuscles: Array.isArray(row.secondaryMuscles)
      ? row.secondaryMuscles.filter(isMuscle)
      : [],
    equipment: row.equipment,
    movementPattern: row.movementPattern,
    laterality: row.laterality,
    trackingType: row.trackingType,
    notes: row.notes,
  };
}

/** Ejercicios disponibles, sin los borrados. El orden lo decide quien los muestra. */
export async function listExercises(db: AppDatabase): Promise<Exercise[]> {
  const rows = await db.select().from(exercises).where(isNull(exercises.deletedAt)).all();
  return rows.map(toExercise);
}

/** Un ejercicio por ID, aunque esté borrado: el historial tiene que poder mostrarlo. */
export async function findExerciseById(db: AppDatabase, id: string): Promise<Exercise | null> {
  const row = await db.select().from(exercises).where(eq(exercises.id, id)).get();
  return row ? toExercise(row) : null;
}
