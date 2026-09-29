import type { ExerciseTracking } from "@/domain/types";
import { KG_PER_LB } from "@/domain/units";

import {
  formatCountdown,
  formatElapsed,
  formatSet,
  formatVolume,
  formatWeight,
  weightNumber,
} from "./format";

const labels = { rir: "RIR", seconds: "s", meters: "m" };
const tracking = (trackingType: ExerciseTracking["trackingType"]): ExerciseTracking => ({
  trackingType,
  laterality: "bilateral",
  loadCount: 1,
});
const set = (over: Partial<Parameters<typeof formatSet>[0]> = {}) => ({
  weightKg: 80,
  reps: 8,
  rir: null,
  durationS: null,
  distanceM: null,
  ...over,
});

describe("formatos del entrenamiento", () => {
  it("peso con coma decimal en español y punto en inglés", () => {
    expect(formatWeight(82.5, "kg", "es")).toBe("82,5 kg");
    expect(formatWeight(82.5, "kg", "en")).toBe("82.5 kg");
    expect(weightNumber(80, "kg", "es")).toBe("80");
  });

  it("lo anotado en libras se ve exacto en libras", () => {
    expect(formatWeight(100 * KG_PER_LB, "lb", "es")).toBe("100 lb");
    expect(formatWeight(100, "lb", "en")).toBe("220.46 lb");
  });

  it("volumen sin decimales y con miles", () => {
    expect(formatVolume(8420.4, "kg", "en")).toBe("8,420 kg");
  });

  it("duración y cuenta regresiva", () => {
    expect(formatElapsed(38 * 60_000 + 12_000)).toBe("38:12");
    expect(formatElapsed(3_725_000)).toBe("1:02:05");
    expect(formatElapsed(-5)).toBe("00:00");
    expect(formatCountdown(1_200)).toBe("00:02");
    expect(formatCountdown(90_000)).toBe("01:30");
  });

  it("una serie en una línea según lo que registra el ejercicio", () => {
    expect(formatSet(set({ rir: 2 }), tracking("weight_reps"), "kg", "es", labels)).toBe(
      "80 kg × 8 · RIR 2",
    );
    expect(
      formatSet(set({ weightKg: null, reps: 12 }), tracking("reps_only"), "kg", "es", labels),
    ).toBe("× 12");
    expect(formatSet(set({ durationS: 60 }), tracking("duration"), "kg", "es", labels)).toBe(
      "60 s",
    );
    expect(
      formatSet(
        set({ distanceM: 5000, durationS: 1500 }),
        tracking("distance"),
        "kg",
        "es",
        labels,
      ),
    ).toBe("5000 m · 1500 s");
  });
});
