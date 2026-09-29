import { parseDecimal, type SetDraft, validateSet } from "./set-input";
import type { ExerciseTracking } from "./types";
import { KG_PER_LB } from "./units";

const tracking = (over: Partial<ExerciseTracking> = {}): ExerciseTracking => ({
  trackingType: "weight_reps",
  laterality: "bilateral",
  loadCount: 1,
  ...over,
});

const draft = (over: Partial<SetDraft> = {}): SetDraft => ({
  type: "working",
  weight: "80",
  unit: "kg",
  reps: "8",
  rir: "",
  rpe: "",
  durationS: "",
  distanceM: "",
  ...over,
});

describe("parseDecimal", () => {
  it.each([
    ["80", 80],
    ["80,5", 80.5],
    ["80.5", 80.5],
    ["  12 ", 12],
    [",5", 0.5],
  ])("lee %p como %p", (text, value) => {
    expect(parseDecimal(text)).toBe(value);
  });

  it("vacío es null y lo que no es número es NaN", () => {
    expect(parseDecimal("  ")).toBeNull();
    expect(parseDecimal("8a")).toBeNaN();
    expect(parseDecimal("-5")).toBeNaN();
    expect(parseDecimal("1,2,3")).toBeNaN();
  });
});

describe("validateSet", () => {
  it("80 kg × 8 con RIR 2", () => {
    expect(validateSet(draft({ rir: "2" }), tracking())).toEqual({
      ok: true,
      value: {
        type: "working",
        weightKg: 80,
        enteredUnit: "kg",
        reps: 8,
        rir: 2,
        rpe: null,
        durationS: null,
        distanceM: null,
      },
    });
  });

  it("guarda en kg lo escrito en libras, sin redondear, y recuerda la unidad", () => {
    const result = validateSet(draft({ weight: "100", unit: "lb" }), tracking());
    expect(result.ok && result.value.weightKg).toBeCloseTo(100 * KG_PER_LB, 10);
    expect(result.ok && result.value.enteredUnit).toBe("lb");
  });

  it("acepta la barra sola: 0 kg", () => {
    expect(validateSet(draft({ weight: "0" }), tracking()).ok).toBe(true);
  });

  it.each([
    ["peso vacío", { weight: "" }, { field: "weight", code: "required" }],
    ["peso con letras", { weight: "8o" }, { field: "weight", code: "invalid" }],
    ["peso sobre 1.500 kg", { weight: "1500,5" }, { field: "weight", code: "out_of_range" }],
    ["reps vacías", { reps: "" }, { field: "reps", code: "required" }],
    ["reps con decimales", { reps: "8,5" }, { field: "reps", code: "invalid" }],
    ["RIR sobre 10", { rir: "11" }, { field: "rir", code: "out_of_range" }],
    ["RPE bajo 1", { rpe: "0,5" }, { field: "rpe", code: "out_of_range" }],
    ["RPE fuera de pasos de 0,5", { rpe: "8,3" }, { field: "rpe", code: "invalid" }],
  ] as const)("rechaza %s", (_label, over, error) => {
    expect(validateSet(draft(over), tracking())).toEqual({ ok: false, error });
  });

  it("revisa el límite en kg aunque se escriba en libras", () => {
    expect(validateSet(draft({ weight: "3400", unit: "lb" }), tracking())).toEqual({
      ok: false,
      error: { field: "weight", code: "out_of_range" },
    });
  });

  it("AMRAP no tiene máximo de reps", () => {
    expect(validateSet(draft({ type: "amrap", reps: "150" }), tracking()).ok).toBe(true);
  });

  it("peso corporal: pide reps e ignora el peso", () => {
    const result = validateSet(
      draft({ weight: "", reps: "12" }),
      tracking({ trackingType: "reps_only" }),
    );
    expect(result).toEqual({
      ok: true,
      value: expect.objectContaining({ weightKg: null, enteredUnit: null, reps: 12 }),
    });
  });

  it("tiempo: pide segundos mayores que cero y descarta reps", () => {
    const plank = tracking({ trackingType: "duration" });
    expect(validateSet(draft({ durationS: "" }), plank)).toEqual({
      ok: false,
      error: { field: "durationS", code: "required" },
    });
    expect(validateSet(draft({ durationS: "0" }), plank)).toEqual({
      ok: false,
      error: { field: "durationS", code: "out_of_range" },
    });
    expect(validateSet(draft({ durationS: "60" }), plank)).toEqual({
      ok: true,
      value: expect.objectContaining({ durationS: 60, reps: null, weightKg: null }),
    });
  });

  it("distancia: pide metros mayores que cero y acepta tiempo opcional", () => {
    const run = tracking({ trackingType: "distance" });
    expect(validateSet(draft({ distanceM: "0" }), run)).toEqual({
      ok: false,
      error: { field: "distanceM", code: "out_of_range" },
    });
    expect(validateSet(draft({ distanceM: "5000", durationS: "1500" }), run)).toEqual({
      ok: true,
      value: expect.objectContaining({ distanceM: 5000, durationS: 1500 }),
    });
    expect(validateSet(draft({ distanceM: "" }), run)).toEqual({
      ok: false,
      error: { field: "distanceM", code: "required" },
    });
  });
});
