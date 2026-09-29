// Validación de lo que se escribe en una serie (propuesta, sección 3.4). Los límites evitan datos
// corruptos sin frenar el entrenamiento avanzado. La base repite estos límites como CHECK.

import { err, ok, type Result } from "./result";
import type { ExerciseTracking, SetType } from "./types";
import { toKg, type WeightUnit } from "./units";

export const SET_LIMITS = { maxWeightKg: 1500, maxRir: 10, minRpe: 1, maxRpe: 10 } as const;

/** Lo que la persona escribió, tal cual; los campos vacíos llegan como "". */
export interface SetDraft {
  type: SetType;
  weight: string;
  unit: WeightUnit;
  reps: string;
  rir: string;
  rpe: string;
  durationS: string;
  distanceM: string;
}

/** Serie lista para guardar: peso en kg y cada campo que no aplica en null. */
export interface ValidSet {
  type: SetType;
  weightKg: number | null;
  enteredUnit: WeightUnit | null;
  reps: number | null;
  rir: number | null;
  rpe: number | null;
  durationS: number | null;
  distanceM: number | null;
}

export type SetField = "weight" | "reps" | "rir" | "rpe" | "durationS" | "distanceM";
export type SetInputError = { field: SetField; code: "required" | "invalid" | "out_of_range" };

/**
 * Lee un número escrito a mano: acepta coma o punto decimal y espacios alrededor.
 * Devuelve null si está vacío y NaN si no es un número.
 */
export function parseDecimal(text: string): number | null {
  const trimmed = text.trim().replace(",", ".");
  if (trimmed === "") return null;
  if (!/^\d+(\.\d+)?$|^\.\d+$/.test(trimmed)) return Number.NaN;
  return Number(trimmed);
}

type Parsed = Result<number | null, SetInputError>;

function number(
  field: SetField,
  text: string,
  {
    required,
    integer,
    min,
    max,
  }: { required: boolean; integer?: boolean; min: number; max?: number },
): Parsed {
  const value = parseDecimal(text);
  if (value === null) return required ? err({ field, code: "required" }) : ok(null);
  if (Number.isNaN(value) || (integer && !Number.isInteger(value))) {
    return err({ field, code: "invalid" });
  }
  if (value < min || (max !== undefined && value > max)) {
    return err({ field, code: "out_of_range" });
  }
  return ok(value);
}

/** Valida una serie según lo que registra el ejercicio. Devuelve el primer error encontrado. */
export function validateSet(
  draft: SetDraft,
  exercise: ExerciseTracking,
): Result<ValidSet, SetInputError> {
  const tracking = exercise.trackingType;
  const usesWeight = tracking === "weight_reps";
  const usesReps = tracking === "weight_reps" || tracking === "reps_only";

  const weight = number("weight", draft.weight, { required: usesWeight, min: 0 });
  if (!weight.ok) return weight;
  const weightKg = usesWeight && weight.value !== null ? toKg(weight.value, draft.unit) : null;
  if (weightKg !== null && weightKg > SET_LIMITS.maxWeightKg) {
    return err({ field: "weight", code: "out_of_range" });
  }

  const reps = number("reps", draft.reps, { required: usesReps, integer: true, min: 0 });
  if (!reps.ok) return reps;
  const rir = number("rir", draft.rir, {
    required: false,
    integer: true,
    min: 0,
    max: SET_LIMITS.maxRir,
  });
  if (!rir.ok) return rir;
  const rpe = number("rpe", draft.rpe, {
    required: false,
    min: SET_LIMITS.minRpe,
    max: SET_LIMITS.maxRpe,
  });
  if (!rpe.ok) return rpe;
  if (rpe.value !== null && !Number.isInteger(rpe.value * 2)) {
    return err({ field: "rpe", code: "invalid" });
  }

  const duration = number("durationS", draft.durationS, {
    required: tracking === "duration",
    integer: true,
    min: 1,
  });
  if (!duration.ok) return duration;
  const distance = number("distanceM", draft.distanceM, {
    required: tracking === "distance",
    min: 0,
  });
  if (!distance.ok) return distance;
  if (tracking === "distance" && distance.value === 0) {
    return err({ field: "distanceM", code: "out_of_range" });
  }

  return ok({
    type: draft.type,
    weightKg,
    enteredUnit: weightKg !== null ? draft.unit : null,
    reps: usesReps ? reps.value : null,
    rir: usesReps ? rir.value : null,
    rpe: usesReps ? rpe.value : null,
    durationS: tracking === "duration" || tracking === "distance" ? duration.value : null,
    distanceM: tracking === "distance" ? distance.value : null,
  });
}
