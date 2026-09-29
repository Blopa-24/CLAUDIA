import { useCallback, useEffect, useState } from "react";

import { withDatabase } from "@/db/client";
import { listExercises } from "@/db/repositories/exercise-repository";
import type { Exercise } from "@/domain/exercise";

export type ExerciseLibrary =
  | { status: "loading" }
  | { status: "error"; retry: () => void }
  | { status: "ready"; exercises: Exercise[] };

// Lectura simple sin reglas: el hook va directo al repositorio. Los servicios aparecen cuando hay
// reglas que aplicar (M3, entrenamiento activo).
const loadFromDatabase = (): Promise<Exercise[]> => withDatabase(listExercises);

/** Carga la biblioteca de ejercicios del teléfono. */
export function useExerciseLibrary(
  load: () => Promise<Exercise[]> = loadFromDatabase,
): ExerciseLibrary {
  const [state, setState] = useState<
    { status: "loading" } | { status: "error" } | { status: "ready"; exercises: Exercise[] }
  >({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    load().then(
      (exercises) => {
        if (!cancelled) setState({ status: "ready", exercises });
      },
      (error: unknown) => {
        console.error("No se pudieron cargar los ejercicios", error);
        if (!cancelled) setState({ status: "error" });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [load, attempt]);

  const retry = useCallback(() => {
    setState({ status: "loading" });
    setAttempt((value) => value + 1);
  }, []);

  return state.status === "error" ? { status: "error", retry } : state;
}
