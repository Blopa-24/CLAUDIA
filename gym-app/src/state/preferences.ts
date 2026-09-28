// Preferencias de la persona, guardadas en el teléfono (almacén clave-valor de expo-sqlite).
// Son ajustes pequeños; el historial de entrenamientos irá en tablas SQLite (M2).

import Storage from "expo-sqlite/kv-store";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { ACCENTS, type AccentName, DEFAULT_ACCENT } from "@/ui/theme/colors";

export interface Preferences {
  accent: AccentName;
}

export const DEFAULT_PREFERENCES: Preferences = { accent: DEFAULT_ACCENT };

/** Limpia lo leído del almacenamiento: un valor desconocido o dañado vuelve al de fábrica. */
export function sanitizePreferences(stored: unknown): Preferences {
  const accent =
    typeof stored === "object" && stored !== null && "accent" in stored ? stored.accent : undefined;
  return {
    accent: ACCENTS.includes(accent as AccentName) ? (accent as AccentName) : DEFAULT_ACCENT,
  };
}

interface PreferencesState extends Preferences {
  setAccent: (accent: AccentName) => void;
}

export const usePreferences = create<PreferencesState>()(
  persist(
    (set) => ({
      ...DEFAULT_PREFERENCES,
      setAccent: (accent) => set({ accent }),
    }),
    {
      name: "gymsuper.preferences",
      version: 1,
      storage: createJSONStorage(() => Storage),
      partialize: ({ accent }) => ({ accent }),
      merge: (stored, current) => ({ ...current, ...sanitizePreferences(stored) }),
    },
  ),
);
