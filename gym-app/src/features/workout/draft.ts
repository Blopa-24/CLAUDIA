// Qué aparece escrito en la próxima serie. La meta de la propuesta (sección 4.5): repetir la serie
// anterior con un solo toque en "Completar serie".

import type { SetDraft } from "@/domain/set-input";
import { fromKg, roundForDisplay, type WeightUnit } from "@/domain/units";
import type { WorkoutExercise, WorkoutSet } from "@/domain/workout";

/** Número para un campo editable: sin separador de miles, para que se pueda volver a leer. */
export function editableNumber(value: number, language: string): string {
  return new Intl.NumberFormat(language, { maximumFractionDigits: 2, useGrouping: false }).format(
    value,
  );
}

export function emptyDraft(unit: WeightUnit): SetDraft {
  return {
    type: "working",
    weight: "",
    unit,
    reps: "",
    rir: "",
    rpe: "",
    durationS: "",
    distanceM: "",
  };
}

/** Los valores de una serie guardada, escritos en la unidad actual de la persona. */
export function draftFromSet(set: WorkoutSet, unit: WeightUnit, language: string): SetDraft {
  const text = (value: number | null) => (value === null ? "" : editableNumber(value, language));
  return {
    type: set.type,
    weight: set.weightKg === null ? "" : text(roundForDisplay(fromKg(set.weightKg, unit), 0.01)),
    unit,
    reps: text(set.reps),
    rir: text(set.rir),
    rpe: text(set.rpe),
    durationS: text(set.durationS),
    distanceM: text(set.distanceM),
  };
}

/**
 * Próxima serie de un ejercicio: copia la última de hoy; si todavía no hay, la primera de la vez
 * anterior (como serie de trabajo); si nunca se hizo, vacía.
 */
export function nextDraft(
  entry: WorkoutExercise,
  previous: readonly WorkoutSet[] | undefined,
  unit: WeightUnit,
  language: string,
): SetDraft {
  const last = entry.sets[entry.sets.length - 1];
  if (last) return draftFromSet(last, unit, language);
  const before = previous?.find((set) => set.type !== "warmup") ?? previous?.[0];
  if (before) return { ...draftFromSet(before, unit, language), type: "working" };
  return emptyDraft(unit);
}
