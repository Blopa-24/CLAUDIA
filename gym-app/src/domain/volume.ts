// Volumen de entrenamiento (skill gym-domain, "VOLUME").
//
// Reglas:
// - Peso y reps: volumen = peso (kg) × reps.
// - Unilateral: las reps se anotan por lado y el peso es por lado, así que se cuentan los dos: × 2.
// - Peso corporal (reps_only), tiempo y distancia: no tienen volumen en kg; se devuelve null.
// - Solo cuentan las series completadas con peso ≥ 0 y reps ≥ 0 conocidos.
// - El calentamiento no suma al total, salvo que se pida con includeWarmups.

import type { ExerciseTracking, SetPerformance } from "./types";

const SIDES = { bilateral: 1, unilateral: 2 } as const;

/** Volumen de una serie en kg, o null si la serie no tiene volumen con sentido. */
export function setVolume(set: SetPerformance, exercise: ExerciseTracking): number | null {
  if (exercise.trackingType !== "weight_reps") return null;
  if (!set.completed || set.weightKg === null || set.reps === null) return null;
  if (!Number.isFinite(set.weightKg) || !Number.isFinite(set.reps)) return null;
  if (set.weightKg < 0 || set.reps < 0) return null;
  return set.weightKg * set.reps * SIDES[exercise.laterality];
}

export interface VolumeOptions {
  includeWarmups?: boolean;
}

/**
 * Volumen total de un ejercicio en kg, o null si el ejercicio no tiene volumen en kg
 * (peso corporal, tiempo o distancia). Un ejercicio con peso sin series válidas da 0.
 */
export function totalVolume(
  sets: readonly SetPerformance[],
  exercise: ExerciseTracking,
  { includeWarmups = false }: VolumeOptions = {},
): number | null {
  if (exercise.trackingType !== "weight_reps") return null;
  return sets
    .filter((set) => includeWarmups || set.type !== "warmup")
    .reduce((sum, set) => sum + (setVolume(set, exercise) ?? 0), 0);
}
