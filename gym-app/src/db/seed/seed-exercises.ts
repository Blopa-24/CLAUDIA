import { type SQL, sql } from "drizzle-orm";

import type { AppDatabase } from "../database";
import { exercises, type NewExerciseRow } from "../schema";

import { catalogToExercise, EXERCISE_CATALOG } from "./exercise-catalog";

/** Columnas que vienen del catálogo; el resto (fechas de creación y borrado) es de la persona. */
const CATALOG_COLUMNS = [
  "name_es",
  "name_en",
  "primary_muscle",
  "secondary_muscles",
  "equipment",
  "movement_pattern",
  "laterality",
  "tracking_type",
] as const;

function catalogRows(now: number): NewExerciseRow[] {
  return EXERCISE_CATALOG.map(catalogToExercise).map((exercise) => ({
    id: exercise.id,
    slug: exercise.slug,
    nameEs: exercise.name.es,
    nameEn: exercise.name.en,
    isCustom: false,
    primaryMuscle: exercise.primaryMuscle,
    secondaryMuscles: exercise.secondaryMuscles,
    equipment: exercise.equipment,
    movementPattern: exercise.movementPattern,
    laterality: exercise.laterality,
    trackingType: exercise.trackingType,
    notes: exercise.notes,
    createdAt: now,
    updatedAt: now,
  }));
}

const excluded = (column: string): SQL => sql.raw(`excluded.${column}`);
const current = (column: string): SQL => sql.raw(`"exercises"."${column}"`);

/**
 * Carga la biblioteca incluida. Se puede correr en cada arranque: agrega los ejercicios que falten
 * y aplica correcciones del catálogo, pero no toca una fila que ya está al día (su `updated_at`
 * no cambia) ni revive un ejercicio que la persona ocultó.
 */
export async function seedExerciseCatalog(db: AppDatabase, now: number): Promise<void> {
  await db
    .insert(exercises)
    .values(catalogRows(now))
    .onConflictDoUpdate({
      target: exercises.id,
      set: {
        nameEs: excluded("name_es"),
        nameEn: excluded("name_en"),
        primaryMuscle: excluded("primary_muscle"),
        secondaryMuscles: excluded("secondary_muscles"),
        equipment: excluded("equipment"),
        movementPattern: excluded("movement_pattern"),
        laterality: excluded("laterality"),
        trackingType: excluded("tracking_type"),
        updatedAt: now,
      },
      setWhere: sql.join(
        CATALOG_COLUMNS.map((column) => sql`${current(column)} IS NOT ${excluded(column)}`),
        sql` OR `,
      ),
    })
    .run();
}
