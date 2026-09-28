// Preferencias de la persona, guardadas en el teléfono (almacén clave-valor de expo-sqlite).
// Son ajustes pequeños; el historial de entrenamientos va en las tablas SQLite de src/db.

import Storage from "expo-sqlite/kv-store";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { WeightUnit } from "@/domain/units";
import { ACCENTS, type AccentName, DEFAULT_ACCENT } from "@/ui/theme/colors";

export const WEIGHT_UNITS = ["kg", "lb"] as const satisfies readonly WeightUnit[];

export interface Preferences {
  accent: AccentName;
  /** Unidad para anotar y mostrar pesos. En la base siempre se guarda en kg. */
  weightUnit: WeightUnit;
}

export const DEFAULT_PREFERENCES: Preferences = { accent: DEFAULT_ACCENT, weightUnit: "kg" };

function pick<T extends string>(
  stored: unknown,
  key: string,
  allowed: readonly T[],
  fallback: T,
): T {
  const value =
    typeof stored === "object" && stored !== null && key in stored
      ? (stored as Record<string, unknown>)[key]
      : undefined;
  return allowed.includes(value as T) ? (value as T) : fallback;
}

/** Limpia lo leído del almacenamiento: un valor desconocido o dañado vuelve al de fábrica. */
export function sanitizePreferences(stored: unknown): Preferences {
  return {
    accent: pick(stored, "accent", ACCENTS, DEFAULT_PREFERENCES.accent),
    weightUnit: pick(stored, "weightUnit", WEIGHT_UNITS, DEFAULT_PREFERENCES.weightUnit),
  };
}

interface PreferencesState extends Preferences {
  setAccent: (accent: AccentName) => void;
  setWeightUnit: (weightUnit: WeightUnit) => void;
}

export const usePreferences = create<PreferencesState>()(
  persist(
    (set) => ({
      ...DEFAULT_PREFERENCES,
      setAccent: (accent) => set({ accent }),
      setWeightUnit: (weightUnit) => set({ weightUnit }),
    }),
    {
      name: "gymsuper.preferences",
      version: 1,
      storage: createJSONStorage(() => Storage),
      partialize: ({ accent, weightUnit }) => ({ accent, weightUnit }),
      // Quien venía de la versión sin unidad recibe kg, sin perder su acento.
      merge: (stored, current) => ({ ...current, ...sanitizePreferences(stored) }),
    },
  ),
);

/** Si leer las preferencias falla, zustand no avisa: pasado este tiempo se sigue igual. */
const HYDRATION_TIMEOUT_MS = 3000;

/** Se resuelve cuando las preferencias terminan de leerse del teléfono, o al agotar el tiempo. */
export function preferencesHydrated(timeoutMs: number = HYDRATION_TIMEOUT_MS): Promise<void> {
  if (usePreferences.persist.hasHydrated()) return Promise.resolve();
  return new Promise((resolve) => {
    const done = () => {
      clearTimeout(timer);
      unsubscribe();
      resolve();
    };
    const timer = setTimeout(done, timeoutMs);
    const unsubscribe = usePreferences.persist.onFinishHydration(done);
  });
}
