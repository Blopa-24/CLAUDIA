// Cómo se muestran los números del entrenamiento. Solo presentación: nada de esto se guarda.

import type { ExerciseTracking } from "@/domain/types";
import { fromKg, roundForDisplay, type WeightUnit } from "@/domain/units";
import type { WorkoutSet } from "@/domain/workout";

/** Pasos de redondeo para mostrar: 0,01 kg alcanza para cualquier disco y para libras exactas. */
const DISPLAY_STEP = 0.01;

const numberFormat = (language: string) =>
  new Intl.NumberFormat(language, { maximumFractionDigits: 2 });

/** Peso guardado en kg, en la unidad de la persona: 80 → "80", 82,5 → "82,5". */
export function weightNumber(weightKg: number, unit: WeightUnit, language: string): string {
  return numberFormat(language).format(roundForDisplay(fromKg(weightKg, unit), DISPLAY_STEP));
}

export function formatWeight(weightKg: number, unit: WeightUnit, language: string): string {
  return `${weightNumber(weightKg, unit, language)} ${unit}`;
}

/** Volumen total: sin decimales y con separador de miles. */
export function formatVolume(volumeKg: number, unit: WeightUnit, language: string): string {
  const value = Math.round(fromKg(volumeKg, unit));
  return `${new Intl.NumberFormat(language, { maximumFractionDigits: 0 }).format(value)} ${unit}`;
}

/** Duración de un entrenamiento: "38:12" o "1:02:05". */
export function formatElapsed(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const pad = (value: number) => String(value).padStart(2, "0");
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${pad(minutes)}:${pad(seconds)}`;
}

/** Cuenta regresiva del descanso, redondeando hacia arriba: 1,2 s restantes se ven como "00:02". */
export function formatCountdown(ms: number): string {
  return formatElapsed(Math.ceil(Math.max(0, ms) / 1000) * 1000);
}

export interface SetLabels {
  rir: string;
  seconds: string;
  meters: string;
}

/** Una serie en una línea: "80 kg × 8 · RIR 2", "12 reps", "60 s", "5000 m · 1500 s". */
export function formatSet(
  set: Pick<WorkoutSet, "weightKg" | "reps" | "rir" | "durationS" | "distanceM">,
  tracking: ExerciseTracking,
  unit: WeightUnit,
  language: string,
  labels: SetLabels,
): string {
  const number = numberFormat(language);
  const parts: string[] = [];
  switch (tracking.trackingType) {
    case "weight_reps":
      parts.push(
        `${set.weightKg === null ? "—" : formatWeight(set.weightKg, unit, language)} × ${set.reps ?? "—"}`,
      );
      break;
    case "reps_only":
      parts.push(`× ${set.reps ?? "—"}`);
      break;
    case "duration":
      parts.push(`${set.durationS ?? "—"} ${labels.seconds}`);
      break;
    case "distance":
      parts.push(`${set.distanceM === null ? "—" : number.format(set.distanceM)} ${labels.meters}`);
      if (set.durationS !== null) parts.push(`${set.durationS} ${labels.seconds}`);
      break;
  }
  if (set.rir !== null) parts.push(`${labels.rir} ${set.rir}`);
  return parts.join(" · ");
}
