// Récords personales (skill gym-domain, "PERSONAL RECORDS").
//
// Definiciones (no cambiarlas sin migrar los récords guardados):
// - heaviest_weight: mayor peso (kg) levantado en una serie válida.
// - best_e1rm: mayor 1RM estimado (Epley) de una serie válida.
// - most_reps_at_weight: más reps con un peso ya levantado antes (comparado en gramos).
// - best_session_volume: mayor volumen del ejercicio en una sesión (sin calentamiento).
//
// Serie válida: completada, no es calentamiento, peso > 0 y reps enteras ≥ 1.
// Hay récord solo si se supera estrictamente la marca anterior: empatar no cuenta.
// La primera sesión de un ejercicio fija la marca base y no se reporta como récord.
// Solo aplica a ejercicios de peso y reps.

import { estimateOneRepMax } from "./one-rep-max";
import type { ExerciseTracking, SetPerformance } from "./types";
import { totalVolume } from "./volume";

export type RecordKind =
  "heaviest_weight" | "best_e1rm" | "most_reps_at_weight" | "best_session_volume";

export interface ExerciseBests {
  heaviestWeightKg: number | null;
  bestE1rmKg: number | null;
  bestSessionVolumeKg: number | null;
  /** Más reps logradas con cada peso. La clave es el peso en gramos. */
  repsAtWeightGrams: Readonly<Record<number, number>>;
}

export interface NewRecord {
  kind: RecordKind;
  value: number;
  previous: number;
  /** Peso de la serie, solo en most_reps_at_weight. */
  weightKg?: number;
}

export interface SessionRecordsResult {
  bests: ExerciseBests;
  newRecords: NewRecord[];
}

const EPSILON = 1e-9;
const isBetter = (value: number, previous: number | null | undefined) =>
  previous === null || previous === undefined || value > previous + EPSILON;

export const toGrams = (kg: number) => Math.round(kg * 1000);

function isValidSet(
  set: SetPerformance,
): set is SetPerformance & { weightKg: number; reps: number } {
  return (
    set.completed &&
    set.type !== "warmup" &&
    set.weightKg !== null &&
    Number.isFinite(set.weightKg) &&
    set.weightKg > 0 &&
    set.reps !== null &&
    Number.isInteger(set.reps) &&
    set.reps >= 1
  );
}

/**
 * Calcula las mejores marcas después de una sesión y los récords nuevos logrados en ella.
 * `previous` es null si el ejercicio nunca se había hecho.
 */
export function evaluateSessionRecords(
  previous: ExerciseBests | null,
  sets: readonly SetPerformance[],
  exercise: ExerciseTracking,
): SessionRecordsResult {
  const base: ExerciseBests = previous ?? {
    heaviestWeightKg: null,
    bestE1rmKg: null,
    bestSessionVolumeKg: null,
    repsAtWeightGrams: {},
  };
  const valid = sets.filter(isValidSet);
  // totalVolume es null en ejercicios sin peso: ahí no hay récords en kg.
  const volume = totalVolume(valid, exercise);
  if (valid.length === 0 || volume === null) return { bests: base, newRecords: [] };

  // Mejores valores de esta sesión
  const heaviest = Math.max(...valid.map((s) => s.weightKg));
  const e1rms = valid.map((s) => estimateOneRepMax(s.weightKg, s.reps)).filter((v) => v !== null);
  const bestE1rm = e1rms.length > 0 ? Math.max(...e1rms) : null;
  const repsAtWeight = new Map<number, number>();
  for (const s of valid) {
    const g = toGrams(s.weightKg);
    repsAtWeight.set(g, Math.max(repsAtWeight.get(g) ?? 0, s.reps));
  }

  const newRecords: NewRecord[] = [];
  const report = previous !== null;

  const bests: ExerciseBests = {
    heaviestWeightKg: base.heaviestWeightKg,
    bestE1rmKg: base.bestE1rmKg,
    bestSessionVolumeKg: base.bestSessionVolumeKg,
    repsAtWeightGrams: { ...base.repsAtWeightGrams },
  };

  if (isBetter(heaviest, base.heaviestWeightKg)) {
    if (report && base.heaviestWeightKg !== null) {
      newRecords.push({
        kind: "heaviest_weight",
        value: heaviest,
        previous: base.heaviestWeightKg,
      });
    }
    bests.heaviestWeightKg = heaviest;
  }

  if (bestE1rm !== null && isBetter(bestE1rm, base.bestE1rmKg)) {
    if (report && base.bestE1rmKg !== null) {
      newRecords.push({ kind: "best_e1rm", value: bestE1rm, previous: base.bestE1rmKg });
    }
    bests.bestE1rmKg = bestE1rm;
  }

  if (volume > 0 && isBetter(volume, base.bestSessionVolumeKg)) {
    if (report && base.bestSessionVolumeKg !== null) {
      newRecords.push({
        kind: "best_session_volume",
        value: volume,
        previous: base.bestSessionVolumeKg,
      });
    }
    bests.bestSessionVolumeKg = volume;
  }

  // Más reps con un peso: solo se compara contra ese mismo peso hecho antes.
  // Se reporta el récord con el peso más alto, uno por sesión.
  let bestRepsRecord: NewRecord | null = null;
  for (const [grams, reps] of [...repsAtWeight].sort((a, b) => a[0] - b[0])) {
    const before = base.repsAtWeightGrams[grams];
    if (before !== undefined && reps > before && report) {
      bestRepsRecord = {
        kind: "most_reps_at_weight",
        value: reps,
        previous: before,
        weightKg: grams / 1000,
      };
    }
    if (before === undefined || reps > before)
      bests.repsAtWeightGrams = { ...bests.repsAtWeightGrams, [grams]: reps };
  }
  if (bestRepsRecord) newRecords.push(bestRepsRecord);

  return { bests, newRecords };
}
