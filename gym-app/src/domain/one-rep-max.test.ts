import { estimateOneRepMax, MAX_REPS_FOR_1RM } from "./one-rep-max";

describe("estimateOneRepMax (Epley)", () => {
  it("aplica la fórmula de Epley", () => {
    expect(estimateOneRepMax(100, 10)).toBeCloseTo(133.333, 3);
    expect(estimateOneRepMax(80, 8)).toBeCloseTo(101.333, 3);
    expect(estimateOneRepMax(60, 5)).toBe(70);
  });

  it("con 1 rep devuelve el mismo peso", () => {
    expect(estimateOneRepMax(140, 1)).toBe(140);
  });

  it("estima hasta el límite de reps y no más allá", () => {
    expect(estimateOneRepMax(50, MAX_REPS_FOR_1RM)).toBeCloseTo(70, 10);
    expect(estimateOneRepMax(50, MAX_REPS_FOR_1RM + 1)).toBeNull();
  });

  it.each([
    ["peso 0", 0, 5],
    ["peso negativo", -20, 5],
    ["peso NaN", NaN, 5],
    ["peso infinito", Infinity, 5],
    ["reps 0", 100, 0],
    ["reps negativas", 100, -3],
    ["reps decimales", 100, 5.5],
    ["peso vacío", null, 5],
    ["reps vacías", 100, null],
  ])("no calcula con %s", (_name, weight, reps) => {
    expect(estimateOneRepMax(weight, reps)).toBeNull();
  });

  it.each(["reps_only", "duration", "distance"] as const)(
    "no calcula para ejercicios de tipo %s",
    (trackingType) => {
      expect(estimateOneRepMax(100, 5, trackingType)).toBeNull();
    },
  );
});
