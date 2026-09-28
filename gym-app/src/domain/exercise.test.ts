import {
  type Exercise,
  filterExercises,
  isMuscle,
  matchesExerciseFilter,
  normalizeSearchText,
} from "./exercise";

function exercise(overrides: Partial<Exercise> & Pick<Exercise, "name">): Exercise {
  return {
    id: overrides.name.en,
    slug: null,
    isCustom: false,
    primaryMuscle: "chest",
    secondaryMuscles: [],
    equipment: "barbell",
    movementPattern: "horizontal_push",
    laterality: "bilateral",
    trackingType: "weight_reps",
    notes: null,
    ...overrides,
  };
}

const bench = exercise({ name: { es: "Press de banca", en: "Bench Press" } });
const curl = exercise({
  name: { es: "Curl de bíceps con mancuerna", en: "Dumbbell Biceps Curl" },
  primaryMuscle: "biceps",
  equipment: "dumbbell",
  movementPattern: "isolation",
});
const extension = exercise({
  name: { es: "Extensión de cuádriceps", en: "Leg Extension" },
  primaryMuscle: "quads",
});

describe("normalizeSearchText", () => {
  it("quita tildes, pasa a minúsculas y colapsa espacios", () => {
    expect(normalizeSearchText("  Extensión   de CUÁDRICEPS ")).toBe("extension de cuadriceps");
  });

  it("conserva la ñ como n para que se pueda escribir sin teclado español", () => {
    expect(normalizeSearchText("Año")).toBe("ano");
  });
});

describe("matchesExerciseFilter", () => {
  it("sin búsqueda ni músculo, todo coincide", () => {
    expect(matchesExerciseFilter(bench, { query: "", muscle: null })).toBe(true);
    expect(matchesExerciseFilter(bench, { query: "   ", muscle: null })).toBe(true);
  });

  it("busca en español y en inglés", () => {
    expect(matchesExerciseFilter(bench, { query: "banca", muscle: null })).toBe(true);
    expect(matchesExerciseFilter(bench, { query: "bench", muscle: null })).toBe(true);
  });

  it("ignora tildes y mayúsculas en lo que se escribe y en el nombre", () => {
    expect(matchesExerciseFilter(extension, { query: "CUADRICEPS", muscle: null })).toBe(true);
    expect(matchesExerciseFilter(curl, { query: "bíceps", muscle: null })).toBe(true);
  });

  it("acepta las palabras en cualquier orden y todas deben aparecer", () => {
    expect(matchesExerciseFilter(bench, { query: "banca press", muscle: null })).toBe(true);
    expect(matchesExerciseFilter(bench, { query: "press inclinado", muscle: null })).toBe(false);
  });

  it("filtra por músculo principal", () => {
    expect(matchesExerciseFilter(curl, { query: "", muscle: "biceps" })).toBe(true);
    expect(matchesExerciseFilter(bench, { query: "", muscle: "biceps" })).toBe(false);
  });

  it("combina búsqueda y músculo", () => {
    expect(matchesExerciseFilter(curl, { query: "curl", muscle: "chest" })).toBe(false);
    expect(matchesExerciseFilter(curl, { query: "curl", muscle: "biceps" })).toBe(true);
  });
});

describe("filterExercises", () => {
  const all = [extension, curl, bench];

  it("ordena alfabéticamente según el idioma pedido", () => {
    expect(filterExercises(all, { query: "", muscle: null }, "es").map((e) => e.name.es)).toEqual([
      "Curl de bíceps con mancuerna",
      "Extensión de cuádriceps",
      "Press de banca",
    ]);
    expect(filterExercises(all, { query: "", muscle: null }, "en").map((e) => e.name.en)).toEqual([
      "Bench Press",
      "Dumbbell Biceps Curl",
      "Leg Extension",
    ]);
  });

  it("devuelve una lista vacía si nada coincide, sin tocar la original", () => {
    expect(filterExercises(all, { query: "remo", muscle: null }, "es")).toEqual([]);
    expect(all).toEqual([extension, curl, bench]);
  });
});

describe("isMuscle", () => {
  it("reconoce solo los músculos del catálogo", () => {
    expect(isMuscle("chest")).toBe(true);
    expect(isMuscle("neck")).toBe(false);
    expect(isMuscle(null)).toBe(false);
  });
});
