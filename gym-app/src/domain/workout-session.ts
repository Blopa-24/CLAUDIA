// Estados de un entrenamiento (skill workout-engine, "SESSION STATES").
//
//   planned ──start──▶ active ◀──resume── paused
//                        │ └────pause────▶  │
//                        ├──finish──▶ completed ◀──finish──┤
//   planned/active/paused ──abandon──▶ abandoned
//
// completed y abandoned son finales. Un entrenamiento abandonado se conserva, no se borra.
// La duración descuenta el tiempo en pausa. Todas las horas son milisegundos UTC.

import { err, ok, type Result } from "./result";

export type SessionStatus = "planned" | "active" | "paused" | "completed" | "abandoned";
export type SessionEvent = "start" | "pause" | "resume" | "finish" | "abandon";

export interface SessionTiming {
  status: SessionStatus;
  startedAt: number | null;
  endedAt: number | null;
  /** Desde cuándo está en pausa, si lo está. */
  pausedAt: number | null;
  /** Tiempo total en pausas ya cerradas. */
  pausedMs: number;
}

export type TransitionError =
  | { code: "invalid_transition"; from: SessionStatus; event: SessionEvent }
  | { code: "time_went_backwards"; now: number; reference: number };

const TRANSITIONS: Record<SessionStatus, Partial<Record<SessionEvent, SessionStatus>>> = {
  planned: { start: "active", abandon: "abandoned" },
  active: { pause: "paused", finish: "completed", abandon: "abandoned" },
  paused: { resume: "active", finish: "completed", abandon: "abandoned" },
  completed: {},
  abandoned: {},
};

export const plannedSession = (): SessionTiming => ({
  status: "planned",
  startedAt: null,
  endedAt: null,
  pausedAt: null,
  pausedMs: 0,
});

export function canTransition(status: SessionStatus, event: SessionEvent): boolean {
  return TRANSITIONS[status][event] !== undefined;
}

export function transition(
  session: SessionTiming,
  event: SessionEvent,
  now: number,
): Result<SessionTiming, TransitionError> {
  const next = TRANSITIONS[session.status][event];
  if (next === undefined) return err({ code: "invalid_transition", from: session.status, event });

  const reference = session.pausedAt ?? session.startedAt;
  if (reference !== null && now < reference) {
    return err({ code: "time_went_backwards", now, reference });
  }

  // Al salir de una pausa (reanudar, terminar o abandonar) se suma el tramo pausado.
  const closedPause = session.pausedAt !== null ? now - session.pausedAt : 0;
  const pausedMs = session.pausedMs + closedPause;

  switch (event) {
    case "start":
      return ok({ ...session, status: next, startedAt: now });
    case "pause":
      return ok({ ...session, status: next, pausedAt: now });
    case "resume":
      return ok({ ...session, status: next, pausedAt: null, pausedMs });
    case "finish":
    case "abandon":
      return ok({ ...session, status: next, endedAt: now, pausedAt: null, pausedMs });
  }
}

/** Duración activa en ms: desde el inicio hasta el fin (o `now`), sin contar pausas. */
export function activeDurationMs(session: SessionTiming, now: number): number {
  if (session.startedAt === null) return 0;
  const end = session.endedAt ?? now;
  const openPause = session.pausedAt !== null ? end - session.pausedAt : 0;
  return Math.max(0, end - session.startedAt - session.pausedMs - openPause);
}
