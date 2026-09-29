import { type Preferences, restSecondsFor } from "@/state/preferences";

/**
 * Descanso tras una serie, en orden de prioridad:
 * 1. el elegido en la barra durante este entrenamiento para ese ejercicio;
 * 2. el de la rutina (si el entrenamiento viene de una);
 * 3. el último elegido para ese ejercicio en otro entrenamiento;
 * 4. el de siempre (Perfil).
 */
export function restForExercise(
  exerciseId: string,
  plannedRestS: number | null,
  chosen: Readonly<Record<string, number>>,
  preferences: Pick<Preferences, "restSeconds" | "restByExercise">,
): number {
  return chosen[exerciseId] ?? plannedRestS ?? restSecondsFor(preferences, exerciseId);
}
