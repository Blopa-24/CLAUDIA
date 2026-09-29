// El descanso vive solo en memoria (propuesta, sección 2.4): si la app se cierra, se pierde el
// temporizador pero nunca una serie, que ya está en la base. La lógica está en domain/rest-timer.

import { create } from "zustand";

import { adjustRest, pauseRest, type RestTimer, resumeRest, startRest } from "@/domain/rest-timer";

interface RestTimerState {
  timer: RestTimer | null;
  start: (seconds?: number) => void;
  pause: () => void;
  resume: () => void;
  adjust: (deltaS: number) => void;
  skip: () => void;
}

export const useRestTimer = create<RestTimerState>()((set) => ({
  timer: null,
  start: (seconds) => set({ timer: startRest(Date.now(), seconds) }),
  pause: () => set(({ timer }) => ({ timer: timer && pauseRest(timer, Date.now()) })),
  resume: () => set(({ timer }) => ({ timer: timer && resumeRest(timer, Date.now()) })),
  adjust: (deltaS) =>
    set(({ timer }) => ({ timer: timer && adjustRest(timer, Date.now(), deltaS) })),
  skip: () => set({ timer: null }),
}));
