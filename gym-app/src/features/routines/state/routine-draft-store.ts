// Borrador de la rutina que se está creando o editando. Vive en memoria mientras la persona va y
// viene entre el editor y la biblioteca; se guarda en la base solo al tocar "Guardar".

import { create } from "zustand";

import type { Exercise } from "@/domain/exercise";
import { type Routine, type TargetDraft, targetToDraft } from "@/domain/routine";

export interface DraftItem {
  /** Clave local, estable mientras se edita (un mismo ejercicio puede aparecer dos veces). */
  key: string;
  exercise: Exercise;
  target: TargetDraft;
  restS: number | null;
}

interface RoutineDraftState {
  /** null al crear una rutina nueva. */
  routineId: string | null;
  name: string;
  items: DraftItem[];
  /** Hay cambios sin guardar. */
  dirty: boolean;
  startNew: () => void;
  load: (routine: Routine) => void;
  setName: (name: string) => void;
  addExercise: (exercise: Exercise) => void;
  remove: (key: string) => void;
  move: (key: string, delta: -1 | 1) => void;
  setTarget: (key: string, field: keyof TargetDraft, text: string) => void;
  setRest: (key: string, seconds: number | null) => void;
}

const EMPTY_TARGET: TargetDraft = { sets: "", repsMin: "", repsMax: "", rir: "" };
let counter = 0;
const nextKey = () => `item-${++counter}`;

const updateItem = (items: DraftItem[], key: string, change: (item: DraftItem) => DraftItem) =>
  items.map((item) => (item.key === key ? change(item) : item));

export const useRoutineDraft = create<RoutineDraftState>()((set) => ({
  routineId: null,
  name: "",
  items: [],
  dirty: false,
  startNew: () => set({ routineId: null, name: "", items: [], dirty: false }),
  load: (routine) =>
    set({
      routineId: routine.id,
      name: routine.name,
      items: routine.exercises.map((item) => ({
        key: nextKey(),
        exercise: item.exercise,
        target: targetToDraft(item.target),
        restS: item.restS,
      })),
      dirty: false,
    }),
  setName: (name) => set({ name, dirty: true }),
  addExercise: (exercise) =>
    set((state) => ({
      items: [
        ...state.items,
        { key: nextKey(), exercise, target: { ...EMPTY_TARGET }, restS: null },
      ],
      dirty: true,
    })),
  remove: (key) =>
    set((state) => ({ items: state.items.filter((item) => item.key !== key), dirty: true })),
  move: (key, delta) =>
    set((state) => {
      const from = state.items.findIndex((item) => item.key === key);
      const to = from + delta;
      if (from < 0 || to < 0 || to >= state.items.length) return state;
      const items = [...state.items];
      const [moved] = items.splice(from, 1);
      if (moved) items.splice(to, 0, moved);
      return { items, dirty: true };
    }),
  setTarget: (key, field, text) =>
    set((state) => ({
      items: updateItem(state.items, key, (item) => ({
        ...item,
        target: { ...item.target, [field]: text },
      })),
      dirty: true,
    })),
  setRest: (key, seconds) =>
    set((state) => ({
      items: updateItem(state.items, key, (item) => ({ ...item, restS: seconds })),
      dirty: true,
    })),
}));
