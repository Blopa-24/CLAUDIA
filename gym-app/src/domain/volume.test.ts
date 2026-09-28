import type { ExerciseTracking, SetPerformance } from "./types";
import { setVolume, totalVolume } from "./volume";

const barbell: ExerciseTracking = { trackingType: "weight_reps", laterality: "bilateral" };
const dumbbellRow: ExerciseTracking = { trackingType: "weight_reps", laterality: "unilateral" };
const pullUp: ExerciseTracking = { trackingType: "reps_only", laterality: "bilateral" };
const plank: ExerciseTracking = { trackingType: "duration", laterality: "bilateral" };
const run: ExerciseTracking = { trackingType: "distance", laterality: "bilateral" };

const set = (over: Partial<SetPerformance> = {}): SetPerformance => ({
  type: "working",
  weightKg: 80,
  reps: 8,
  completed: true,
  ...over,
});

describe("setVolume", () => {
  it("multiplica peso por reps", () => {
    expect(setVolume(set(), barbell)).toBe(640);
  });

  it("cuenta los dos lados en ejercicios unilaterales", () => {
    expect(setVolume(set({ weightKg: 30, reps: 10 }), dumbbellRow)).toBe(600);
  });

  it("acepta decimales sin redondear", () => {
    expect(setVolume(set({ weightKg: 22.5, reps: 3 }), barbell)).toBe(67.5);
  });

  it.each([
    ["peso corporal", pullUp],
    ["tiempo", plank],
    ["distancia", run],
  ])("no inventa volumen en kg para %s", (_name, exercise) => {
    expect(setVolume(set(), exercise)).toBeNull();
  });

  it("ignora series no completadas o incompletas", () => {
    expect(setVolume(set({ completed: false }), barbell)).toBeNull();
    expect(setVolume(set({ weightKg: null }), barbell)).toBeNull();
    expect(setVolume(set({ reps: null }), barbell)).toBeNull();
  });

  it("rechaza datos inválidos", () => {
    expect(setVolume(set({ weightKg: -10 }), barbell)).toBeNull();
    expect(setVolume(set({ reps: -1 }), barbell)).toBeNull();
    expect(setVolume(set({ weightKg: NaN }), barbell)).toBeNull();
  });

  it("da 0 con peso 0 o reps 0", () => {
    expect(setVolume(set({ weightKg: 0 }), barbell)).toBe(0);
    expect(setVolume(set({ reps: 0 }), barbell)).toBe(0);
  });
});

describe("totalVolume", () => {
  const sets = [
    set({ type: "warmup", weightKg: 40, reps: 10 }), // 400
    set({ weightKg: 80, reps: 8 }), // 640
    set({ weightKg: 80, reps: 7 }), // 560
    set({ type: "dropset", weightKg: 60, reps: 6 }), // 360
    set({ weightKg: 80, reps: 8, completed: false }), // 0
  ];

  it("suma las series completadas sin el calentamiento", () => {
    expect(totalVolume(sets, barbell)).toBe(1560);
  });

  it("incluye el calentamiento si se pide", () => {
    expect(totalVolume(sets, barbell, { includeWarmups: true })).toBe(1960);
  });

  it("da 0 si el ejercicio con peso no tiene series válidas", () => {
    expect(totalVolume([], barbell)).toBe(0);
  });

  it("da null para ejercicios sin volumen en kg", () => {
    expect(totalVolume(sets, pullUp)).toBeNull();
  });
});
