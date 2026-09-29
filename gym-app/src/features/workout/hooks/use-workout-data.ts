import { useCallback } from "react";

import { withDatabase } from "@/db/client";
import type { Exercise } from "@/domain/exercise";
import { useAsync } from "@/ui/hooks/use-async";

import { deviceDeps } from "../services/deps";
import {
  addExercise,
  getOpenWorkoutId,
  getWorkout,
  getWorkoutSummary,
  listWorkoutHistory,
  startWorkout,
} from "../services/workout-service";

const loadOpenWorkout = () =>
  withDatabase(async (db) => {
    const id = await getOpenWorkoutId(db);
    return id === null ? null : getWorkout(db, id);
  });

/** El entrenamiento abierto, si hay, para ofrecer "Continuar" en Inicio. */
export function useOpenWorkout() {
  return useAsync(loadOpenWorkout);
}

/** Empieza un entrenamiento o retoma el abierto. Devuelve su ID. */
export async function startOrResumeWorkout(): Promise<string> {
  const { workoutId } = await withDatabase((db) => startWorkout(db, deviceDeps));
  return workoutId;
}

/** Agrega un ejercicio al entrenamiento abierto. false si no hay ninguno abierto. */
export function addExerciseToOpenWorkout(exercise: Exercise, name: string): Promise<boolean> {
  return withDatabase(async (db) => {
    const id = await getOpenWorkoutId(db);
    if (id === null) return false;
    return (await addExercise(db, deviceDeps, id, exercise, name)).ok;
  });
}

/** Resumen de un entrenamiento (al terminarlo y en el historial). */
export function useWorkoutReport(workoutId: string) {
  const load = useCallback(
    () =>
      withDatabase(async (db) => {
        const result = await getWorkoutSummary(db, workoutId, deviceDeps.now());
        return result.ok ? result.value : null;
      }),
    [workoutId],
  );
  return useAsync(load);
}

const loadHistory = () => withDatabase((db) => listWorkoutHistory(db, deviceDeps.now()));

export function useWorkoutHistory() {
  return useAsync(loadHistory);
}
