// Qué ejercicio del entrenamiento está "en curso" en la pantalla. Solo en memoria: si no hay uno
// elegido, la pantalla usa el primero sin terminar.

import { create } from "zustand";

interface WorkoutFocusState {
  focusId: string | null;
  focus: (workoutExerciseId: string | null) => void;
}

export const useWorkoutFocus = create<WorkoutFocusState>()((set) => ({
  focusId: null,
  focus: (focusId) => set({ focusId }),
}));
