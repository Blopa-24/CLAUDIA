import {
  DEFAULT_PREFERENCES,
  preferencesHydrated,
  sanitizePreferences,
  usePreferences,
} from "./preferences";

describe("sanitizePreferences", () => {
  it("conserva valores válidos", () => {
    expect(sanitizePreferences({ accent: "violet", weightUnit: "lb" })).toEqual({
      accent: "violet",
      weightUnit: "lb",
    });
  });

  it("a quien guardó solo el acento (versión anterior) le da kg y conserva su acento", () => {
    expect(sanitizePreferences({ accent: "pink" })).toEqual({ accent: "pink", weightUnit: "kg" });
  });

  it("repara cada valor por separado", () => {
    expect(sanitizePreferences({ accent: "orange", weightUnit: "lb" })).toEqual({
      accent: "blue",
      weightUnit: "lb",
    });
    expect(sanitizePreferences({ accent: "cyan", weightUnit: "stone" })).toEqual({
      accent: "cyan",
      weightUnit: "kg",
    });
  });

  it.each([
    ["valores desconocidos", { accent: "orange", weightUnit: "stone" }],
    ["tipos incorrectos", { accent: 3, weightUnit: true }],
    ["un objeto vacío", {}],
    ["null", null],
    ["un texto", "blue"],
    ["undefined", undefined],
  ])("vuelve a lo de fábrica con %s", (_name, stored) => {
    expect(sanitizePreferences(stored)).toEqual(DEFAULT_PREFERENCES);
  });
});

describe("usePreferences", () => {
  it("parte con el acento azul y permite cambiarlo", () => {
    expect(usePreferences.getState().accent).toBe("blue");
    usePreferences.getState().setAccent("cyan");
    expect(usePreferences.getState().accent).toBe("cyan");
  });

  it("parte en kilogramos y permite cambiar a libras", () => {
    expect(usePreferences.getState().weightUnit).toBe("kg");
    usePreferences.getState().setWeightUnit("lb");
    expect(usePreferences.getState().weightUnit).toBe("lb");
  });
});

describe("preferencesHydrated", () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it("se resuelve de inmediato si ya se leyeron", async () => {
    jest.spyOn(usePreferences.persist, "hasHydrated").mockReturnValue(true);
    await expect(preferencesHydrated()).resolves.toBeUndefined();
  });

  it("espera a que terminen de leerse y deja de escuchar", async () => {
    jest.spyOn(usePreferences.persist, "hasHydrated").mockReturnValue(false);
    const unsubscribe = jest.fn();
    let finish: () => void = () => undefined;
    jest.spyOn(usePreferences.persist, "onFinishHydration").mockImplementation((listener) => {
      finish = () => listener(usePreferences.getState());
      return unsubscribe;
    });

    const waiting = preferencesHydrated();
    finish();
    await expect(waiting).resolves.toBeUndefined();
    expect(unsubscribe).toHaveBeenCalled();
  });

  it("si la lectura nunca avisa, sigue igual al agotar el tiempo", async () => {
    jest.useFakeTimers();
    jest.spyOn(usePreferences.persist, "hasHydrated").mockReturnValue(false);
    jest.spyOn(usePreferences.persist, "onFinishHydration").mockReturnValue(() => undefined);

    const waiting = preferencesHydrated(3000);
    jest.advanceTimersByTime(3000);
    await expect(waiting).resolves.toBeUndefined();
  });
});
