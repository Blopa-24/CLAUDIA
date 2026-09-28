import { evaluateSessionRecords, type ExerciseBests, toGrams } from "./personal-records";
import type { ExerciseTracking, SetPerformance } from "./types";

const bench: ExerciseTracking = { trackingType: "weight_reps", laterality: "bilateral" };
const set = (
  weightKg: number,
  reps: number,
  over: Partial<SetPerformance> = {},
): SetPerformance => ({
  type: "working",
  weightKg,
  reps,
  completed: true,
  ...over,
});

const history: ExerciseBests = {
  heaviestWeightKg: 100,
  bestE1rmKg: 120, // 90 kg × 6
  bestSessionVolumeKg: 2000,
  repsAtWeightGrams: { [toGrams(80)]: 8, [toGrams(100)]: 1 },
};
const kinds = (r: { newRecords: { kind: string }[] }) => r.newRecords.map((n) => n.kind).sort();

describe("primera sesión de un ejercicio", () => {
  it("fija la marca base sin reportar récords", () => {
    const result = evaluateSessionRecords(null, [set(80, 8), set(85, 5)], bench);
    expect(result.newRecords).toEqual([]);
    expect(result.bests.heaviestWeightKg).toBe(85);
    expect(result.bests.bestSessionVolumeKg).toBe(1065);
    expect(result.bests.repsAtWeightGrams).toEqual({ 80000: 8, 85000: 5 });
  });
});

describe("récords frente al historial", () => {
  it("detecta un nuevo peso máximo", () => {
    const r = evaluateSessionRecords(history, [set(102.5, 1)], bench);
    expect(r.newRecords).toContainEqual({ kind: "heaviest_weight", value: 102.5, previous: 100 });
    expect(r.bests.heaviestWeightKg).toBe(102.5);
  });

  it("detecta un mejor 1RM estimado sin ser el peso máximo", () => {
    const r = evaluateSessionRecords(history, [set(95, 6)], bench); // 114 < 120
    expect(kinds(r)).toEqual([]);
    const r2 = evaluateSessionRecords(history, [set(95, 8)], bench); // 120,33 > 120
    expect(kinds(r2)).toEqual(["best_e1rm"]);
  });

  it("detecta más reps con un peso ya levantado", () => {
    const r = evaluateSessionRecords(history, [set(80, 9)], bench);
    expect(r.newRecords).toContainEqual({
      kind: "most_reps_at_weight",
      value: 9,
      previous: 8,
      weightKg: 80,
    });
    expect(r.bests.repsAtWeightGrams[toGrams(80)]).toBe(9);
  });

  it("no reporta reps en un peso nuevo, pero lo guarda como base", () => {
    const r = evaluateSessionRecords(history, [set(70, 12)], bench);
    expect(kinds(r)).not.toContain("most_reps_at_weight");
    expect(r.bests.repsAtWeightGrams[toGrams(70)]).toBe(12);
  });

  it("detecta un mayor volumen de sesión", () => {
    const sets = [set(80, 8), set(80, 8), set(80, 8), set(80, 8)]; // 2560
    const r = evaluateSessionRecords(history, sets, bench);
    expect(r.newRecords).toContainEqual({
      kind: "best_session_volume",
      value: 2560,
      previous: 2000,
    });
  });

  it("empatar una marca no es récord", () => {
    const r = evaluateSessionRecords(history, [set(100, 1), set(80, 8)], bench);
    expect(r.newRecords).toEqual([]);
  });

  it("compara pesos en gramos, sin errores de coma flotante", () => {
    const r = evaluateSessionRecords(history, [set(0.1 + 0.2 + 79.7, 9)], bench); // 80,000…01
    expect(kinds(r)).toContain("most_reps_at_weight");
  });

  it("reporta un solo récord de reps por sesión: el del peso más alto", () => {
    const prev: ExerciseBests = { ...history, repsAtWeightGrams: { 60000: 10, 80000: 8 } };
    const r = evaluateSessionRecords(prev, [set(60, 12), set(80, 9)], bench);
    const reps = r.newRecords.filter((n) => n.kind === "most_reps_at_weight");
    expect(reps).toEqual([{ kind: "most_reps_at_weight", value: 9, previous: 8, weightKg: 80 }]);
    expect(r.bests.repsAtWeightGrams).toMatchObject({ 60000: 12, 80000: 9 });
  });
});

describe("series que no cuentan", () => {
  it.each([
    ["calentamiento", set(150, 1, { type: "warmup" })],
    ["no completada", set(150, 1, { completed: false })],
    ["sin peso", set(0, 5)],
    ["reps decimales", set(150, 1.5)],
  ])("ignora una serie de %s", (_name, s) => {
    const r = evaluateSessionRecords(history, [s], bench);
    expect(r.newRecords).toEqual([]);
    expect(r.bests).toEqual(history);
  });

  it.each([
    ["sin peso", set(0, 20)],
    ["con lastre", set(10, 12)],
  ])("no calcula récords en ejercicios de peso corporal (serie %s)", (_name, s) => {
    const pullUp: ExerciseTracking = { trackingType: "reps_only", laterality: "bilateral" };
    const r = evaluateSessionRecords(history, [s], pullUp);
    expect(r).toEqual({ bests: history, newRecords: [] });
  });

  it("con series de más de 12 reps no compara 1RM, pero sí peso y reps", () => {
    const r = evaluateSessionRecords(history, [set(80, 15)], bench);
    expect(r.bests.bestE1rmKg).toBe(120);
    expect(r.newRecords).toContainEqual({
      kind: "most_reps_at_weight",
      value: 15,
      previous: 8,
      weightKg: 80,
    });
  });

  it("es determinista: el orden de las series no cambia el resultado", () => {
    const sets = [set(80, 9), set(102.5, 1), set(95, 8)];
    const a = evaluateSessionRecords(history, sets, bench);
    const b = evaluateSessionRecords(history, [...sets].reverse(), bench);
    expect(kinds(a)).toEqual(kinds(b));
    expect(a.bests).toEqual(b.bests);
  });
});
