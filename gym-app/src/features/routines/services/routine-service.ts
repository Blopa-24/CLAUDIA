// Casos de uso de las rutinas: crear, editar y borrar. Empezar un entrenamiento desde una rutina
// vive en el servicio de entrenamientos (startWorkoutFromRoutine).

import type { AppDatabase } from "@/db/database";
import { findExerciseById } from "@/db/repositories/exercise-repository";
import {
  findRoutine,
  insertRoutine,
  listRoutines,
  nextRoutinePosition,
  renameRoutine,
  replaceRoutineExercises,
  type RoutineItemRow,
  softDeleteRoutine,
} from "@/db/repositories/routine-repository";
import { err, ok, type Result } from "@/domain/result";
import {
  isValidRest,
  ROUTINE_LIMITS,
  type RoutineNameError,
  type TargetDraft,
  type TargetError,
  validateRoutineName,
  validateTarget,
} from "@/domain/routine";

import type { ServiceDeps } from "@/features/workout/services/workout-service";

/** Lo que se escribe en el editor de rutinas. */
export interface RoutineInput {
  name: string;
  items: { exerciseId: string; target: TargetDraft; restS: number | null }[];
}

export type RoutineError =
  | { code: "name"; error: RoutineNameError }
  | { code: "no_exercises" }
  | { code: "too_many_exercises" }
  | { code: "target"; index: number; error: TargetError }
  | { code: "invalid_rest"; index: number }
  | { code: "unknown_exercise"; index: number }
  | { code: "not_found" };

/**
 * Crea (routineId null) o actualiza una rutina. Valida todo antes de escribir y guarda en una sola
 * transacción: o queda la rutina completa, o no cambia nada. Devuelve su ID.
 */
export async function saveRoutine(
  db: AppDatabase,
  deps: ServiceDeps,
  routineId: string | null,
  input: RoutineInput,
): Promise<Result<string, RoutineError>> {
  const name = validateRoutineName(input.name);
  if (!name.ok) return err({ code: "name", error: name.error });
  if (input.items.length === 0) return err({ code: "no_exercises" });
  if (input.items.length > ROUTINE_LIMITS.maxExercises) return err({ code: "too_many_exercises" });

  const items: RoutineItemRow[] = [];
  for (const [index, item] of input.items.entries()) {
    const target = validateTarget(item.target);
    if (!target.ok) return err({ code: "target", index, error: target.error });
    if (!isValidRest(item.restS)) return err({ code: "invalid_rest", index });
    if ((await findExerciseById(db, item.exerciseId)) === null) {
      return err({ code: "unknown_exercise", index });
    }
    items.push({
      id: deps.newId(),
      exerciseId: item.exerciseId,
      position: index,
      target: target.value,
      restS: item.restS,
    });
  }

  if (routineId !== null && (await findRoutine(db, routineId)) === null) {
    return err({ code: "not_found" });
  }
  const now = deps.now();
  const id = routineId ?? deps.newId();
  const position = routineId === null ? await nextRoutinePosition(db) : 0;
  await db.transaction(async (tx) => {
    if (routineId === null) await insertRoutine(tx, { id, name: name.value, position, now });
    else await renameRoutine(tx, id, name.value, now);
    await replaceRoutineExercises(tx, id, items, now);
  });
  return ok(id);
}

export async function deleteRoutine(
  db: AppDatabase,
  deps: ServiceDeps,
  routineId: string,
): Promise<Result<null, RoutineError>> {
  if ((await findRoutine(db, routineId)) === null) return err({ code: "not_found" });
  await softDeleteRoutine(db, routineId, deps.now());
  return ok(null);
}

export { findRoutine as getRoutine, listRoutines };
