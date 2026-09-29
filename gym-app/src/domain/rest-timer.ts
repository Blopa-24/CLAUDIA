// Temporizador de descanso (skill workout-engine, "REST TIMER"). Se guarda como hora de término
// y no como segundos restantes: así sigue exacto aunque la pantalla deje de actualizarse.

export const REST_STEP_S = 15;
export const DEFAULT_REST_S = 90;
/** Duraciones que se ofrecen para elegir, de 30 s a 5 min. */
export const REST_PRESETS_S = [30, 60, 90, 120, 180, 300] as const;
/** Límites al elegir o ajustar un descanso: nada negativo y nada absurdo. */
export const MAX_REST_S = 15 * 60;

export type RestTimer =
  /** Preparado con su duración, esperando a que la persona lo inicie. */
  | { status: "ready"; totalS: number }
  | { status: "running"; endsAt: number; totalS: number }
  | { status: "paused"; remainingMs: number; totalS: number };

const clampSeconds = (seconds: number) => Math.min(MAX_REST_S, Math.max(0, Math.round(seconds)));

export function startRest(now: number, seconds: number = DEFAULT_REST_S): RestTimer {
  const totalS = clampSeconds(seconds);
  return { status: "running", endsAt: now + totalS * 1000, totalS };
}

export function readyRest(seconds: number = DEFAULT_REST_S): RestTimer {
  return { status: "ready", totalS: clampSeconds(seconds) };
}

export function remainingMs(timer: RestTimer, now: number): number {
  switch (timer.status) {
    case "ready":
      return timer.totalS * 1000;
    case "running":
      return Math.max(0, timer.endsAt - now);
    case "paused":
      return timer.remainingMs;
  }
}

/** Terminó solo si alguna vez corrió: uno preparado de 0 s no cuenta como terminado. */
export function isFinished(timer: RestTimer, now: number): boolean {
  return timer.status !== "ready" && remainingMs(timer, now) === 0;
}

export function pauseRest(timer: RestTimer, now: number): RestTimer {
  if (timer.status !== "running") return timer;
  return { status: "paused", remainingMs: remainingMs(timer, now), totalS: timer.totalS };
}

/** Reanuda uno en pausa o inicia uno preparado. */
export function resumeRest(timer: RestTimer, now: number): RestTimer {
  if (timer.status === "running") return timer;
  return { status: "running", endsAt: now + remainingMs(timer, now), totalS: timer.totalS };
}

/** Suma o resta segundos. Nunca queda bajo cero. */
export function adjustRest(timer: RestTimer, now: number, deltaS: number): RestTimer {
  const totalS = clampSeconds(timer.totalS + deltaS);
  const next = Math.min(MAX_REST_S * 1000, Math.max(0, remainingMs(timer, now) + deltaS * 1000));
  switch (timer.status) {
    case "ready":
      return { status: "ready", totalS };
    case "running":
      return { status: "running", endsAt: now + next, totalS };
    case "paused":
      return { status: "paused", remainingMs: next, totalS };
  }
}

/** Formato corto de una duración para elegir: 90 → "1:30", 30 → "0:30". */
export function formatRestChoice(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}
