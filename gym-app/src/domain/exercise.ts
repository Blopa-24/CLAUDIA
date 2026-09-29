// Clasificación de ejercicios (skill gym-domain, "EXERCISE CLASSIFICATION") y búsqueda por nombre.

import type { Laterality, LoadCount, TrackingType } from "./types";

/** Músculo principal: es también el filtro de la biblioteca. */
export const MUSCLES = [
  "chest",
  "back",
  "lower_back",
  "traps",
  "shoulders",
  "biceps",
  "triceps",
  "forearms",
  "abs",
  "quads",
  "hamstrings",
  "glutes",
  "adductors",
  "abductors",
  "calves",
  "tibialis",
  "full_body",
] as const;
export type Muscle = (typeof MUSCLES)[number];

export const EQUIPMENT = [
  "barbell",
  "ez_bar",
  "trap_bar",
  "dumbbell",
  "machine",
  "cable",
  "smith_machine",
  "kettlebell",
  "landmine",
  "plate",
  "medicine_ball",
  "band",
  "suspension",
  "bodyweight",
  "other",
] as const;
export type Equipment = (typeof EQUIPMENT)[number];

export const MOVEMENT_PATTERNS = [
  "horizontal_push",
  "vertical_push",
  "horizontal_pull",
  "vertical_pull",
  "squat",
  "hinge",
  "lunge",
  "carry",
  "isolation",
  "core",
  "olympic",
  "plyometric",
  "cardio",
] as const;
export type MovementPattern = (typeof MOVEMENT_PATTERNS)[number];

export const TRACKING_TYPES = [
  "weight_reps",
  "reps_only",
  "duration",
  "distance",
] as const satisfies readonly TrackingType[];
export const LATERALITIES = ["bilateral", "unilateral"] as const satisfies readonly Laterality[];
export const LOAD_COUNTS = [1, 2] as const satisfies readonly LoadCount[];

/** Idiomas en que se guarda el nombre de un ejercicio. */
export type ExerciseLanguage = "es" | "en";

export interface Exercise {
  id: string;
  /** Solo los ejercicios incluidos en la app lo tienen; los personalizados, no. */
  slug: string | null;
  name: Record<ExerciseLanguage, string>;
  isCustom: boolean;
  primaryMuscle: Muscle;
  secondaryMuscles: Muscle[];
  equipment: Equipment;
  movementPattern: MovementPattern;
  laterality: Laterality;
  trackingType: TrackingType;
  /** Cargas que se mueven a la vez; se anota el peso de una (ver LoadCount). */
  loadCount: LoadCount;
  notes: string | null;
}

export const isMuscle = (value: unknown): value is Muscle => MUSCLES.includes(value as Muscle);

/** Minúsculas, sin tildes ni espacios repetidos: "Press  de BANCA" y "press de banca" son iguales. */
export function normalizeSearchText(text: string): string {
  return (
    text
      .normalize("NFD")
      // Marcas combinables (tildes, diéresis). Rango explícito: Hermes no garantiza \p{Diacritic}.
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim()
  );
}

export interface ExerciseFilter {
  query: string;
  muscle: Muscle | null;
}

/**
 * Un ejercicio coincide si su músculo principal es el filtrado y cada palabra buscada aparece en
 * su nombre en español o en inglés, en cualquier orden. Así "banca press" encuentra "Press de banca".
 */
export function matchesExerciseFilter(exercise: Exercise, filter: ExerciseFilter): boolean {
  if (filter.muscle !== null && exercise.primaryMuscle !== filter.muscle) return false;
  const words = normalizeSearchText(filter.query).split(" ").filter(Boolean);
  if (words.length === 0) return true;
  const names = [exercise.name.es, exercise.name.en].map(normalizeSearchText);
  return words.every((word) => names.some((name) => name.includes(word)));
}

/** Filtra y ordena alfabéticamente por el nombre en el idioma pedido. */
export function filterExercises(
  exercises: readonly Exercise[],
  filter: ExerciseFilter,
  language: ExerciseLanguage,
): Exercise[] {
  const collator = new Intl.Collator(language, { sensitivity: "base" });
  return exercises
    .filter((exercise) => matchesExerciseFilter(exercise, filter))
    .sort((a, b) => collator.compare(a.name[language], b.name[language]));
}
