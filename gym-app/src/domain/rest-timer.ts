// Temporizador de descanso (skill workout-engine, "REST TIMER"). Se guarda como hora de término
// y no como segundos restantes: así sigue exacto aunque la pantalla deje de actualizarse.

export const REST_STEP_S = 15;
export const DEFAULT_REST_S = 90;

export type RestTimer =
  | { status: "running"; endsAt: number; totalS: number }
  | { status: "paused"; remainingMs: number; totalS: number };

export function startRest(now: number, seconds: number = DEFAULT_REST_S): RestTimer {
  return { status: "running", endsAt: now + seconds * 1000, totalS: seconds };
}

export function remainingMs(timer: RestTimer, now: number): number {
  return timer.status === "running" ? Math.max(0, timer.endsAt - now) : timer.remainingMs;
}

export function isFinished(timer: RestTimer, now: number): boolean {
  return remainingMs(timer, now) === 0;
}

export function pauseRest(timer: RestTimer, now: number): RestTimer {
  if (timer.status === "paused") return timer;
  return { status: "paused", remainingMs: remainingMs(timer, now), totalS: timer.totalS };
}

export function resumeRest(timer: RestTimer, now: number): RestTimer {
  if (timer.status === "running") return timer;
  return { status: "running", endsAt: now + timer.remainingMs, totalS: timer.totalS };
}

/** Suma o resta segundos. Nunca queda bajo cero. */
export function adjustRest(timer: RestTimer, now: number, deltaS: number): RestTimer {
  const next = Math.max(0, remainingMs(timer, now) + deltaS * 1000);
  const totalS = Math.max(0, timer.totalS + deltaS);
  return timer.status === "running"
    ? { status: "running", endsAt: now + next, totalS }
    : { status: "paused", remainingMs: next, totalS };
}
