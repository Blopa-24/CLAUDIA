import type { Exercise } from "@/domain/exercise";
import { KG_PER_LB } from "@/domain/units";
import type { WorkoutExercise, WorkoutSet } from "@/domain/workout";

import { draftFromSet, editableNumber, emptyDraft, nextDraft } from "./draft";

const set = (over: Partial<WorkoutSet> = {}): WorkoutSet => ({
  id: "s",
  position: 0,
  type: "working",
  weightKg: 80,
  enteredUnit: "kg",
  reps: 8,
  rir: 2,
  rpe: null,
  durationS: null,
  distanceM: null,
  completedAt: 0,
  ...over,
});

const entry = (sets: WorkoutSet[]): WorkoutExercise => ({
  id: "we",
  exercise: { id: "bench" } as Exercise,
  nameSnapshot: "Press",
  position: 0,
  completedAt: null,
  sets,
});

describe("borrador de la próxima serie", () => {
  it("escribe números sin separador de miles y con la coma del idioma", () => {
    expect(editableNumber(1234.5, "en")).toBe("1234.5");
    expect(editableNumber(82.5, "es")).toBe("82,5");
  });

  it("copia la última serie de hoy, tipo incluido", () => {
    const last = set({ weightKg: 82.5, reps: 6, rir: 1, type: "warmup" });
    expect(nextDraft(entry([set(), last]), [set({ weightKg: 70 })], "kg", "es")).toEqual({
      ...emptyDraft("kg"),
      type: "warmup",
      weight: "82,5",
      reps: "6",
      rir: "1",
    });
  });

  it("sin series hoy, parte de la primera serie de trabajo de la vez anterior", () => {
    const previous = [set({ type: "warmup", weightKg: 40 }), set({ weightKg: 80, reps: 8 })];
    expect(nextDraft(entry([]), previous, "kg", "es")).toEqual(
      expect.objectContaining({ type: "working", weight: "80", reps: "8" }),
    );
  });

  it("si nunca se hizo, queda vacía", () => {
    expect(nextDraft(entry([]), undefined, "lb", "es")).toEqual(emptyDraft("lb"));
  });

  it("muestra el peso en la unidad actual de la persona", () => {
    expect(draftFromSet(set({ weightKg: 100 * KG_PER_LB }), "lb", "en").weight).toBe("100");
    expect(draftFromSet(set({ weightKg: 100 }), "lb", "en").weight).toBe("220.46");
  });

  it("deja vacío lo que la serie no tiene", () => {
    expect(draftFromSet(set({ weightKg: null, rir: null }), "kg", "es")).toEqual(
      expect.objectContaining({ weight: "", rir: "" }),
    );
  });
});
