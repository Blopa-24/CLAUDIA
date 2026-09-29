import {
  emptyTarget,
  formatTarget,
  hasTarget,
  isValidRest,
  targetToDraft,
  type TargetDraft,
  validateRoutineName,
  validateTarget,
} from "./routine";

const draft = (over: Partial<TargetDraft> = {}): TargetDraft => ({
  sets: "",
  repsMin: "",
  repsMax: "",
  rir: "",
  ...over,
});

const labels = {
  sets: (count: number) => `${count} ${count === 1 ? "serie" : "series"}`,
  rir: "RIR",
};

describe("validateRoutineName", () => {
  it("quita espacios sobrantes", () => {
    expect(validateRoutineName("  Día   de pierna ")).toEqual({ ok: true, value: "Día de pierna" });
  });

  it("pide un nombre y no más de 60 caracteres", () => {
    expect(validateRoutineName("   ")).toEqual({ ok: false, error: "required" });
    expect(validateRoutineName("a".repeat(61))).toEqual({ ok: false, error: "too_long" });
    expect(validateRoutineName("a".repeat(60)).ok).toBe(true);
  });
});

describe("validateTarget", () => {
  it("todo vacío es válido: una rutina puede ser solo una lista", () => {
    expect(validateTarget(draft())).toEqual({ ok: true, value: emptyTarget() });
  });

  it("3 series de 8 a 10 con RIR 2", () => {
    expect(validateTarget(draft({ sets: "3", repsMin: "8", repsMax: "10", rir: "2" }))).toEqual({
      ok: true,
      value: { sets: 3, repsMin: 8, repsMax: 10, rir: 2 },
    });
  });

  it("un solo número de reps es un objetivo fijo, esté en mínimo o en máximo", () => {
    expect(validateTarget(draft({ repsMin: "8" }))).toEqual({
      ok: true,
      value: { sets: null, repsMin: 8, repsMax: 8, rir: null },
    });
    expect(validateTarget(draft({ repsMax: "12" }))).toEqual({
      ok: true,
      value: { sets: null, repsMin: 12, repsMax: 12, rir: null },
    });
  });

  it.each([
    ["series en cero", { sets: "0" }, { field: "sets", code: "out_of_range" }],
    ["más de 20 series", { sets: "21" }, { field: "sets", code: "out_of_range" }],
    ["series con decimales", { sets: "2,5" }, { field: "sets", code: "invalid" }],
    ["reps con letras", { repsMin: "8a" }, { field: "repsMin", code: "invalid" }],
    ["rango al revés", { repsMin: "10", repsMax: "8" }, { field: "repsMax", code: "out_of_range" }],
    ["RIR sobre 10", { rir: "11" }, { field: "rir", code: "out_of_range" }],
  ] as const)("rechaza %s", (_label, over, error) => {
    expect(validateTarget(draft(over))).toEqual({ ok: false, error });
  });
});

describe("formatTarget", () => {
  it.each([
    [{ sets: 3, repsMin: 8, repsMax: 10, rir: 2 }, "3 × 8–10 · RIR 2"],
    [{ sets: 3, repsMin: 8, repsMax: 8, rir: null }, "3 × 8"],
    [{ sets: 4, repsMin: null, repsMax: null, rir: null }, "4 series"],
    [{ sets: 1, repsMin: null, repsMax: null, rir: null }, "1 serie"],
    [{ sets: null, repsMin: 12, repsMax: 12, rir: null }, "× 12"],
    [{ sets: null, repsMin: null, repsMax: null, rir: 1 }, "RIR 1"],
    [emptyTarget(), ""],
  ])("%j → %p", (target, text) => {
    expect(formatTarget(target, labels)).toBe(text);
  });
});

describe("utilidades de objetivos", () => {
  it("hasTarget distingue un objetivo vacío", () => {
    expect(hasTarget(emptyTarget())).toBe(false);
    expect(hasTarget({ ...emptyTarget(), sets: 3 })).toBe(true);
  });

  it("targetToDraft deja el rango fijo en un solo campo", () => {
    expect(targetToDraft({ sets: 3, repsMin: 8, repsMax: 8, rir: null })).toEqual(
      draft({ sets: "3", repsMin: "8" }),
    );
    expect(targetToDraft({ sets: 3, repsMin: 8, repsMax: 10, rir: 2 })).toEqual(
      draft({ sets: "3", repsMin: "8", repsMax: "10", rir: "2" }),
    );
  });

  it("isValidRest acepta vacío o de 0 a 15 minutos", () => {
    expect(isValidRest(null)).toBe(true);
    expect(isValidRest(90)).toBe(true);
    expect(isValidRest(-1)).toBe(false);
    expect(isValidRest(901)).toBe(false);
    expect(isValidRest(1.5)).toBe(false);
  });
});
