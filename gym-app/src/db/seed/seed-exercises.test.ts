import { eq } from "drizzle-orm";

import { EQUIPMENT, MOVEMENT_PATTERNS, MUSCLES } from "@/domain/exercise";

import { findExerciseById, listExercises } from "../repositories/exercise-repository";
import { exercises } from "../schema";
import { createTestDatabase, type TestDatabase } from "../testing/test-database";

import { EXERCISE_CATALOG, systemExerciseId } from "./exercise-catalog";
import { seedExerciseCatalog } from "./seed-exercises";

const T0 = Date.UTC(2026, 8, 28);
const T1 = T0 + 60_000;

// Slugs ya publicados (versión de M2): los entrenamientos guardados los usan, nunca se quitan.
// prettier-ignore
const PUBLISHED_SLUGS = ["barbell-bench-press", "incline-barbell-bench-press", "dumbbell-bench-press", "incline-dumbbell-press", "machine-chest-press", "dumbbell-fly", "cable-crossover", "push-up", "deadlift", "pull-up", "chin-up", "lat-pulldown", "barbell-row", "one-arm-dumbbell-row", "seated-cable-row", "t-bar-row", "back-extension", "overhead-press", "seated-dumbbell-shoulder-press", "arnold-press", "dumbbell-lateral-raise", "cable-lateral-raise", "reverse-dumbbell-fly", "face-pull", "barbell-curl", "dumbbell-curl", "hammer-curl", "incline-dumbbell-curl", "preacher-curl", "cable-curl", "triceps-pushdown", "overhead-triceps-extension", "skull-crusher", "close-grip-bench-press", "parallel-bar-dip", "wrist-curl", "reverse-wrist-curl", "back-squat", "front-squat", "goblet-squat", "hack-squat", "leg-press", "leg-extension", "bulgarian-split-squat", "walking-lunge", "romanian-deadlift", "lying-leg-curl", "seated-leg-curl", "nordic-curl", "barbell-hip-thrust", "glute-bridge", "cable-glute-kickback", "machine-hip-abduction", "standing-calf-raise", "seated-calf-raise", "plank", "crunch", "hanging-leg-raise", "cable-crunch", "ab-wheel-rollout", "kettlebell-swing", "rowing-machine", "treadmill-run", "stationary-bike"];

describe("catálogo de ejercicios", () => {
  it("tiene más de 200 ejercicios", () => {
    expect(EXERCISE_CATALOG.length).toBeGreaterThan(200);
  });

  it("conserva todos los slugs ya publicados", () => {
    const slugs = new Set(EXERCISE_CATALOG.map((e) => e.slug));
    for (const slug of PUBLISHED_SLUGS) expect(slugs).toContain(slug);
  });

  it("solo marca dos cargas en ejercicios con peso de mancuernas, kettlebells o poleas", () => {
    for (const entry of EXERCISE_CATALOG.filter((e) => e.load === 2)) {
      expect(["dumbbell", "kettlebell", "cable"]).toContain(entry.equipment);
      expect(entry.tracking ?? "weight_reps").toBe("weight_reps");
    }
  });

  it("marca con dos cargas los presses y curls con dos mancuernas", () => {
    const loadOf = (slug: string) => EXERCISE_CATALOG.find((e) => e.slug === slug)?.load ?? 1;
    expect(loadOf("dumbbell-bench-press")).toBe(2);
    expect(loadOf("dumbbell-curl")).toBe(2);
    expect(loadOf("one-arm-dumbbell-row")).toBe(1);
    expect(loadOf("goblet-squat")).toBe(1);
  });

  it("no repite slugs ni nombres en ningún idioma", () => {
    const unique = (values: string[]) => new Set(values).size === values.length;
    expect(unique(EXERCISE_CATALOG.map((e) => e.slug))).toBe(true);
    expect(unique(EXERCISE_CATALOG.map((e) => e.es.toLowerCase()))).toBe(true);
    expect(unique(EXERCISE_CATALOG.map((e) => e.en.toLowerCase()))).toBe(true);
  });

  it("usa slugs en minúsculas con guiones", () => {
    for (const { slug } of EXERCISE_CATALOG) expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it("no pone el músculo principal también como secundario", () => {
    for (const entry of EXERCISE_CATALOG) {
      expect(entry.secondary ?? []).not.toContain(entry.muscle);
    }
  });

  it("cubre cada músculo del filtro con al menos un ejercicio", () => {
    const covered = new Set(EXERCISE_CATALOG.map((e) => e.muscle));
    for (const muscle of MUSCLES) expect(covered).toContain(muscle);
  });

  it("solo usa equipamiento y patrones conocidos", () => {
    for (const entry of EXERCISE_CATALOG) {
      expect(EQUIPMENT).toContain(entry.equipment);
      expect(MOVEMENT_PATTERNS).toContain(entry.pattern);
    }
  });
});

describe("seedExerciseCatalog", () => {
  let test: TestDatabase;
  beforeEach(async () => {
    test = await createTestDatabase();
  });
  afterEach(() => test.close());

  it("carga todo el catálogo como ejercicios incluidos, no personalizados", async () => {
    await seedExerciseCatalog(test.db, T0);
    const all = await listExercises(test.db);
    expect(all).toHaveLength(EXERCISE_CATALOG.length);
    expect(all.every((e) => !e.isCustom && e.slug !== null)).toBe(true);
  });

  it("guarda cada ejercicio con su ID estable y sus datos", async () => {
    await seedExerciseCatalog(test.db, T0);
    expect(await findExerciseById(test.db, systemExerciseId("one-arm-dumbbell-row"))).toEqual({
      id: "system:one-arm-dumbbell-row",
      slug: "one-arm-dumbbell-row",
      name: { es: "Remo con mancuerna a una mano", en: "One-Arm Dumbbell Row" },
      isCustom: false,
      primaryMuscle: "back",
      secondaryMuscles: ["biceps"],
      equipment: "dumbbell",
      movementPattern: "horizontal_pull",
      laterality: "unilateral",
      trackingType: "weight_reps",
      loadCount: 1,
      notes: null,
    });
  });

  it("se puede correr en cada arranque sin duplicar ni tocar filas al día", async () => {
    await seedExerciseCatalog(test.db, T0);
    await seedExerciseCatalog(test.db, T1);
    expect(await listExercises(test.db)).toHaveLength(EXERCISE_CATALOG.length);
    const updated = test.raw
      .prepare("SELECT COUNT(*) AS n FROM exercises WHERE updated_at <> ?")
      .get(T0) as { n: number };
    expect(updated.n).toBe(0);
  });

  it("corrige una fila que quedó distinta del catálogo y marca cuándo", async () => {
    await seedExerciseCatalog(test.db, T0);
    const id = systemExerciseId("barbell-bench-press");
    await test.db
      .update(exercises)
      .set({ nameEs: "Nombre antiguo" })
      .where(eq(exercises.id, id))
      .run();

    await seedExerciseCatalog(test.db, T1);

    const row = await test.db.select().from(exercises).where(eq(exercises.id, id)).get();
    expect(row?.nameEs).toBe("Press de banca");
    expect(row?.updatedAt).toBe(T1);
    expect(row?.createdAt).toBe(T0);
  });

  it("no revive un ejercicio que la persona ocultó", async () => {
    await seedExerciseCatalog(test.db, T0);
    const id = systemExerciseId("crunch");
    await test.db.update(exercises).set({ deletedAt: T0 }).where(eq(exercises.id, id)).run();

    await seedExerciseCatalog(test.db, T1);

    expect((await listExercises(test.db)).map((e) => e.id)).not.toContain(id);
  });
});
