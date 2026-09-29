import { useCallback } from "react";

import { withDatabase } from "@/db/client";
import type { Exercise, ExerciseLanguage } from "@/domain/exercise";
import type { Result } from "@/domain/result";
import { deviceDeps } from "@/features/workout/services/deps";
import { startWorkoutFromRoutine } from "@/features/workout/services/workout-service";
import { useAsync } from "@/ui/hooks/use-async";

import {
  deleteRoutine,
  getRoutine,
  listRoutines,
  type RoutineError,
  type RoutineInput,
  saveRoutine,
} from "../services/routine-service";

const loadRoutines = () => withDatabase(listRoutines);

export function useRoutines() {
  return useAsync(loadRoutines);
}

export function useRoutine(routineId: string) {
  const load = useCallback(() => withDatabase((db) => getRoutine(db, routineId)), [routineId]);
  return useAsync(load);
}

export function saveRoutineInput(
  routineId: string | null,
  input: RoutineInput,
): Promise<Result<string, RoutineError>> {
  return withDatabase((db) => saveRoutine(db, deviceDeps, routineId, input));
}

export function removeRoutine(routineId: string): Promise<Result<null, RoutineError>> {
  return withDatabase((db) => deleteRoutine(db, deviceDeps, routineId));
}

/** Empieza (o retoma) un entrenamiento desde la rutina, con los nombres en el idioma actual. */
export function startRoutine(routineId: string, language: ExerciseLanguage) {
  return withDatabase((db) =>
    startWorkoutFromRoutine(
      db,
      deviceDeps,
      routineId,
      (exercise: Exercise) => exercise.name[language],
    ),
  );
}
