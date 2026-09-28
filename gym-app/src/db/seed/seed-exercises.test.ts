import { eq } from "drizzle-orm";

import { EQUIPMENT, MOVEMENT_PATTERNS, MUSCLES } from "@/domain/exercise";

import { findExerciseById, listExercises } from "../repositories/exercise-repository";
import { exercises } from "../schema";
import { createTestDatabase, type TestDatabase } from "../testing/test-database";

import { EXERCISE_CATALOG, systemExerciseId } from "./exercise-catalog";
import { seedExerciseCatalog } from "./seed-exercises";

const T0 = Date.UTC(2026, 8, 28);
const T1 = T0 + 60_000;

describe("catálogo de ejercicios", () => {
  it("tiene unos 60 ejercicios", () => {
    expect(EXERCISE_CATALOG.length).toBeGreaterThanOrEqual(55);
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
