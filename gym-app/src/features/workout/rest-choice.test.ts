import { restForExercise } from "./rest-choice";

const prefs = { restSeconds: 90, restByExercise: { deadlift: 180 } };

describe("restForExercise", () => {
  it("lo elegido en este entrenamiento manda sobre todo", () => {
    expect(restForExercise("deadlift", 240, { deadlift: 60 }, prefs)).toBe(60);
  });

  it("luego el de la rutina", () => {
    expect(restForExercise("deadlift", 240, {}, prefs)).toBe(240);
  });

  it("luego el recordado para ese ejercicio, y al final el de siempre", () => {
    expect(restForExercise("deadlift", null, {}, prefs)).toBe(180);
    expect(restForExercise("plank", null, {}, prefs)).toBe(90);
  });

  it("lo elegido para otro ejercicio no influye", () => {
    expect(restForExercise("plank", null, { deadlift: 60 }, prefs)).toBe(90);
  });
});
