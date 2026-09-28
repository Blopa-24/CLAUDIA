// 1RM estimado (skill gym-domain, "ESTIMATED 1RM").
//
// Fórmula de Epley: 1RM = peso × (1 + reps / 30).
// Reglas:
// - Solo para ejercicios de peso y reps, con peso > 0 y reps enteras > 0.
// - Con 1 rep el 1RM es el propio peso (Epley daría un 3,3 % más, que no tiene sentido).
// - Sobre MAX_REPS_FOR_1RM reps no se estima: la fórmula pierde precisión con series largas.
// - Datos inválidos devuelven null, nunca un número inventado.

import type { TrackingType } from "./types";

export const MAX_REPS_FOR_1RM = 12;

export function estimateOneRepMax(
  weightKg: number | null,
  reps: number | null,
  trackingType: TrackingType = "weight_reps",
): number | null {
  if (trackingType !== "weight_reps" || weightKg === null || reps === null) return null;
  if (!Number.isFinite(weightKg) || weightKg <= 0) return null;
  if (!Number.isInteger(reps) || reps <= 0 || reps > MAX_REPS_FOR_1RM) return null;
  if (reps === 1) return weightKg;
  return weightKg * (1 + reps / 30);
}
