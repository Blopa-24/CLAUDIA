// Preferencias de la persona, guardadas en el teléfono (almacén clave-valor de expo-sqlite).
// Son ajustes pequeños; el historial de entrenamientos va en las tablas SQLite de src/db.

import Storage from "expo-sqlite/kv-store";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { DEFAULT_REST_S, MAX_REST_S } from "@/domain/rest-timer";
import type { WeightUnit } from "@/domain/units";
import { ACCENTS, type AccentName, DEFAULT_ACCENT } from "@/ui/theme/colors";

export const WEIGHT_UNITS = ["kg", "lb"] as const satisfies readonly WeightUnit[];

export interface Preferences {
  accent: AccentName;
  /** Unidad para anotar y mostrar pesos. En la base siempre se guarda en kg. */
  weightUnit: WeightUnit;
  /** Descanso de siempre, en segundos. */
  restSeconds: number;
  /** Si el descanso empieza solo al completar una serie o espera a que la persona lo inicie. */
  restAutoStart: boolean;
  /** Último descanso elegido para cada ejercicio (por ID); manda sobre el de siempre. */
  restByExercise: Record<string, number>;
}

export const DEFAULT_PREFERENCES: Preferences = {
  accent: DEFAULT_ACCENT,
  weightUnit: "kg",
  restSeconds: DEFAULT_REST_S,
  restAutoStart: true,
  restByExercise: {},
};

const isRestSeconds = (value: unknown): value is number =>
  typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= MAX_REST_S;

const field = (stored: unknown, key: string): unknown =>
  typeof stored === "object" && stored !== null && key in stored
    ? (stored as Record<string, unknown>)[key]
    : undefined;

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

function sanitizeRestMap(stored: unknown): Record<string, number> {
  if (typeof stored !== "object" || stored === null || Array.isArray(stored)) return {};
  return Object.fromEntries(
    Object.entries(stored).filter((entry): entry is [string, number] => isRestSeconds(entry[1])),
  );
}

/** Limpia lo leído del almacenamiento: un valor desconocido o dañado vuelve al de fábrica. */
export function sanitizePreferences(stored: unknown): Preferences {
  return {
    accent: pick(stored, "accent", ACCENTS, DEFAULT_PREFERENCES.accent),
    weightUnit: pick(stored, "weightUnit", WEIGHT_UNITS, DEFAULT_PREFERENCES.weightUnit),
    restSeconds: isRestSeconds(field(stored, "restSeconds"))
      ? (field(stored, "restSeconds") as number)
      : DEFAULT_PREFERENCES.restSeconds,
    restAutoStart:
      typeof field(stored, "restAutoStart") === "boolean"
        ? (field(stored, "restAutoStart") as boolean)
        : DEFAULT_PREFERENCES.restAutoStart,
    restByExercise: sanitizeRestMap(field(stored, "restByExercise")),
  };
}

interface PreferencesState extends Preferences {
  setAccent: (accent: AccentName) => void;
  setWeightUnit: (weightUnit: WeightUnit) => void;
  setRestSeconds: (seconds: number) => void;
  setRestAutoStart: (autoStart: boolean) => void;
  setExerciseRest: (exerciseId: string, seconds: number) => void;
}

export const usePreferences = create<PreferencesState>()(
  persist(
    (set) => ({
      ...DEFAULT_PREFERENCES,
      setAccent: (accent) => set({ accent }),
      setWeightUnit: (weightUnit) => set({ weightUnit }),
      setRestSeconds: (seconds) => {
        if (isRestSeconds(seconds)) set({ restSeconds: seconds });
      },
      setRestAutoStart: (restAutoStart) => set({ restAutoStart }),
      setExerciseRest: (exerciseId, seconds) => {
        if (isRestSeconds(seconds)) {
          set((state) => ({ restByExercise: { ...state.restByExercise, [exerciseId]: seconds } }));
        }
      },
    }),
    {
      name: "gymsuper.preferences",
      version: 1,
      storage: createJSONStorage(() => Storage),
      partialize: ({ accent, weightUnit, restSeconds, restAutoStart, restByExercise }) => ({
        accent,
        weightUnit,
        restSeconds,
        restAutoStart,
        restByExercise,
      }),
      // Quien venía de una versión anterior recibe los valores de fábrica en lo que falte.
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

/** Descanso que corresponde a un ejercicio: el último elegido para él, o el de siempre. */
export function restSecondsFor(
  preferences: Pick<Preferences, "restSeconds" | "restByExercise">,
  exerciseId: string,
): number {
  return preferences.restByExercise[exerciseId] ?? preferences.restSeconds;
}
