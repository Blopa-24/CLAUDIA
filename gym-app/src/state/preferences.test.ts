import {
  DEFAULT_PREFERENCES,
  preferencesHydrated,
  restSecondsFor,
  sanitizePreferences,
  usePreferences,
} from "./preferences";

describe("sanitizePreferences", () => {
  it("conserva valores válidos", () => {
    expect(sanitizePreferences({ accent: "violet", weightUnit: "lb" })).toEqual({
      ...DEFAULT_PREFERENCES,
      accent: "violet",
      weightUnit: "lb",
    });
  });

  it("a quien guardó solo el acento (versión anterior) le da kg y conserva su acento", () => {
    expect(sanitizePreferences({ accent: "pink" })).toEqual({
      ...DEFAULT_PREFERENCES,
      accent: "pink",
      weightUnit: "kg",
    });
  });

  it("repara cada valor por separado", () => {
    expect(sanitizePreferences({ accent: "orange", weightUnit: "lb" })).toEqual({
      ...DEFAULT_PREFERENCES,
      accent: "blue",
      weightUnit: "lb",
    });
    expect(sanitizePreferences({ accent: "cyan", weightUnit: "stone" })).toEqual({
      ...DEFAULT_PREFERENCES,
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

describe("preferencias de descanso", () => {
  it("parte en 90 s y empezando solo", () => {
    expect(DEFAULT_PREFERENCES.restSeconds).toBe(90);
    expect(DEFAULT_PREFERENCES.restAutoStart).toBe(true);
    expect(DEFAULT_PREFERENCES.restByExercise).toEqual({});
  });

  it("conserva lo guardado y descarta valores dañados", () => {
    expect(
      sanitizePreferences({
        restSeconds: 120,
        restAutoStart: false,
        restByExercise: { "system:deadlift": 180, roto: -5, texto: "90", enorme: 99_999 },
      }),
    ).toEqual(
      expect.objectContaining({
        restSeconds: 120,
        restAutoStart: false,
        restByExercise: { "system:deadlift": 180 },
      }),
    );
    expect(
      sanitizePreferences({ restSeconds: 12.5, restAutoStart: "sí", restByExercise: [] }),
    ).toEqual(
      expect.objectContaining({ restSeconds: 90, restAutoStart: true, restByExercise: {} }),
    );
  });

  it("el descanso de un ejercicio es el último elegido para él, o el de siempre", () => {
    const prefs = { restSeconds: 90, restByExercise: { "system:deadlift": 180 } };
    expect(restSecondsFor(prefs, "system:deadlift")).toBe(180);
    expect(restSecondsFor(prefs, "system:plank")).toBe(90);
  });

  it("guarda el descanso de siempre y el de cada ejercicio, ignorando valores inválidos", () => {
    const store = usePreferences.getState();
    store.setRestSeconds(120);
    store.setRestSeconds(-1);
    store.setExerciseRest("system:deadlift", 180);
    store.setExerciseRest("system:deadlift", 1.5);
    store.setRestAutoStart(false);
    const state = usePreferences.getState();
    expect(state.restSeconds).toBe(120);
    expect(state.restByExercise).toEqual({ "system:deadlift": 180 });
    expect(state.restAutoStart).toBe(false);
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
