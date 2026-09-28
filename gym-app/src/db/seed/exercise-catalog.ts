// Biblioteca inicial de ejercicios incluidos en GymSuper (CLAUDE.md, sección 19: datos de ejemplo
// identificables). Se distinguen de los de la persona porque tienen `slug` e `is_custom = false`.
//
// El `slug` es permanente: su ID en la base es `system:<slug>` y los entrenamientos guardados lo
// referencian. Se puede corregir un nombre o un músculo; nunca renombrar ni quitar un slug.
//
// Lateralidad: "unilateral" solo cuando se trabaja un lado a la vez y las reps se anotan por lado.
// Cómo anotar el peso de dos mancuernas a la vez queda por decidir en M3 (docs/ROADMAP.md).

import type { Equipment, Exercise, Muscle, MovementPattern } from "@/domain/exercise";
import type { Laterality, TrackingType } from "@/domain/types";

export interface CatalogExercise {
  slug: string;
  es: string;
  en: string;
  muscle: Muscle;
  secondary?: Muscle[];
  equipment: Equipment;
  pattern: MovementPattern;
  laterality?: Laterality;
  tracking?: TrackingType;
}

// Una fila por ejercicio se lee mejor como tabla.
// prettier-ignore
export const EXERCISE_CATALOG: readonly CatalogExercise[] = [
  // Pecho
  { slug: "barbell-bench-press", es: "Press de banca", en: "Bench Press", muscle: "chest", secondary: ["triceps", "shoulders"], equipment: "barbell", pattern: "horizontal_push" },
  { slug: "incline-barbell-bench-press", es: "Press inclinado con barra", en: "Incline Bench Press", muscle: "chest", secondary: ["shoulders", "triceps"], equipment: "barbell", pattern: "horizontal_push" },
  { slug: "dumbbell-bench-press", es: "Press de banca con mancuernas", en: "Dumbbell Bench Press", muscle: "chest", secondary: ["triceps", "shoulders"], equipment: "dumbbell", pattern: "horizontal_push" },
  { slug: "incline-dumbbell-press", es: "Press inclinado con mancuernas", en: "Incline Dumbbell Press", muscle: "chest", secondary: ["shoulders", "triceps"], equipment: "dumbbell", pattern: "horizontal_push" },
  { slug: "machine-chest-press", es: "Press de pecho en máquina", en: "Machine Chest Press", muscle: "chest", secondary: ["triceps"], equipment: "machine", pattern: "horizontal_push" },
  { slug: "dumbbell-fly", es: "Aperturas con mancuernas", en: "Dumbbell Fly", muscle: "chest", equipment: "dumbbell", pattern: "isolation" },
  { slug: "cable-crossover", es: "Cruce de poleas", en: "Cable Crossover", muscle: "chest", equipment: "cable", pattern: "isolation" },
  { slug: "push-up", es: "Flexiones de brazos", en: "Push-Up", muscle: "chest", secondary: ["triceps", "shoulders"], equipment: "bodyweight", pattern: "horizontal_push", tracking: "reps_only" },

  // Espalda
  { slug: "deadlift", es: "Peso muerto", en: "Deadlift", muscle: "back", secondary: ["glutes", "hamstrings", "forearms"], equipment: "barbell", pattern: "hinge" },
  { slug: "pull-up", es: "Dominadas", en: "Pull-Up", muscle: "back", secondary: ["biceps"], equipment: "bodyweight", pattern: "vertical_pull", tracking: "reps_only" },
  { slug: "chin-up", es: "Dominadas supinas", en: "Chin-Up", muscle: "back", secondary: ["biceps"], equipment: "bodyweight", pattern: "vertical_pull", tracking: "reps_only" },
  { slug: "lat-pulldown", es: "Jalón al pecho", en: "Lat Pulldown", muscle: "back", secondary: ["biceps"], equipment: "cable", pattern: "vertical_pull" },
  { slug: "barbell-row", es: "Remo con barra", en: "Barbell Row", muscle: "back", secondary: ["biceps"], equipment: "barbell", pattern: "horizontal_pull" },
  { slug: "one-arm-dumbbell-row", es: "Remo con mancuerna a una mano", en: "One-Arm Dumbbell Row", muscle: "back", secondary: ["biceps"], equipment: "dumbbell", pattern: "horizontal_pull", laterality: "unilateral" },
  { slug: "seated-cable-row", es: "Remo sentado en polea", en: "Seated Cable Row", muscle: "back", secondary: ["biceps"], equipment: "cable", pattern: "horizontal_pull" },
  { slug: "t-bar-row", es: "Remo en barra T", en: "T-Bar Row", muscle: "back", secondary: ["biceps"], equipment: "barbell", pattern: "horizontal_pull" },
  { slug: "back-extension", es: "Hiperextensiones", en: "Back Extension", muscle: "back", secondary: ["glutes", "hamstrings"], equipment: "bodyweight", pattern: "hinge", tracking: "reps_only" },

  // Hombros
  { slug: "overhead-press", es: "Press militar", en: "Overhead Press", muscle: "shoulders", secondary: ["triceps"], equipment: "barbell", pattern: "vertical_push" },
  { slug: "seated-dumbbell-shoulder-press", es: "Press de hombros con mancuernas", en: "Seated Dumbbell Shoulder Press", muscle: "shoulders", secondary: ["triceps"], equipment: "dumbbell", pattern: "vertical_push" },
  { slug: "arnold-press", es: "Press Arnold", en: "Arnold Press", muscle: "shoulders", secondary: ["triceps"], equipment: "dumbbell", pattern: "vertical_push" },
  { slug: "dumbbell-lateral-raise", es: "Elevaciones laterales con mancuernas", en: "Dumbbell Lateral Raise", muscle: "shoulders", equipment: "dumbbell", pattern: "isolation" },
  { slug: "cable-lateral-raise", es: "Elevación lateral en polea", en: "Cable Lateral Raise", muscle: "shoulders", equipment: "cable", pattern: "isolation", laterality: "unilateral" },
  { slug: "reverse-dumbbell-fly", es: "Vuelos posteriores con mancuernas", en: "Reverse Dumbbell Fly", muscle: "shoulders", secondary: ["back"], equipment: "dumbbell", pattern: "isolation" },
  { slug: "face-pull", es: "Face pull en polea", en: "Face Pull", muscle: "shoulders", secondary: ["back"], equipment: "cable", pattern: "horizontal_pull" },

  // Bíceps
  { slug: "barbell-curl", es: "Curl con barra", en: "Barbell Curl", muscle: "biceps", secondary: ["forearms"], equipment: "barbell", pattern: "isolation" },
  { slug: "dumbbell-curl", es: "Curl con mancuernas", en: "Dumbbell Curl", muscle: "biceps", secondary: ["forearms"], equipment: "dumbbell", pattern: "isolation" },
  { slug: "hammer-curl", es: "Curl martillo", en: "Hammer Curl", muscle: "biceps", secondary: ["forearms"], equipment: "dumbbell", pattern: "isolation" },
  { slug: "incline-dumbbell-curl", es: "Curl inclinado con mancuernas", en: "Incline Dumbbell Curl", muscle: "biceps", equipment: "dumbbell", pattern: "isolation" },
  { slug: "preacher-curl", es: "Curl predicador", en: "Preacher Curl", muscle: "biceps", equipment: "barbell", pattern: "isolation" },
  { slug: "cable-curl", es: "Curl en polea", en: "Cable Curl", muscle: "biceps", equipment: "cable", pattern: "isolation" },

  // Tríceps
  { slug: "triceps-pushdown", es: "Extensión de tríceps en polea", en: "Triceps Pushdown", muscle: "triceps", equipment: "cable", pattern: "isolation" },
  { slug: "overhead-triceps-extension", es: "Extensión de tríceps sobre la cabeza", en: "Overhead Triceps Extension", muscle: "triceps", equipment: "dumbbell", pattern: "isolation" },
  { slug: "skull-crusher", es: "Press francés", en: "Skull Crusher", muscle: "triceps", equipment: "barbell", pattern: "isolation" },
  { slug: "close-grip-bench-press", es: "Press de banca agarre cerrado", en: "Close-Grip Bench Press", muscle: "triceps", secondary: ["chest", "shoulders"], equipment: "barbell", pattern: "horizontal_push" },
  { slug: "parallel-bar-dip", es: "Fondos en paralelas", en: "Parallel Bar Dip", muscle: "triceps", secondary: ["chest", "shoulders"], equipment: "bodyweight", pattern: "vertical_push", tracking: "reps_only" },

  // Antebrazos
  { slug: "wrist-curl", es: "Curl de muñeca", en: "Wrist Curl", muscle: "forearms", equipment: "dumbbell", pattern: "isolation" },
  { slug: "reverse-wrist-curl", es: "Curl de muñeca invertido", en: "Reverse Wrist Curl", muscle: "forearms", equipment: "dumbbell", pattern: "isolation" },

  // Cuádriceps
  { slug: "back-squat", es: "Sentadilla con barra", en: "Back Squat", muscle: "quads", secondary: ["glutes", "hamstrings"], equipment: "barbell", pattern: "squat" },
  { slug: "front-squat", es: "Sentadilla frontal", en: "Front Squat", muscle: "quads", secondary: ["glutes", "abs"], equipment: "barbell", pattern: "squat" },
  { slug: "goblet-squat", es: "Sentadilla goblet", en: "Goblet Squat", muscle: "quads", secondary: ["glutes"], equipment: "kettlebell", pattern: "squat" },
  { slug: "hack-squat", es: "Sentadilla hack", en: "Hack Squat", muscle: "quads", secondary: ["glutes"], equipment: "machine", pattern: "squat" },
  { slug: "leg-press", es: "Prensa de piernas", en: "Leg Press", muscle: "quads", secondary: ["glutes", "hamstrings"], equipment: "machine", pattern: "squat" },
  { slug: "leg-extension", es: "Extensión de cuádriceps", en: "Leg Extension", muscle: "quads", equipment: "machine", pattern: "isolation" },
  { slug: "bulgarian-split-squat", es: "Sentadilla búlgara", en: "Bulgarian Split Squat", muscle: "quads", secondary: ["glutes"], equipment: "dumbbell", pattern: "lunge", laterality: "unilateral" },
  { slug: "walking-lunge", es: "Zancadas caminando", en: "Walking Lunge", muscle: "quads", secondary: ["glutes"], equipment: "dumbbell", pattern: "lunge", laterality: "unilateral" },

  // Isquiotibiales
  { slug: "romanian-deadlift", es: "Peso muerto rumano", en: "Romanian Deadlift", muscle: "hamstrings", secondary: ["glutes", "back"], equipment: "barbell", pattern: "hinge" },
  { slug: "lying-leg-curl", es: "Curl femoral tumbado", en: "Lying Leg Curl", muscle: "hamstrings", equipment: "machine", pattern: "isolation" },
  { slug: "seated-leg-curl", es: "Curl femoral sentado", en: "Seated Leg Curl", muscle: "hamstrings", equipment: "machine", pattern: "isolation" },
  { slug: "nordic-curl", es: "Curl nórdico", en: "Nordic Curl", muscle: "hamstrings", equipment: "bodyweight", pattern: "isolation", tracking: "reps_only" },

  // Glúteos
  { slug: "barbell-hip-thrust", es: "Hip thrust con barra", en: "Barbell Hip Thrust", muscle: "glutes", secondary: ["hamstrings"], equipment: "barbell", pattern: "hinge" },
  { slug: "glute-bridge", es: "Puente de glúteos", en: "Glute Bridge", muscle: "glutes", secondary: ["hamstrings"], equipment: "bodyweight", pattern: "hinge", tracking: "reps_only" },
  { slug: "cable-glute-kickback", es: "Patada de glúteo en polea", en: "Cable Glute Kickback", muscle: "glutes", equipment: "cable", pattern: "isolation", laterality: "unilateral" },
  { slug: "machine-hip-abduction", es: "Abducción de cadera en máquina", en: "Machine Hip Abduction", muscle: "glutes", equipment: "machine", pattern: "isolation" },

  // Pantorrillas
  { slug: "standing-calf-raise", es: "Elevación de talones de pie", en: "Standing Calf Raise", muscle: "calves", equipment: "machine", pattern: "isolation" },
  { slug: "seated-calf-raise", es: "Elevación de talones sentado", en: "Seated Calf Raise", muscle: "calves", equipment: "machine", pattern: "isolation" },

  // Abdomen
  { slug: "plank", es: "Plancha", en: "Plank", muscle: "abs", equipment: "bodyweight", pattern: "core", tracking: "duration" },
  { slug: "crunch", es: "Abdominales crunch", en: "Crunch", muscle: "abs", equipment: "bodyweight", pattern: "core", tracking: "reps_only" },
  { slug: "hanging-leg-raise", es: "Elevación de piernas colgado", en: "Hanging Leg Raise", muscle: "abs", equipment: "bodyweight", pattern: "core", tracking: "reps_only" },
  { slug: "cable-crunch", es: "Crunch en polea", en: "Cable Crunch", muscle: "abs", equipment: "cable", pattern: "core" },
  { slug: "ab-wheel-rollout", es: "Rueda abdominal", en: "Ab Wheel Rollout", muscle: "abs", equipment: "other", pattern: "core", tracking: "reps_only" },

  // Cuerpo completo y cardio
  { slug: "kettlebell-swing", es: "Swing con kettlebell", en: "Kettlebell Swing", muscle: "full_body", secondary: ["glutes", "hamstrings"], equipment: "kettlebell", pattern: "hinge" },
  { slug: "rowing-machine", es: "Remo ergómetro", en: "Rowing Machine", muscle: "full_body", equipment: "machine", pattern: "cardio", tracking: "distance" },
  { slug: "treadmill-run", es: "Correr en cinta", en: "Treadmill Run", muscle: "full_body", equipment: "machine", pattern: "cardio", tracking: "distance" },
  { slug: "stationary-bike", es: "Bicicleta estática", en: "Stationary Bike", muscle: "full_body", equipment: "machine", pattern: "cardio", tracking: "duration" },
];

export const systemExerciseId = (slug: string): string => `system:${slug}`;

/** El ejercicio del catálogo tal como lo ve el dominio. */
export function catalogToExercise(entry: CatalogExercise): Exercise {
  return {
    id: systemExerciseId(entry.slug),
    slug: entry.slug,
    name: { es: entry.es, en: entry.en },
    isCustom: false,
    primaryMuscle: entry.muscle,
    secondaryMuscles: entry.secondary ?? [],
    equipment: entry.equipment,
    movementPattern: entry.pattern,
    laterality: entry.laterality ?? "bilateral",
    trackingType: entry.tracking ?? "weight_reps",
    notes: null,
  };
}
