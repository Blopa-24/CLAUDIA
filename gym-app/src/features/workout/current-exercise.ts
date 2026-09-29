import type { WorkoutExercise } from "@/domain/workout";

/**
 * El ejercicio en curso: el elegido (si sigue sin terminar) o, si no, el primero sin terminar en
 * el orden del entrenamiento. null si todos están terminados.
 */
export function currentExerciseId(
  entries: readonly WorkoutExercise[],
  focusId: string | null,
): string | null {
  const unfinished = entries.filter((entry) => entry.completedAt === null);
  if (focusId !== null && unfinished.some((entry) => entry.id === focusId)) return focusId;
  return unfinished[0]?.id ?? null;
}
