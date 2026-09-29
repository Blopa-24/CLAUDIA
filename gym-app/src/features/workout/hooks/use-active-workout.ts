import { useCallback, useEffect, useRef, useState } from "react";

import { withDatabase } from "@/db/client";
import type { SetDraft, SetInputError } from "@/domain/set-input";
import type { Workout, WorkoutSet } from "@/domain/workout";

import { deviceDeps } from "../services/deps";
import {
  changeWorkoutStatus,
  completeSet,
  deleteSet,
  editSet,
  getOpenWorkoutId,
  getWorkout,
  previousPerformance,
  removeExercise,
  setExerciseFinished,
  type WorkoutError,
} from "../services/workout-service";

export type ActiveWorkoutState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "none" }
  | { status: "ready"; workout: Workout; previous: ReadonlyMap<string, WorkoutSet[]> };

async function loadActive(): Promise<ActiveWorkoutState> {
  return withDatabase(async (db) => {
    const id = await getOpenWorkoutId(db);
    if (id === null) return { status: "none" };
    const workout = await getWorkout(db, id);
    if (workout === null) return { status: "none" };
    const exerciseIds = [...new Set(workout.exercises.map((entry) => entry.exercise.id))];
    const previous = await previousPerformance(
      db,
      exerciseIds,
      workout.timing.startedAt ?? deviceDeps.now(),
    );
    return { status: "ready", workout, previous };
  });
}

/** Un error de datos (serie inválida) se muestra junto al campo; el resto, como aviso general. */
export type ActionOutcome = { ok: true } | { ok: false; setError?: SetInputError };

/**
 * El entrenamiento abierto, leído siempre desde la base (skill workout-engine: "Never rely
 * exclusively on an in-memory React state"). Cada acción guarda y vuelve a leer.
 */
export function useActiveWorkout() {
  const [state, setState] = useState<ActiveWorkoutState>({ status: "loading" });
  const [failed, setFailed] = useState(false);
  const mounted = useRef(true);
  useEffect(
    () => () => {
      mounted.current = false;
    },
    [],
  );

  const reload = useCallback(async () => {
    try {
      const next = await loadActive();
      if (mounted.current) setState(next);
    } catch (error) {
      console.error("No se pudo cargar el entrenamiento", error);
      if (mounted.current) setState({ status: "error" });
    }
  }, []);

  /** Corre una acción, informa el resultado y vuelve a leer lo guardado. */
  const run = useCallback(
    async (
      action: () => Promise<{ ok: true } | { ok: false; error: WorkoutError }>,
    ): Promise<ActionOutcome> => {
      setFailed(false);
      try {
        const result = await action();
        await reload();
        if (result.ok) return { ok: true };
        if (result.error.code === "invalid_set") return { ok: false, setError: result.error.error };
        setFailed(true);
        return { ok: false };
      } catch (error) {
        console.error("No se pudo guardar", error);
        if (mounted.current) setFailed(true);
        await reload();
        return { ok: false };
      }
    },
    [reload],
  );

  const workoutId = state.status === "ready" ? state.workout.id : null;
  const actions = {
    completeSet: (workoutExerciseId: string, draft: SetDraft) =>
      run(() => withDatabase((db) => completeSet(db, deviceDeps, workoutExerciseId, draft))),
    editSet: (setId: string, draft: SetDraft) =>
      run(() => withDatabase((db) => editSet(db, deviceDeps, setId, draft))),
    deleteSet: (setId: string) => run(() => withDatabase((db) => deleteSet(db, deviceDeps, setId))),
    removeExercise: (workoutExerciseId: string) =>
      run(() => withDatabase((db) => removeExercise(db, deviceDeps, workoutExerciseId))),
    setExerciseFinished: (workoutExerciseId: string, finished: boolean) =>
      run(() =>
        withDatabase((db) => setExerciseFinished(db, deviceDeps, workoutExerciseId, finished)),
      ),
    changeStatus: (event: "pause" | "resume" | "finish" | "abandon") =>
      workoutId === null
        ? Promise.resolve<ActionOutcome>({ ok: false })
        : run(() => withDatabase((db) => changeWorkoutStatus(db, deviceDeps, workoutId, event))),
  };

  return { state, failed, dismissFailure: () => setFailed(false), reload, actions };
}
