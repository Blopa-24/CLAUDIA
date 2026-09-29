import type { WorkoutExercise } from "@/domain/workout";

import { currentExerciseId } from "./current-exercise";

const entry = (id: string, completedAt: number | null = null) =>
  ({ id, completedAt }) as WorkoutExercise;

describe("currentExerciseId", () => {
  it("sin elegir, es el primero sin terminar", () => {
    expect(currentExerciseId([entry("a", 1), entry("b"), entry("c")], null)).toBe("b");
  });

  it("respeta el elegido si sigue sin terminar", () => {
    expect(currentExerciseId([entry("a"), entry("b"), entry("c")], "c")).toBe("c");
  });

  it("si el elegido ya se terminó, pasa al primero sin terminar", () => {
    expect(currentExerciseId([entry("a"), entry("b", 1)], "b")).toBe("a");
  });

  it("si todos están terminados, no hay ejercicio en curso", () => {
    expect(currentExerciseId([entry("a", 1)], null)).toBeNull();
    expect(currentExerciseId([], "x")).toBeNull();
  });
});
