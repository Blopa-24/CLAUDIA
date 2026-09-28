import { eq } from "drizzle-orm";

import { exercises, type NewExerciseRow } from "../schema";
import { createTestDatabase, type TestDatabase } from "../testing/test-database";

import { findExerciseById, listExercises, toExercise } from "./exercise-repository";

const NOW = Date.UTC(2026, 8, 28);

function row(overrides: Partial<NewExerciseRow> = {}): NewExerciseRow {
  return {
    id: "custom-1",
    slug: null,
    nameEs: "Mi ejercicio",
    nameEn: "My exercise",
    isCustom: true,
    primaryMuscle: "chest",
    secondaryMuscles: ["triceps"],
    equipment: "cable",
    movementPattern: "isolation",
    laterality: "bilateral",
    trackingType: "weight_reps",
    notes: "Agarre neutro",
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  };
}

describe("exercise-repository", () => {
  let test: TestDatabase;
  beforeEach(async () => {
    test = await createTestDatabase();
  });
  afterEach(() => test.close());

  it("con la base vacía devuelve una lista vacía", async () => {
    expect(await listExercises(test.db)).toEqual([]);
  });

  it("devuelve el ejercicio con la forma del dominio", async () => {
    await test.db.insert(exercises).values(row()).run();
    expect(await listExercises(test.db)).toEqual([
      {
        id: "custom-1",
        slug: null,
        name: { es: "Mi ejercicio", en: "My exercise" },
        isCustom: true,
        primaryMuscle: "chest",
        secondaryMuscles: ["triceps"],
        equipment: "cable",
        movementPattern: "isolation",
        laterality: "bilateral",
        trackingType: "weight_reps",
        notes: "Agarre neutro",
      },
    ]);
  });

  it("la lista oculta los borrados, pero se pueden buscar por ID para el historial", async () => {
    await test.db
      .insert(exercises)
      .values([row(), row({ id: "custom-2", nameEs: "Otro", nameEn: "Other", deletedAt: NOW })])
      .run();

    expect((await listExercises(test.db)).map((e) => e.id)).toEqual(["custom-1"]);
    expect((await findExerciseById(test.db, "custom-2"))?.name.es).toBe("Otro");
  });

  it("devuelve null si el ID no existe", async () => {
    expect(await findExerciseById(test.db, "no-existe")).toBeNull();
  });

  it("descarta músculos secundarios desconocidos en vez de fallar", async () => {
    await test.db.insert(exercises).values(row()).run();
    test.raw
      .prepare("UPDATE exercises SET secondary_muscles = ? WHERE id = ?")
      .run('["triceps","neck"]', "custom-1");
    expect((await findExerciseById(test.db, "custom-1"))?.secondaryMuscles).toEqual(["triceps"]);
  });

  it("si los músculos secundarios no son una lista, quedan vacíos", async () => {
    await test.db.insert(exercises).values(row()).run();
    const stored = await test.db.select().from(exercises).where(eq(exercises.id, "custom-1")).get();
    if (!stored) throw new Error("falta la fila");
    expect(toExercise({ ...stored, secondaryMuscles: "chest" as never }).secondaryMuscles).toEqual(
      [],
    );
  });
});
