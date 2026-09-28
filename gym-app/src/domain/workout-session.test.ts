import {
  activeDurationMs,
  canTransition,
  plannedSession,
  type SessionEvent,
  type SessionStatus,
  type SessionTiming,
  transition,
} from "./workout-session";

const MIN = 60_000;
const T0 = Date.UTC(2026, 8, 28, 18, 0);

function run(steps: [SessionEvent, number][]): SessionTiming {
  let s = plannedSession();
  for (const [event, minute] of steps) {
    const r = transition(s, event, T0 + minute * MIN);
    if (!r.ok) throw new Error(`${event}: ${r.error.code}`);
    s = r.value;
  }
  return s;
}

describe("transiciones válidas", () => {
  it("recorre un entrenamiento completo con una pausa", () => {
    const s = run([
      ["start", 0],
      ["pause", 20],
      ["resume", 25],
      ["finish", 60],
    ]);
    expect(s).toEqual({
      status: "completed",
      startedAt: T0,
      endedAt: T0 + 60 * MIN,
      pausedAt: null,
      pausedMs: 5 * MIN,
    });
    expect(activeDurationMs(s, T0 + 999 * MIN)).toBe(55 * MIN);
  });

  it("permite terminar directamente desde una pausa y descuenta ese tramo", () => {
    const s = run([
      ["start", 0],
      ["pause", 40],
      ["finish", 50],
    ]);
    expect(s.status).toBe("completed");
    expect(activeDurationMs(s, T0 + 999 * MIN)).toBe(40 * MIN);
  });

  it("conserva el entrenamiento abandonado con su hora de término", () => {
    const s = run([
      ["start", 0],
      ["abandon", 12],
    ]);
    expect(s.status).toBe("abandoned");
    expect(s.endedAt).toBe(T0 + 12 * MIN);
  });

  it("permite abandonar uno planificado que nunca empezó", () => {
    const s = run([["abandon", 0]]);
    expect(s.status).toBe("abandoned");
    expect(activeDurationMs(s, T0)).toBe(0);
  });
});

describe("transiciones inválidas", () => {
  const cases: [SessionStatus, SessionEvent][] = [
    ["planned", "pause"],
    ["planned", "resume"],
    ["planned", "finish"],
    ["active", "start"],
    ["active", "resume"],
    ["paused", "pause"],
    ["paused", "start"],
    ...(["start", "pause", "resume", "finish", "abandon"] as const).flatMap(
      (e): [SessionStatus, SessionEvent][] => [
        ["completed", e],
        ["abandoned", e],
      ],
    ),
  ];

  it.each(cases)("%s no acepta %s", (from, event) => {
    const session: SessionTiming = { ...plannedSession(), status: from, startedAt: T0 };
    expect(canTransition(from, event)).toBe(false);
    expect(transition(session, event, T0 + MIN)).toEqual({
      ok: false,
      error: { code: "invalid_transition", from, event },
    });
  });

  it("rechaza una hora anterior al inicio o a la pausa", () => {
    const started = run([["start", 10]]);
    const r = transition(started, "pause", T0);
    expect(r).toEqual({
      ok: false,
      error: { code: "time_went_backwards", now: T0, reference: T0 + 10 * MIN },
    });
  });
});

describe("activeDurationMs", () => {
  it("es 0 antes de empezar", () => {
    expect(activeDurationMs(plannedSession(), T0)).toBe(0);
  });

  it("cuenta hasta ahora mientras está activo", () => {
    expect(activeDurationMs(run([["start", 0]]), T0 + 30 * MIN)).toBe(30 * MIN);
  });

  it("se congela mientras está en pausa", () => {
    const s = run([
      ["start", 0],
      ["pause", 30],
    ]);
    expect(activeDurationMs(s, T0 + 45 * MIN)).toBe(30 * MIN);
    expect(activeDurationMs(s, T0 + 90 * MIN)).toBe(30 * MIN);
  });

  it("suma varias pausas", () => {
    const s = run([
      ["start", 0],
      ["pause", 10],
      ["resume", 15],
      ["pause", 30],
      ["resume", 40],
      ["finish", 70],
    ]);
    expect(s.pausedMs).toBe(15 * MIN);
    expect(activeDurationMs(s, T0 + 999 * MIN)).toBe(55 * MIN);
  });
});
