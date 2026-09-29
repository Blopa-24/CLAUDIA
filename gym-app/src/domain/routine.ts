// Rutinas (skill workout-engine, "CORE FLOW"): una rutina es un plan; un entrenamiento es lo que
// realmente se hizo. Al empezar un entrenamiento desde una rutina se copian sus objetivos, así que
// editar la rutina después no cambia el historial.

import type { Exercise } from "./exercise";
import { err, ok, type Result } from "./result";
import { MAX_REST_S } from "./rest-timer";
import { parseDecimal } from "./set-input";

export const ROUTINE_LIMITS = {
  maxNameLength: 60,
  maxSets: 20,
  maxReps: 100,
  maxRir: 10,
  maxExercises: 40,
} as const;

/** Lo que se quiere hacer en un ejercicio. Todo es opcional: una rutina puede ser solo una lista. */
export interface RoutineTarget {
  sets: number | null;
  repsMin: number | null;
  repsMax: number | null;
  rir: number | null;
}

export interface RoutineExercise {
  id: string;
  exercise: Exercise;
  position: number;
  target: RoutineTarget;
  /** Descanso propio de este ejercicio en la rutina; null usa el de siempre. */
  restS: number | null;
}

export interface Routine {
  id: string;
  name: string;
  notes: string | null;
  exercises: RoutineExercise[];
}

export const emptyTarget = (): RoutineTarget => ({
  sets: null,
  repsMin: null,
  repsMax: null,
  rir: null,
});

export type RoutineNameError = "required" | "too_long";

export function validateRoutineName(name: string): Result<string, RoutineNameError> {
  const trimmed = name.trim().replace(/\s+/g, " ");
  if (trimmed === "") return err("required");
  if (trimmed.length > ROUTINE_LIMITS.maxNameLength) return err("too_long");
  return ok(trimmed);
}

/** Objetivos escritos a mano; los vacíos llegan como "". */
export interface TargetDraft {
  sets: string;
  repsMin: string;
  repsMax: string;
  rir: string;
}

export type TargetField = keyof TargetDraft;
export type TargetError = { field: TargetField; code: "invalid" | "out_of_range" };

function integer(
  field: TargetField,
  text: string,
  min: number,
  max: number,
): Result<number | null, TargetError> {
  const value = parseDecimal(text);
  if (value === null) return ok(null);
  if (Number.isNaN(value) || !Number.isInteger(value)) return err({ field, code: "invalid" });
  if (value < min || value > max) return err({ field, code: "out_of_range" });
  return ok(value);
}

/**
 * Valida los objetivos de un ejercicio. Un solo número de reps es un objetivo fijo (8); dos, un
 * rango (8–10). Si solo se escribe el máximo, se toma como fijo.
 */
export function validateTarget(draft: TargetDraft): Result<RoutineTarget, TargetError> {
  const sets = integer("sets", draft.sets, 1, ROUTINE_LIMITS.maxSets);
  if (!sets.ok) return sets;
  const repsMin = integer("repsMin", draft.repsMin, 1, ROUTINE_LIMITS.maxReps);
  if (!repsMin.ok) return repsMin;
  const repsMax = integer("repsMax", draft.repsMax, 1, ROUTINE_LIMITS.maxReps);
  if (!repsMax.ok) return repsMax;
  const rir = integer("rir", draft.rir, 0, ROUTINE_LIMITS.maxRir);
  if (!rir.ok) return rir;

  let min = repsMin.value;
  let max = repsMax.value;
  if (min === null && max !== null) min = max;
  if (min !== null && max === null) max = min;
  if (min !== null && max !== null && max < min)
    return err({ field: "repsMax", code: "out_of_range" });

  return ok({ sets: sets.value, repsMin: min, repsMax: max, rir: rir.value });
}

export function isValidRest(seconds: number | null): boolean {
  return seconds === null || (Number.isInteger(seconds) && seconds >= 0 && seconds <= MAX_REST_S);
}

export const hasTarget = (target: RoutineTarget): boolean =>
  target.sets !== null || target.repsMin !== null || target.rir !== null;

export interface TargetLabels {
  /** "{{count}} series", con plural. */
  sets: (count: number) => string;
  rir: string;
}

/** Objetivo en una línea: "3 × 8–10 · RIR 2", "3 × 8", "3 series", "× 12". Vacío si no hay. */
export function formatTarget(target: RoutineTarget, labels: TargetLabels): string {
  const reps =
    target.repsMin === null
      ? null
      : target.repsMin === target.repsMax || target.repsMax === null
        ? `${target.repsMin}`
        : `${target.repsMin}–${target.repsMax}`;
  const parts: string[] = [];
  if (target.sets !== null && reps !== null) parts.push(`${target.sets} × ${reps}`);
  else if (target.sets !== null) parts.push(labels.sets(target.sets));
  else if (reps !== null) parts.push(`× ${reps}`);
  if (target.rir !== null) parts.push(`${labels.rir} ${target.rir}`);
  return parts.join(" · ");
}

/** Borrador de objetivos a partir de uno guardado, para editarlo. */
export function targetToDraft(target: RoutineTarget): TargetDraft {
  const text = (value: number | null) => (value === null ? "" : String(value));
  const fixed = target.repsMin !== null && target.repsMin === target.repsMax;
  return {
    sets: text(target.sets),
    repsMin: text(target.repsMin),
    repsMax: fixed ? "" : text(target.repsMax),
    rir: text(target.rir),
  };
}
