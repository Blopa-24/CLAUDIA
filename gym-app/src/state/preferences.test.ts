import { DEFAULT_PREFERENCES, sanitizePreferences, usePreferences } from "./preferences";

describe("sanitizePreferences", () => {
  it("conserva un acento válido", () => {
    expect(sanitizePreferences({ accent: "violet" })).toEqual({ accent: "violet" });
  });

  it.each([
    ["un acento desconocido", { accent: "orange" }],
    ["un tipo incorrecto", { accent: 3 }],
    ["un objeto vacío", {}],
    ["null", null],
    ["un texto", "blue"],
    ["undefined", undefined],
  ])("vuelve al acento de fábrica con %s", (_name, stored) => {
    expect(sanitizePreferences(stored)).toEqual(DEFAULT_PREFERENCES);
  });
});

describe("usePreferences", () => {
  it("parte con el acento azul y permite cambiarlo", () => {
    expect(usePreferences.getState().accent).toBe("blue");
    usePreferences.getState().setAccent("cyan");
    expect(usePreferences.getState().accent).toBe("cyan");
  });
});
