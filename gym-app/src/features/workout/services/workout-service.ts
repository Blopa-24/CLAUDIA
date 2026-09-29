// Casos de uso del entrenamiento (skill workout-engine). Cada acción se guarda al instante en la
// base: si la app se cierra, no se pierde ninguna serie completada.

import type { AppDatabase } from "@/db/database";
import { findExerciseById } from "@/db/repositories/exercise-repository";
import {
  exerciseHistory,
  findOpenWorkoutId,
  findSetOwner,
  findWorkoutExerciseOwner,
  insertSession,
  insertSet,
  insertWorkoutExercise,
  listCompletedWorkoutIds,
  loadWorkout,
  loadWorkouts,
  nextSetPosition,
  setWorkoutExerciseCompletion,
  softDeleteSet,
  softDeleteWorkoutExercise,
  updateSessionTiming,
  updateSet,
} from "@/db/repositories/workout-repository";
import type { Exercise } from "@/domain/exercise";
import { err, ok, type Result } from "@/domain/result";
import { type SetDraft, type SetInputError, validateSet } from "@/domain/set-input";
import {
  summarizeWorkout,
  toPerformance,
  trackingOf,
  type Workout,
  type WorkoutSet,
  type WorkoutSummary,
} from "@/domain/workout";
import {
  plannedSession,
  type SessionEvent,
  type SessionTiming,
  transition,
} from "@/domain/workout-session";

export interface ServiceDeps {
  now: () => number;
  newId: () => string;
}

export type WorkoutError =
  | { code: "not_found" }
  /** El entrenamiento ya terminó o se descartó: su historial no se cambia desde aquí. */
  | { code: "not_open" }
  | { code: "invalid_set"; error: SetInputError }
  | { code: "invalid_transition" };

const isOpen = (timing: SessionTiming) =>
  timing.status === "active" || timing.status === "paused" || timing.status === "planned";

/** Empieza un entrenamiento, o devuelve el que quedó abierto (nunca hay dos a la vez). */
export async function startWorkout(
  db: AppDatabase,
  deps: ServiceDeps,
): Promise<{ workoutId: string; resumed: boolean }> {
  const open = await findOpenWorkoutId(db);
  if (open !== null) return { workoutId: open, resumed: true };
  const now = deps.now();
  const started = transition(plannedSession(), "start", now);
  if (!started.ok) throw new Error("No se pudo iniciar el entrenamiento");
  const workoutId = deps.newId();
  await insertSession(db, { id: workoutId, timing: started.value, now });
  return { workoutId, resumed: false };
}

export const getOpenWorkoutId = findOpenWorkoutId;
export const getWorkout = loadWorkout;

async function openWorkout(
  db: AppDatabase,
  workoutId: string,
): Promise<Result<Workout, WorkoutError>> {
  const workout = await loadWorkout(db, workoutId);
  if (workout === null) return err({ code: "not_found" });
  if (!isOpen(workout.timing)) return err({ code: "not_open" });
  return ok(workout);
}

/** Si estaba en pausa, registrar algo significa que se volvió a entrenar. */
async function resumeIfPaused(db: AppDatabase, workout: Workout, now: number): Promise<void> {
  if (workout.timing.status !== "paused") return;
  const resumed = transition(workout.timing, "resume", now);
  if (resumed.ok) await updateSessionTiming(db, workout.id, resumed.value, now);
}

export async function addExercise(
  db: AppDatabase,
  deps: ServiceDeps,
  workoutId: string,
  exercise: Exercise,
  name: string,
): Promise<Result<string, WorkoutError>> {
  const workout = await openWorkout(db, workoutId);
  if (!workout.ok) return workout;
  const now = deps.now();
  const id = deps.newId();
  const position = Math.max(-1, ...workout.value.exercises.map((entry) => entry.position)) + 1;
  await insertWorkoutExercise(db, {
    id,
    sessionId: workoutId,
    exerciseId: exercise.id,
    nameSnapshot: name,
    position,
    now,
  });
  await resumeIfPaused(db, workout.value, now);
  return ok(id);
}

export async function removeExercise(
  db: AppDatabase,
  deps: ServiceDeps,
  workoutExerciseId: string,
): Promise<Result<null, WorkoutError>> {
  const owner = await findWorkoutExerciseOwner(db, workoutExerciseId);
  if (owner === null) return err({ code: "not_found" });
  const workout = await openWorkout(db, owner.workoutId);
  if (!workout.ok) return workout;
  await softDeleteWorkoutExercise(db, workoutExerciseId, deps.now());
  return ok(null);
}

export async function completeSet(
  db: AppDatabase,
  deps: ServiceDeps,
  workoutExerciseId: string,
  draft: SetDraft,
): Promise<Result<string, WorkoutError>> {
  const owner = await findWorkoutExerciseOwner(db, workoutExerciseId);
  if (owner === null) return err({ code: "not_found" });
  const workout = await openWorkout(db, owner.workoutId);
  if (!workout.ok) return workout;
  const exercise = await findExerciseById(db, owner.exerciseId);
  if (exercise === null) return err({ code: "not_found" });

  const valid = validateSet(draft, trackingOf(exercise));
  if (!valid.ok) return err({ code: "invalid_set", error: valid.error });

  const now = deps.now();
  const id = deps.newId();
  const position = await nextSetPosition(db, workoutExerciseId);
  await insertSet(db, { id, workoutExerciseId, position, set: valid.value, now });
  await resumeIfPaused(db, workout.value, now);
  return ok(id);
}

export async function editSet(
  db: AppDatabase,
  deps: ServiceDeps,
  setId: string,
  draft: SetDraft,
): Promise<Result<null, WorkoutError>> {
  const owner = await findSetOwner(db, setId);
  if (owner === null) return err({ code: "not_found" });
  const workout = await openWorkout(db, owner.workoutId);
  if (!workout.ok) return workout;
  const exercise = await findExerciseById(db, owner.exerciseId);
  if (exercise === null) return err({ code: "not_found" });

  const valid = validateSet(draft, trackingOf(exercise));
  if (!valid.ok) return err({ code: "invalid_set", error: valid.error });
  await updateSet(db, setId, valid.value, deps.now());
  return ok(null);
}

export async function deleteSet(
  db: AppDatabase,
  deps: ServiceDeps,
  setId: string,
): Promise<Result<null, WorkoutError>> {
  const owner = await findSetOwner(db, setId);
  if (owner === null) return err({ code: "not_found" });
  const workout = await openWorkout(db, owner.workoutId);
  if (!workout.ok) return workout;
  await softDeleteSet(db, setId, deps.now());
  return ok(null);
}

/** Pausar, reanudar, terminar o descartar, con las reglas de la máquina de estados del dominio. */
export async function changeWorkoutStatus(
  db: AppDatabase,
  deps: ServiceDeps,
  workoutId: string,
  event: Exclude<SessionEvent, "start">,
): Promise<Result<SessionTiming, WorkoutError>> {
  const workout = await loadWorkout(db, workoutId);
  if (workout === null) return err({ code: "not_found" });
  const now = deps.now();
  const next = transition(workout.timing, event, now);
  if (!next.ok) return err({ code: "invalid_transition" });
  await updateSessionTiming(db, workoutId, next.value, now);
  return ok(next.value);
}

/** Series de la última vez que se hizo cada ejercicio, antes de este entrenamiento. */
export async function previousPerformance(
  db: AppDatabase,
  exerciseIds: readonly string[],
  before: number,
): Promise<Map<string, WorkoutSet[]>> {
  const history = await exerciseHistory(db, exerciseIds, before);
  return new Map(
    [...history].flatMap(([exerciseId, sessions]) => {
      const last = sessions[sessions.length - 1];
      return last ? [[exerciseId, last] as const] : [];
    }),
  );
}

/** Resumen de un entrenamiento, con los récords calculados contra los entrenamientos anteriores. */
export async function getWorkoutSummary(
  db: AppDatabase,
  workoutId: string,
  now: number,
): Promise<Result<{ workout: Workout; summary: WorkoutSummary }, WorkoutError>> {
  const workout = await loadWorkout(db, workoutId);
  if (workout === null) return err({ code: "not_found" });
  const ids = [...new Set(workout.exercises.map((entry) => entry.exercise.id))];
  const history = await exerciseHistory(db, ids, workout.timing.startedAt ?? now);
  const performances = new Map(
    [...history].map(([id, sessions]) => [id, sessions.map((list) => list.map(toPerformance))]),
  );
  return ok({ workout, summary: summarizeWorkout(workout, performances, now) });
}

/** Entrenamientos terminados para el historial, del más reciente al más antiguo. */
export async function listWorkoutHistory(
  db: AppDatabase,
  now: number,
): Promise<{ workout: Workout; summary: WorkoutSummary }[]> {
  const workouts = await loadWorkouts(db, await listCompletedWorkoutIds(db));
  // En la lista no se muestran récords; se calculan al abrir cada entrenamiento.
  return workouts.map((workout) => ({
    workout,
    summary: summarizeWorkout(workout, new Map(), now),
  }));
}

/**
 * Terminar un ejercicio lo deja plegado en la pantalla; reabrirlo lo vuelve a mostrar completo.
 * Solo cambia cómo se ve el entrenamiento: sus series ya están guardadas.
 */
export async function setExerciseFinished(
  db: AppDatabase,
  deps: ServiceDeps,
  workoutExerciseId: string,
  finished: boolean,
): Promise<Result<null, WorkoutError>> {
  const owner = await findWorkoutExerciseOwner(db, workoutExerciseId);
  if (owner === null) return err({ code: "not_found" });
  const workout = await openWorkout(db, owner.workoutId);
  if (!workout.ok) return workout;
  const now = deps.now();
  await setWorkoutExerciseCompletion(db, workoutExerciseId, finished ? now : null, now);
  return ok(null);
}
