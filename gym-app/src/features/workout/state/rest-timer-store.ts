// El descanso vive solo en memoria (propuesta, sección 2.4): si la app se cierra, se pierde el
// temporizador pero nunca una serie, que ya está en la base. La lógica está en domain/rest-timer.

import { create } from "zustand";

import {
  adjustRest,
  pauseRest,
  readyRest,
  type RestTimer,
  resumeRest,
  startRest,
} from "@/domain/rest-timer";

interface RestTimerState {
  timer: RestTimer | null;
  /** Ejercicio del que viene el descanso: al elegir otra duración, se recuerda para él. */
  exerciseId: string | null;
  /** Empieza a contar de inmediato. */
  start: (seconds: number, exerciseId: string | null) => void;
  /** Lo deja listo, esperando que la persona lo inicie. */
  prepare: (seconds: number, exerciseId: string | null) => void;
  /** Otra duración: vuelve a empezar desde cero con ella. */
  choose: (seconds: number) => void;
  pause: () => void;
  /** Reanuda uno en pausa o inicia uno preparado. */
  resume: () => void;
  adjust: (deltaS: number) => void;
  skip: () => void;
}

export const useRestTimer = create<RestTimerState>()((set) => ({
  timer: null,
  exerciseId: null,
  start: (seconds, exerciseId) => set({ timer: startRest(Date.now(), seconds), exerciseId }),
  prepare: (seconds, exerciseId) => set({ timer: readyRest(seconds), exerciseId }),
  choose: (seconds) => set({ timer: startRest(Date.now(), seconds) }),
  pause: () => set(({ timer }) => ({ timer: timer && pauseRest(timer, Date.now()) })),
  resume: () => set(({ timer }) => ({ timer: timer && resumeRest(timer, Date.now()) })),
  adjust: (deltaS) =>
    set(({ timer }) => ({ timer: timer && adjustRest(timer, Date.now(), deltaS) })),
  skip: () => set({ timer: null, exerciseId: null }),
}));
