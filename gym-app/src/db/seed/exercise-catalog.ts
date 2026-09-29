// Biblioteca de ejercicios incluidos en GymSuper (CLAUDE.md, sección 19: datos de ejemplo
// identificables). Se distinguen de los de la persona porque tienen `slug` e `is_custom = false`.
//
// El `slug` es permanente: su ID en la base es `system:<slug>` y los entrenamientos guardados lo
// referencian. Se puede corregir un nombre o un músculo; nunca renombrar ni quitar un slug.
//
// Fuentes para elegir los ejercicios: el directorio de StrengthLog y la biblioteca de Hevy (lo que
// traen las apps de registro), más variantes que se volvieron comunes en los últimos años (curl
// bayesiano, sentadilla péndulo, remo foca, encogimiento Kelso, nórdico inverso, elevación de
// tibiales, hip thrust en máquina…).
//
// Convenciones:
// - Lateralidad "unilateral": se trabaja un lado a la vez y las reps se anotan por lado.
// - `load: 2`: se mueven dos cargas iguales (dos mancuernas, dos poleas) y se anota el peso de UNA.
// - Quedan fuera los ejercicios que necesitan un tipo de registro que aún no existe: peso con
//   distancia (paseo del granjero, trineo), peso con tiempo (plancha con peso) y asistidos
//   (dominadas en máquina de asistencia, donde más peso significa menos esfuerzo).

import type { Equipment, Exercise, Muscle, MovementPattern } from "@/domain/exercise";
import type { Laterality, LoadCount, TrackingType } from "@/domain/types";

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
  load?: LoadCount;
}

// Una fila por ejercicio se lee mejor como tabla.
// prettier-ignore
export const EXERCISE_CATALOG: readonly CatalogExercise[] = [
  // Pecho
  { slug: "barbell-bench-press", es: "Press de banca", en: "Bench Press", muscle: "chest", secondary: ["triceps", "shoulders"], equipment: "barbell", pattern: "horizontal_push" },
  { slug: "incline-barbell-bench-press", es: "Press inclinado con barra", en: "Incline Bench Press", muscle: "chest", secondary: ["shoulders", "triceps"], equipment: "barbell", pattern: "horizontal_push" },
  { slug: "decline-bench-press", es: "Press declinado con barra", en: "Decline Bench Press", muscle: "chest", secondary: ["triceps"], equipment: "barbell", pattern: "horizontal_push" },
  { slug: "dumbbell-bench-press", es: "Press de banca con mancuernas", en: "Dumbbell Bench Press", muscle: "chest", secondary: ["triceps", "shoulders"], equipment: "dumbbell", pattern: "horizontal_push", load: 2 },
  { slug: "incline-dumbbell-press", es: "Press inclinado con mancuernas", en: "Incline Dumbbell Press", muscle: "chest", secondary: ["shoulders", "triceps"], equipment: "dumbbell", pattern: "horizontal_push", load: 2 },
  { slug: "decline-dumbbell-press", es: "Press declinado con mancuernas", en: "Decline Dumbbell Press", muscle: "chest", secondary: ["triceps"], equipment: "dumbbell", pattern: "horizontal_push", load: 2 },
  { slug: "dumbbell-floor-press", es: "Press en el suelo con mancuernas", en: "Dumbbell Floor Press", muscle: "chest", secondary: ["triceps"], equipment: "dumbbell", pattern: "horizontal_push", load: 2 },
  { slug: "smith-machine-bench-press", es: "Press de banca en máquina Smith", en: "Smith Machine Bench Press", muscle: "chest", secondary: ["triceps", "shoulders"], equipment: "smith_machine", pattern: "horizontal_push" },
  { slug: "smith-machine-incline-press", es: "Press inclinado en máquina Smith", en: "Smith Machine Incline Press", muscle: "chest", secondary: ["shoulders", "triceps"], equipment: "smith_machine", pattern: "horizontal_push" },
  { slug: "machine-chest-press", es: "Press de pecho en máquina", en: "Machine Chest Press", muscle: "chest", secondary: ["triceps"], equipment: "machine", pattern: "horizontal_push" },
  { slug: "incline-machine-chest-press", es: "Press inclinado en máquina", en: "Incline Machine Chest Press", muscle: "chest", secondary: ["shoulders", "triceps"], equipment: "machine", pattern: "horizontal_push" },
  { slug: "cable-chest-press", es: "Press de pecho en polea", en: "Cable Chest Press", muscle: "chest", secondary: ["triceps"], equipment: "cable", pattern: "horizontal_push", load: 2 },
  { slug: "dumbbell-fly", es: "Aperturas con mancuernas", en: "Dumbbell Fly", muscle: "chest", equipment: "dumbbell", pattern: "isolation", load: 2 },
  { slug: "incline-dumbbell-fly", es: "Aperturas inclinadas con mancuernas", en: "Incline Dumbbell Fly", muscle: "chest", secondary: ["shoulders"], equipment: "dumbbell", pattern: "isolation", load: 2 },
  { slug: "pec-deck", es: "Pec deck (aperturas en máquina)", en: "Pec Deck", muscle: "chest", equipment: "machine", pattern: "isolation" },
  { slug: "cable-crossover", es: "Cruce de poleas", en: "Cable Crossover", muscle: "chest", equipment: "cable", pattern: "isolation", load: 2 },
  { slug: "low-to-high-cable-fly", es: "Aperturas en polea de abajo hacia arriba", en: "Low-to-High Cable Fly", muscle: "chest", secondary: ["shoulders"], equipment: "cable", pattern: "isolation", load: 2 },
  { slug: "high-to-low-cable-fly", es: "Aperturas en polea de arriba hacia abajo", en: "High-to-Low Cable Fly", muscle: "chest", equipment: "cable", pattern: "isolation", load: 2 },
  { slug: "dumbbell-pullover", es: "Pullover con mancuerna", en: "Dumbbell Pullover", muscle: "chest", secondary: ["back"], equipment: "dumbbell", pattern: "isolation" },
  { slug: "chest-dip", es: "Fondos para pecho", en: "Chest Dip", muscle: "chest", secondary: ["triceps", "shoulders"], equipment: "bodyweight", pattern: "vertical_push", tracking: "reps_only" },
  { slug: "push-up", es: "Flexiones de brazos", en: "Push-Up", muscle: "chest", secondary: ["triceps", "shoulders"], equipment: "bodyweight", pattern: "horizontal_push", tracking: "reps_only" },
  { slug: "incline-push-up", es: "Flexiones inclinadas", en: "Incline Push-Up", muscle: "chest", secondary: ["triceps"], equipment: "bodyweight", pattern: "horizontal_push", tracking: "reps_only" },
  { slug: "decline-push-up", es: "Flexiones declinadas", en: "Decline Push-Up", muscle: "chest", secondary: ["shoulders", "triceps"], equipment: "bodyweight", pattern: "horizontal_push", tracking: "reps_only" },
  { slug: "ring-push-up", es: "Flexiones en anillas", en: "Ring Push-Up", muscle: "chest", secondary: ["triceps", "abs"], equipment: "suspension", pattern: "horizontal_push", tracking: "reps_only" },

  // Espalda (dorsales y espalda alta)
  { slug: "deadlift", es: "Peso muerto", en: "Deadlift", muscle: "back", secondary: ["glutes", "hamstrings", "lower_back", "forearms"], equipment: "barbell", pattern: "hinge" },
  { slug: "deficit-deadlift", es: "Peso muerto con déficit", en: "Deficit Deadlift", muscle: "back", secondary: ["glutes", "hamstrings", "lower_back"], equipment: "barbell", pattern: "hinge" },
  { slug: "rack-pull", es: "Peso muerto desde rack", en: "Rack Pull", muscle: "back", secondary: ["traps", "glutes", "lower_back"], equipment: "barbell", pattern: "hinge" },
  { slug: "pull-up", es: "Dominadas", en: "Pull-Up", muscle: "back", secondary: ["biceps"], equipment: "bodyweight", pattern: "vertical_pull", tracking: "reps_only" },
  { slug: "chin-up", es: "Dominadas supinas", en: "Chin-Up", muscle: "back", secondary: ["biceps"], equipment: "bodyweight", pattern: "vertical_pull", tracking: "reps_only" },
  { slug: "neutral-grip-pull-up", es: "Dominadas agarre neutro", en: "Neutral-Grip Pull-Up", muscle: "back", secondary: ["biceps"], equipment: "bodyweight", pattern: "vertical_pull", tracking: "reps_only" },
  { slug: "lat-pulldown", es: "Jalón al pecho", en: "Lat Pulldown", muscle: "back", secondary: ["biceps"], equipment: "cable", pattern: "vertical_pull" },
  { slug: "close-grip-lat-pulldown", es: "Jalón al pecho agarre cerrado", en: "Close-Grip Lat Pulldown", muscle: "back", secondary: ["biceps"], equipment: "cable", pattern: "vertical_pull" },
  { slug: "reverse-grip-lat-pulldown", es: "Jalón al pecho supino", en: "Reverse-Grip Lat Pulldown", muscle: "back", secondary: ["biceps"], equipment: "cable", pattern: "vertical_pull" },
  { slug: "single-arm-lat-pulldown", es: "Jalón a una mano", en: "Single-Arm Lat Pulldown", muscle: "back", secondary: ["biceps"], equipment: "cable", pattern: "vertical_pull", laterality: "unilateral" },
  { slug: "machine-lat-pulldown", es: "Jalón en máquina", en: "Machine Lat Pulldown", muscle: "back", secondary: ["biceps"], equipment: "machine", pattern: "vertical_pull" },
  { slug: "straight-arm-pulldown", es: "Pullover en polea con brazos rectos", en: "Straight-Arm Pulldown", muscle: "back", equipment: "cable", pattern: "isolation" },
  { slug: "machine-pullover", es: "Pullover en máquina", en: "Machine Pullover", muscle: "back", equipment: "machine", pattern: "isolation" },
  { slug: "barbell-row", es: "Remo con barra", en: "Barbell Row", muscle: "back", secondary: ["biceps", "lower_back"], equipment: "barbell", pattern: "horizontal_pull" },
  { slug: "pendlay-row", es: "Remo Pendlay", en: "Pendlay Row", muscle: "back", secondary: ["biceps", "lower_back"], equipment: "barbell", pattern: "horizontal_pull" },
  { slug: "seal-row", es: "Remo foca", en: "Seal Row", muscle: "back", secondary: ["biceps"], equipment: "barbell", pattern: "horizontal_pull" },
  { slug: "t-bar-row", es: "Remo en barra T", en: "T-Bar Row", muscle: "back", secondary: ["biceps"], equipment: "landmine", pattern: "horizontal_pull" },
  { slug: "meadows-row", es: "Remo Meadows", en: "Meadows Row", muscle: "back", secondary: ["biceps"], equipment: "landmine", pattern: "horizontal_pull", laterality: "unilateral" },
  { slug: "one-arm-dumbbell-row", es: "Remo con mancuerna a una mano", en: "One-Arm Dumbbell Row", muscle: "back", secondary: ["biceps"], equipment: "dumbbell", pattern: "horizontal_pull", laterality: "unilateral" },
  { slug: "kroc-row", es: "Remo Kroc", en: "Kroc Row", muscle: "back", secondary: ["biceps", "forearms"], equipment: "dumbbell", pattern: "horizontal_pull", laterality: "unilateral" },
  { slug: "chest-supported-dumbbell-row", es: "Remo con mancuernas apoyado en banco", en: "Chest-Supported Dumbbell Row", muscle: "back", secondary: ["biceps"], equipment: "dumbbell", pattern: "horizontal_pull", load: 2 },
  { slug: "seated-cable-row", es: "Remo sentado en polea", en: "Seated Cable Row", muscle: "back", secondary: ["biceps"], equipment: "cable", pattern: "horizontal_pull" },
  { slug: "single-arm-cable-row", es: "Remo en polea a una mano", en: "Single-Arm Cable Row", muscle: "back", secondary: ["biceps"], equipment: "cable", pattern: "horizontal_pull", laterality: "unilateral" },
  { slug: "chest-supported-machine-row", es: "Remo en máquina con apoyo de pecho", en: "Chest-Supported Machine Row", muscle: "back", secondary: ["biceps"], equipment: "machine", pattern: "horizontal_pull" },
  { slug: "inverted-row", es: "Remo invertido", en: "Inverted Row", muscle: "back", secondary: ["biceps"], equipment: "bodyweight", pattern: "horizontal_pull", tracking: "reps_only" },
  { slug: "trx-row", es: "Remo en TRX", en: "TRX Row", muscle: "back", secondary: ["biceps"], equipment: "suspension", pattern: "horizontal_pull", tracking: "reps_only" },

  // Zona lumbar
  { slug: "back-extension", es: "Hiperextensiones", en: "Back Extension", muscle: "lower_back", secondary: ["glutes", "hamstrings"], equipment: "bodyweight", pattern: "hinge", tracking: "reps_only" },
  { slug: "weighted-back-extension", es: "Hiperextensiones con peso", en: "Weighted Back Extension", muscle: "lower_back", secondary: ["glutes", "hamstrings"], equipment: "plate", pattern: "hinge" },
  { slug: "jefferson-curl", es: "Jefferson curl", en: "Jefferson Curl", muscle: "lower_back", secondary: ["hamstrings"], equipment: "dumbbell", pattern: "hinge" },
  { slug: "superman", es: "Superman", en: "Superman Hold", muscle: "lower_back", secondary: ["glutes"], equipment: "bodyweight", pattern: "core", tracking: "reps_only" },

  // Trapecios
  { slug: "barbell-shrug", es: "Encogimientos con barra", en: "Barbell Shrug", muscle: "traps", secondary: ["forearms"], equipment: "barbell", pattern: "isolation" },
  { slug: "dumbbell-shrug", es: "Encogimientos con mancuernas", en: "Dumbbell Shrug", muscle: "traps", secondary: ["forearms"], equipment: "dumbbell", pattern: "isolation", load: 2 },
  { slug: "smith-machine-shrug", es: "Encogimientos en máquina Smith", en: "Smith Machine Shrug", muscle: "traps", equipment: "smith_machine", pattern: "isolation" },
  { slug: "kelso-shrug", es: "Encogimiento Kelso", en: "Kelso Shrug", muscle: "traps", secondary: ["back"], equipment: "dumbbell", pattern: "isolation", load: 2 },
  { slug: "trap-bar-shrug", es: "Encogimientos con barra hexagonal", en: "Trap Bar Shrug", muscle: "traps", secondary: ["forearms"], equipment: "trap_bar", pattern: "isolation" },

  // Hombros
  { slug: "overhead-press", es: "Press militar", en: "Overhead Press", muscle: "shoulders", secondary: ["triceps"], equipment: "barbell", pattern: "vertical_push" },
  { slug: "push-press", es: "Push press", en: "Push Press", muscle: "shoulders", secondary: ["triceps", "quads"], equipment: "barbell", pattern: "vertical_push" },
  { slug: "z-press", es: "Press Z", en: "Z Press", muscle: "shoulders", secondary: ["triceps", "abs"], equipment: "barbell", pattern: "vertical_push" },
  { slug: "seated-dumbbell-shoulder-press", es: "Press de hombros con mancuernas", en: "Seated Dumbbell Shoulder Press", muscle: "shoulders", secondary: ["triceps"], equipment: "dumbbell", pattern: "vertical_push", load: 2 },
  { slug: "arnold-press", es: "Press Arnold", en: "Arnold Press", muscle: "shoulders", secondary: ["triceps"], equipment: "dumbbell", pattern: "vertical_push", load: 2 },
  { slug: "machine-shoulder-press", es: "Press de hombros en máquina", en: "Machine Shoulder Press", muscle: "shoulders", secondary: ["triceps"], equipment: "machine", pattern: "vertical_push" },
  { slug: "smith-machine-shoulder-press", es: "Press de hombros en máquina Smith", en: "Smith Machine Shoulder Press", muscle: "shoulders", secondary: ["triceps"], equipment: "smith_machine", pattern: "vertical_push" },
  { slug: "single-arm-landmine-press", es: "Press landmine a una mano", en: "Single-Arm Landmine Press", muscle: "shoulders", secondary: ["chest", "triceps"], equipment: "landmine", pattern: "vertical_push", laterality: "unilateral" },
  { slug: "handstand-push-up", es: "Flexiones en parada de manos", en: "Handstand Push-Up", muscle: "shoulders", secondary: ["triceps"], equipment: "bodyweight", pattern: "vertical_push", tracking: "reps_only" },
  { slug: "dumbbell-lateral-raise", es: "Elevaciones laterales con mancuernas", en: "Dumbbell Lateral Raise", muscle: "shoulders", equipment: "dumbbell", pattern: "isolation", load: 2 },
  { slug: "cable-lateral-raise", es: "Elevación lateral en polea", en: "Cable Lateral Raise", muscle: "shoulders", equipment: "cable", pattern: "isolation", laterality: "unilateral" },
  { slug: "machine-lateral-raise", es: "Elevaciones laterales en máquina", en: "Machine Lateral Raise", muscle: "shoulders", equipment: "machine", pattern: "isolation" },
  { slug: "cable-y-raise", es: "Elevación en Y en polea", en: "Cable Y-Raise", muscle: "shoulders", secondary: ["traps"], equipment: "cable", pattern: "isolation", load: 2 },
  { slug: "dumbbell-front-raise", es: "Elevaciones frontales con mancuernas", en: "Dumbbell Front Raise", muscle: "shoulders", equipment: "dumbbell", pattern: "isolation", load: 2 },
  { slug: "plate-front-raise", es: "Elevación frontal con disco", en: "Plate Front Raise", muscle: "shoulders", equipment: "plate", pattern: "isolation" },
  { slug: "barbell-upright-row", es: "Remo al mentón con barra", en: "Barbell Upright Row", muscle: "shoulders", secondary: ["traps"], equipment: "barbell", pattern: "vertical_pull" },
  { slug: "reverse-dumbbell-fly", es: "Vuelos posteriores con mancuernas", en: "Reverse Dumbbell Fly", muscle: "shoulders", secondary: ["back"], equipment: "dumbbell", pattern: "isolation", load: 2 },
  { slug: "reverse-pec-deck", es: "Pec deck inverso", en: "Reverse Pec Deck", muscle: "shoulders", secondary: ["back"], equipment: "machine", pattern: "isolation" },
  { slug: "reverse-cable-fly", es: "Aperturas inversas en polea", en: "Reverse Cable Fly", muscle: "shoulders", secondary: ["back"], equipment: "cable", pattern: "isolation", load: 2 },
  { slug: "face-pull", es: "Face pull en polea", en: "Face Pull", muscle: "shoulders", secondary: ["back", "traps"], equipment: "cable", pattern: "horizontal_pull" },
  { slug: "cable-external-rotation", es: "Rotación externa en polea", en: "Cable External Rotation", muscle: "shoulders", equipment: "cable", pattern: "isolation", laterality: "unilateral" },
  { slug: "band-pull-apart", es: "Separación de banda", en: "Band Pull-Apart", muscle: "shoulders", secondary: ["back"], equipment: "band", pattern: "horizontal_pull", tracking: "reps_only" },

  // Bíceps
  { slug: "barbell-curl", es: "Curl con barra", en: "Barbell Curl", muscle: "biceps", secondary: ["forearms"], equipment: "barbell", pattern: "isolation" },
  { slug: "ez-bar-curl", es: "Curl con barra Z", en: "EZ Bar Curl", muscle: "biceps", secondary: ["forearms"], equipment: "ez_bar", pattern: "isolation" },
  { slug: "dumbbell-curl", es: "Curl con mancuernas", en: "Dumbbell Curl", muscle: "biceps", secondary: ["forearms"], equipment: "dumbbell", pattern: "isolation", load: 2 },
  { slug: "hammer-curl", es: "Curl martillo", en: "Hammer Curl", muscle: "biceps", secondary: ["forearms"], equipment: "dumbbell", pattern: "isolation", load: 2 },
  { slug: "incline-dumbbell-curl", es: "Curl inclinado con mancuernas", en: "Incline Dumbbell Curl", muscle: "biceps", equipment: "dumbbell", pattern: "isolation", load: 2 },
  { slug: "concentration-curl", es: "Curl concentrado", en: "Concentration Curl", muscle: "biceps", equipment: "dumbbell", pattern: "isolation", laterality: "unilateral" },
  { slug: "spider-curl", es: "Curl araña", en: "Spider Curl", muscle: "biceps", equipment: "dumbbell", pattern: "isolation", load: 2 },
  { slug: "zottman-curl", es: "Curl Zottman", en: "Zottman Curl", muscle: "biceps", secondary: ["forearms"], equipment: "dumbbell", pattern: "isolation", load: 2 },
  { slug: "drag-curl", es: "Curl arrastrado", en: "Drag Curl", muscle: "biceps", equipment: "barbell", pattern: "isolation" },
  { slug: "preacher-curl", es: "Curl predicador", en: "Preacher Curl", muscle: "biceps", equipment: "ez_bar", pattern: "isolation" },
  { slug: "dumbbell-preacher-curl", es: "Curl predicador con mancuerna", en: "Dumbbell Preacher Curl", muscle: "biceps", equipment: "dumbbell", pattern: "isolation", laterality: "unilateral" },
  { slug: "machine-preacher-curl", es: "Curl predicador en máquina", en: "Machine Preacher Curl", muscle: "biceps", equipment: "machine", pattern: "isolation" },
  { slug: "cable-curl", es: "Curl en polea", en: "Cable Curl", muscle: "biceps", equipment: "cable", pattern: "isolation" },
  { slug: "bayesian-cable-curl", es: "Curl bayesiano en polea", en: "Bayesian Cable Curl", muscle: "biceps", equipment: "cable", pattern: "isolation", laterality: "unilateral" },
  { slug: "overhead-cable-curl", es: "Curl en polea alta", en: "Overhead Cable Curl", muscle: "biceps", equipment: "cable", pattern: "isolation", load: 2 },
  { slug: "rope-hammer-curl", es: "Curl martillo en polea con cuerda", en: "Rope Hammer Curl", muscle: "biceps", secondary: ["forearms"], equipment: "cable", pattern: "isolation" },

  // Tríceps
  { slug: "triceps-pushdown", es: "Extensión de tríceps en polea", en: "Triceps Pushdown", muscle: "triceps", equipment: "cable", pattern: "isolation" },
  { slug: "rope-triceps-pushdown", es: "Extensión de tríceps en polea con cuerda", en: "Rope Triceps Pushdown", muscle: "triceps", equipment: "cable", pattern: "isolation" },
  { slug: "single-arm-cable-pushdown", es: "Extensión de tríceps en polea a una mano", en: "Single-Arm Cable Pushdown", muscle: "triceps", equipment: "cable", pattern: "isolation", laterality: "unilateral" },
  { slug: "overhead-cable-triceps-extension", es: "Extensión de tríceps sobre la cabeza en polea", en: "Overhead Cable Triceps Extension", muscle: "triceps", equipment: "cable", pattern: "isolation" },
  { slug: "overhead-triceps-extension", es: "Extensión de tríceps sobre la cabeza", en: "Overhead Triceps Extension", muscle: "triceps", equipment: "dumbbell", pattern: "isolation" },
  { slug: "skull-crusher", es: "Press francés", en: "Skull Crusher", muscle: "triceps", equipment: "ez_bar", pattern: "isolation" },
  { slug: "dumbbell-skull-crusher", es: "Press francés con mancuernas", en: "Dumbbell Skull Crusher", muscle: "triceps", equipment: "dumbbell", pattern: "isolation", load: 2 },
  { slug: "jm-press", es: "Press JM", en: "JM Press", muscle: "triceps", secondary: ["chest"], equipment: "barbell", pattern: "horizontal_push" },
  { slug: "close-grip-bench-press", es: "Press de banca agarre cerrado", en: "Close-Grip Bench Press", muscle: "triceps", secondary: ["chest", "shoulders"], equipment: "barbell", pattern: "horizontal_push" },
  { slug: "dumbbell-triceps-kickback", es: "Patada de tríceps con mancuerna", en: "Dumbbell Triceps Kickback", muscle: "triceps", equipment: "dumbbell", pattern: "isolation", laterality: "unilateral" },
  { slug: "machine-triceps-extension", es: "Extensión de tríceps en máquina", en: "Machine Triceps Extension", muscle: "triceps", equipment: "machine", pattern: "isolation" },
  { slug: "parallel-bar-dip", es: "Fondos en paralelas", en: "Parallel Bar Dip", muscle: "triceps", secondary: ["chest", "shoulders"], equipment: "bodyweight", pattern: "vertical_push", tracking: "reps_only" },
  { slug: "bench-dip", es: "Fondos en banco", en: "Bench Dip", muscle: "triceps", secondary: ["shoulders"], equipment: "bodyweight", pattern: "vertical_push", tracking: "reps_only" },
  { slug: "diamond-push-up", es: "Flexiones diamante", en: "Diamond Push-Up", muscle: "triceps", secondary: ["chest"], equipment: "bodyweight", pattern: "horizontal_push", tracking: "reps_only" },

  // Antebrazos
  { slug: "wrist-curl", es: "Curl de muñeca", en: "Wrist Curl", muscle: "forearms", equipment: "dumbbell", pattern: "isolation", load: 2 },
  { slug: "reverse-wrist-curl", es: "Curl de muñeca invertido", en: "Reverse Wrist Curl", muscle: "forearms", equipment: "dumbbell", pattern: "isolation", load: 2 },
  { slug: "barbell-wrist-curl", es: "Curl de muñeca con barra", en: "Barbell Wrist Curl", muscle: "forearms", equipment: "barbell", pattern: "isolation" },
  { slug: "reverse-barbell-curl", es: "Curl invertido con barra", en: "Reverse Barbell Curl", muscle: "forearms", secondary: ["biceps"], equipment: "barbell", pattern: "isolation" },
  { slug: "wrist-roller", es: "Rodillo de muñeca", en: "Wrist Roller", muscle: "forearms", equipment: "other", pattern: "isolation", tracking: "reps_only" },
  { slug: "dead-hang", es: "Colgarse de la barra", en: "Dead Hang", muscle: "forearms", secondary: ["back"], equipment: "bodyweight", pattern: "isolation", tracking: "duration" },
  { slug: "plate-pinch", es: "Pinza con discos", en: "Plate Pinch", muscle: "forearms", equipment: "plate", pattern: "isolation", tracking: "duration" },

  // Abdomen
  { slug: "plank", es: "Plancha", en: "Plank", muscle: "abs", equipment: "bodyweight", pattern: "core", tracking: "duration" },
  { slug: "side-plank", es: "Plancha lateral", en: "Side Plank", muscle: "abs", equipment: "bodyweight", pattern: "core", laterality: "unilateral", tracking: "duration" },
  { slug: "hollow-hold", es: "Hollow hold", en: "Hollow Body Hold", muscle: "abs", equipment: "bodyweight", pattern: "core", tracking: "duration" },
  { slug: "crunch", es: "Abdominales crunch", en: "Crunch", muscle: "abs", equipment: "bodyweight", pattern: "core", tracking: "reps_only" },
  { slug: "bicycle-crunch", es: "Abdominales bicicleta", en: "Bicycle Crunch", muscle: "abs", equipment: "bodyweight", pattern: "core", tracking: "reps_only" },
  { slug: "sit-up", es: "Abdominales completos", en: "Sit-Up", muscle: "abs", equipment: "bodyweight", pattern: "core", tracking: "reps_only" },
  { slug: "decline-sit-up", es: "Abdominales en banco declinado", en: "Decline Sit-Up", muscle: "abs", equipment: "bodyweight", pattern: "core", tracking: "reps_only" },
  { slug: "cable-crunch", es: "Crunch en polea", en: "Cable Crunch", muscle: "abs", equipment: "cable", pattern: "core" },
  { slug: "machine-crunch", es: "Crunch en máquina", en: "Machine Crunch", muscle: "abs", equipment: "machine", pattern: "core" },
  { slug: "hanging-leg-raise", es: "Elevación de piernas colgado", en: "Hanging Leg Raise", muscle: "abs", equipment: "bodyweight", pattern: "core", tracking: "reps_only" },
  { slug: "hanging-knee-raise", es: "Elevación de rodillas colgado", en: "Hanging Knee Raise", muscle: "abs", equipment: "bodyweight", pattern: "core", tracking: "reps_only" },
  { slug: "captains-chair-leg-raise", es: "Elevación de piernas en silla romana", en: "Captain's Chair Leg Raise", muscle: "abs", equipment: "bodyweight", pattern: "core", tracking: "reps_only" },
  { slug: "lying-leg-raise", es: "Elevación de piernas acostado", en: "Lying Leg Raise", muscle: "abs", equipment: "bodyweight", pattern: "core", tracking: "reps_only" },
  { slug: "dead-bug", es: "Dead bug", en: "Dead Bug", muscle: "abs", equipment: "bodyweight", pattern: "core", tracking: "reps_only" },
  { slug: "dragon-flag", es: "Dragon flag", en: "Dragon Flag", muscle: "abs", equipment: "bodyweight", pattern: "core", tracking: "reps_only" },
  { slug: "ab-wheel-rollout", es: "Rueda abdominal", en: "Ab Wheel Rollout", muscle: "abs", equipment: "other", pattern: "core", tracking: "reps_only" },
  { slug: "russian-twist", es: "Giro ruso", en: "Russian Twist", muscle: "abs", equipment: "bodyweight", pattern: "core", tracking: "reps_only" },
  { slug: "pallof-press", es: "Press Pallof", en: "Pallof Press", muscle: "abs", equipment: "cable", pattern: "core", laterality: "unilateral" },
  { slug: "cable-woodchop", es: "Leñador en polea", en: "Cable Woodchop", muscle: "abs", secondary: ["shoulders"], equipment: "cable", pattern: "core", laterality: "unilateral" },
  { slug: "dumbbell-side-bend", es: "Flexión lateral con mancuerna", en: "Dumbbell Side Bend", muscle: "abs", equipment: "dumbbell", pattern: "core", laterality: "unilateral" },
  { slug: "mountain-climber", es: "Escaladores", en: "Mountain Climber", muscle: "abs", secondary: ["shoulders"], equipment: "bodyweight", pattern: "core", tracking: "duration" },

  // Cuádriceps
  { slug: "back-squat", es: "Sentadilla con barra", en: "Back Squat", muscle: "quads", secondary: ["glutes", "hamstrings"], equipment: "barbell", pattern: "squat" },
  { slug: "front-squat", es: "Sentadilla frontal", en: "Front Squat", muscle: "quads", secondary: ["glutes", "abs"], equipment: "barbell", pattern: "squat" },
  { slug: "pause-squat", es: "Sentadilla con pausa", en: "Pause Squat", muscle: "quads", secondary: ["glutes"], equipment: "barbell", pattern: "squat" },
  { slug: "box-squat", es: "Sentadilla al cajón", en: "Box Squat", muscle: "quads", secondary: ["glutes", "hamstrings"], equipment: "barbell", pattern: "squat" },
  { slug: "safety-bar-squat", es: "Sentadilla con barra de seguridad", en: "Safety Bar Squat", muscle: "quads", secondary: ["glutes", "back"], equipment: "barbell", pattern: "squat" },
  { slug: "smith-machine-squat", es: "Sentadilla en máquina Smith", en: "Smith Machine Squat", muscle: "quads", secondary: ["glutes"], equipment: "smith_machine", pattern: "squat" },
  { slug: "goblet-squat", es: "Sentadilla goblet", en: "Goblet Squat", muscle: "quads", secondary: ["glutes"], equipment: "kettlebell", pattern: "squat" },
  { slug: "hack-squat", es: "Sentadilla hack", en: "Hack Squat", muscle: "quads", secondary: ["glutes"], equipment: "machine", pattern: "squat" },
  { slug: "pendulum-squat", es: "Sentadilla péndulo", en: "Pendulum Squat", muscle: "quads", secondary: ["glutes"], equipment: "machine", pattern: "squat" },
  { slug: "belt-squat", es: "Sentadilla con cinturón", en: "Belt Squat", muscle: "quads", secondary: ["glutes"], equipment: "machine", pattern: "squat" },
  { slug: "leg-press", es: "Prensa de piernas", en: "Leg Press", muscle: "quads", secondary: ["glutes", "hamstrings"], equipment: "machine", pattern: "squat" },
  { slug: "single-leg-press", es: "Prensa a una pierna", en: "Single-Leg Leg Press", muscle: "quads", secondary: ["glutes"], equipment: "machine", pattern: "squat", laterality: "unilateral" },
  { slug: "leg-extension", es: "Extensión de cuádriceps", en: "Leg Extension", muscle: "quads", equipment: "machine", pattern: "isolation" },
  { slug: "single-leg-extension", es: "Extensión de cuádriceps a una pierna", en: "Single-Leg Extension", muscle: "quads", equipment: "machine", pattern: "isolation", laterality: "unilateral" },
  { slug: "sissy-squat", es: "Sentadilla sissy", en: "Sissy Squat", muscle: "quads", equipment: "bodyweight", pattern: "squat", tracking: "reps_only" },
  { slug: "reverse-nordic", es: "Nórdico inverso", en: "Reverse Nordic", muscle: "quads", equipment: "bodyweight", pattern: "isolation", tracking: "reps_only" },
  { slug: "bulgarian-split-squat", es: "Sentadilla búlgara", en: "Bulgarian Split Squat", muscle: "quads", secondary: ["glutes"], equipment: "dumbbell", pattern: "lunge", laterality: "unilateral", load: 2 },
  { slug: "smith-machine-bulgarian-split-squat", es: "Sentadilla búlgara en máquina Smith", en: "Smith Machine Bulgarian Split Squat", muscle: "quads", secondary: ["glutes"], equipment: "smith_machine", pattern: "lunge", laterality: "unilateral" },
  { slug: "walking-lunge", es: "Zancadas caminando", en: "Walking Lunge", muscle: "quads", secondary: ["glutes"], equipment: "dumbbell", pattern: "lunge", laterality: "unilateral", load: 2 },
  { slug: "dumbbell-reverse-lunge", es: "Zancada hacia atrás con mancuernas", en: "Dumbbell Reverse Lunge", muscle: "quads", secondary: ["glutes"], equipment: "dumbbell", pattern: "lunge", laterality: "unilateral", load: 2 },
  { slug: "barbell-lunge", es: "Zancadas con barra", en: "Barbell Lunge", muscle: "quads", secondary: ["glutes"], equipment: "barbell", pattern: "lunge", laterality: "unilateral" },
  { slug: "dumbbell-step-up", es: "Subida al cajón con mancuernas", en: "Dumbbell Step-Up", muscle: "quads", secondary: ["glutes"], equipment: "dumbbell", pattern: "lunge", laterality: "unilateral", load: 2 },
  { slug: "bodyweight-squat", es: "Sentadilla sin peso", en: "Bodyweight Squat", muscle: "quads", secondary: ["glutes"], equipment: "bodyweight", pattern: "squat", tracking: "reps_only" },
  { slug: "pistol-squat", es: "Sentadilla pistol", en: "Pistol Squat", muscle: "quads", secondary: ["glutes"], equipment: "bodyweight", pattern: "squat", laterality: "unilateral", tracking: "reps_only" },
  { slug: "jump-squat", es: "Sentadilla con salto", en: "Jump Squat", muscle: "quads", secondary: ["glutes", "calves"], equipment: "bodyweight", pattern: "plyometric", tracking: "reps_only" },
  { slug: "box-jump", es: "Salto al cajón", en: "Box Jump", muscle: "quads", secondary: ["glutes", "calves"], equipment: "other", pattern: "plyometric", tracking: "reps_only" },

  // Isquiotibiales
  { slug: "romanian-deadlift", es: "Peso muerto rumano", en: "Romanian Deadlift", muscle: "hamstrings", secondary: ["glutes", "lower_back"], equipment: "barbell", pattern: "hinge" },
  { slug: "dumbbell-romanian-deadlift", es: "Peso muerto rumano con mancuernas", en: "Dumbbell Romanian Deadlift", muscle: "hamstrings", secondary: ["glutes"], equipment: "dumbbell", pattern: "hinge", load: 2 },
  { slug: "single-leg-romanian-deadlift", es: "Peso muerto rumano a una pierna", en: "Single-Leg Romanian Deadlift", muscle: "hamstrings", secondary: ["glutes"], equipment: "dumbbell", pattern: "hinge", laterality: "unilateral" },
  { slug: "smith-machine-romanian-deadlift", es: "Peso muerto rumano en máquina Smith", en: "Smith Machine Romanian Deadlift", muscle: "hamstrings", secondary: ["glutes"], equipment: "smith_machine", pattern: "hinge" },
  { slug: "stiff-leg-deadlift", es: "Peso muerto con piernas rígidas", en: "Stiff-Legged Deadlift", muscle: "hamstrings", secondary: ["glutes", "lower_back"], equipment: "barbell", pattern: "hinge" },
  { slug: "good-morning", es: "Buenos días con barra", en: "Good Morning", muscle: "hamstrings", secondary: ["lower_back", "glutes"], equipment: "barbell", pattern: "hinge" },
  { slug: "lying-leg-curl", es: "Curl femoral tumbado", en: "Lying Leg Curl", muscle: "hamstrings", equipment: "machine", pattern: "isolation" },
  { slug: "seated-leg-curl", es: "Curl femoral sentado", en: "Seated Leg Curl", muscle: "hamstrings", equipment: "machine", pattern: "isolation" },
  { slug: "standing-leg-curl", es: "Curl femoral de pie", en: "Standing Leg Curl", muscle: "hamstrings", equipment: "machine", pattern: "isolation", laterality: "unilateral" },
  { slug: "nordic-curl", es: "Curl nórdico", en: "Nordic Curl", muscle: "hamstrings", equipment: "bodyweight", pattern: "isolation", tracking: "reps_only" },
  { slug: "glute-ham-raise", es: "Glute ham raise", en: "Glute-Ham Raise", muscle: "hamstrings", secondary: ["glutes"], equipment: "bodyweight", pattern: "isolation", tracking: "reps_only" },

  // Glúteos
  { slug: "barbell-hip-thrust", es: "Hip thrust con barra", en: "Barbell Hip Thrust", muscle: "glutes", secondary: ["hamstrings"], equipment: "barbell", pattern: "hinge" },
  { slug: "hip-thrust-machine", es: "Hip thrust en máquina", en: "Hip Thrust Machine", muscle: "glutes", secondary: ["hamstrings"], equipment: "machine", pattern: "hinge" },
  { slug: "smith-machine-hip-thrust", es: "Hip thrust en máquina Smith", en: "Smith Machine Hip Thrust", muscle: "glutes", secondary: ["hamstrings"], equipment: "smith_machine", pattern: "hinge" },
  { slug: "single-leg-hip-thrust", es: "Hip thrust a una pierna", en: "Single-Leg Hip Thrust", muscle: "glutes", secondary: ["hamstrings"], equipment: "bodyweight", pattern: "hinge", laterality: "unilateral", tracking: "reps_only" },
  { slug: "barbell-glute-bridge", es: "Puente de glúteos con barra", en: "Barbell Glute Bridge", muscle: "glutes", secondary: ["hamstrings"], equipment: "barbell", pattern: "hinge" },
  { slug: "glute-bridge", es: "Puente de glúteos", en: "Glute Bridge", muscle: "glutes", secondary: ["hamstrings"], equipment: "bodyweight", pattern: "hinge", tracking: "reps_only" },
  { slug: "frog-pump", es: "Frog pumps", en: "Frog Pump", muscle: "glutes", equipment: "bodyweight", pattern: "hinge", tracking: "reps_only" },
  { slug: "sumo-deadlift", es: "Peso muerto sumo", en: "Sumo Deadlift", muscle: "glutes", secondary: ["quads", "hamstrings", "adductors", "back"], equipment: "barbell", pattern: "hinge" },
  { slug: "trap-bar-deadlift", es: "Peso muerto con barra hexagonal", en: "Trap Bar Deadlift", muscle: "glutes", secondary: ["quads", "hamstrings", "back"], equipment: "trap_bar", pattern: "hinge" },
  { slug: "cable-pull-through", es: "Pull-through en polea", en: "Cable Pull-Through", muscle: "glutes", secondary: ["hamstrings"], equipment: "cable", pattern: "hinge" },
  { slug: "reverse-hyperextension", es: "Hiperextensión inversa", en: "Reverse Hyperextension", muscle: "glutes", secondary: ["hamstrings", "lower_back"], equipment: "machine", pattern: "hinge" },
  { slug: "cable-glute-kickback", es: "Patada de glúteo en polea", en: "Cable Glute Kickback", muscle: "glutes", equipment: "cable", pattern: "isolation", laterality: "unilateral" },
  { slug: "machine-glute-kickback", es: "Patada de glúteo en máquina", en: "Machine Glute Kickback", muscle: "glutes", equipment: "machine", pattern: "isolation", laterality: "unilateral" },

  // Aductores y abductores
  { slug: "machine-hip-adduction", es: "Aducción de cadera en máquina", en: "Machine Hip Adduction", muscle: "adductors", equipment: "machine", pattern: "isolation" },
  { slug: "cable-hip-adduction", es: "Aducción de cadera en polea", en: "Cable Hip Adduction", muscle: "adductors", equipment: "cable", pattern: "isolation", laterality: "unilateral" },
  { slug: "copenhagen-plank", es: "Plancha Copenhague", en: "Copenhagen Plank", muscle: "adductors", secondary: ["abs"], equipment: "bodyweight", pattern: "core", laterality: "unilateral", tracking: "duration" },
  { slug: "cossack-squat", es: "Sentadilla cosaca", en: "Cossack Squat", muscle: "adductors", secondary: ["quads", "glutes"], equipment: "bodyweight", pattern: "lunge", laterality: "unilateral", tracking: "reps_only" },
  { slug: "machine-hip-abduction", es: "Abducción de cadera en máquina", en: "Machine Hip Abduction", muscle: "abductors", secondary: ["glutes"], equipment: "machine", pattern: "isolation" },
  { slug: "cable-hip-abduction", es: "Abducción de cadera en polea", en: "Cable Hip Abduction", muscle: "abductors", secondary: ["glutes"], equipment: "cable", pattern: "isolation", laterality: "unilateral" },
  { slug: "banded-lateral-walk", es: "Caminata lateral con banda", en: "Banded Lateral Walk", muscle: "abductors", secondary: ["glutes"], equipment: "band", pattern: "isolation", tracking: "reps_only" },

  // Pantorrillas y tibiales
  { slug: "standing-calf-raise", es: "Elevación de talones de pie", en: "Standing Calf Raise", muscle: "calves", equipment: "machine", pattern: "isolation" },
  { slug: "seated-calf-raise", es: "Elevación de talones sentado", en: "Seated Calf Raise", muscle: "calves", equipment: "machine", pattern: "isolation" },
  { slug: "leg-press-calf-raise", es: "Elevación de talones en prensa", en: "Leg Press Calf Raise", muscle: "calves", equipment: "machine", pattern: "isolation" },
  { slug: "smith-machine-calf-raise", es: "Elevación de talones en máquina Smith", en: "Smith Machine Calf Raise", muscle: "calves", equipment: "smith_machine", pattern: "isolation" },
  { slug: "donkey-calf-raise", es: "Elevación de talones tipo burro", en: "Donkey Calf Raise", muscle: "calves", equipment: "machine", pattern: "isolation" },
  { slug: "single-leg-calf-raise", es: "Elevación de talones a una pierna", en: "Single-Leg Calf Raise", muscle: "calves", equipment: "dumbbell", pattern: "isolation", laterality: "unilateral" },
  { slug: "tibialis-raise", es: "Elevación de tibiales", en: "Tibialis Raise", muscle: "tibialis", equipment: "bodyweight", pattern: "isolation", tracking: "reps_only" },
  { slug: "weighted-tibialis-raise", es: "Elevación de tibiales con peso", en: "Weighted Tibialis Raise", muscle: "tibialis", equipment: "other", pattern: "isolation" },

  // Cuerpo completo, levantamientos olímpicos y cardio
  { slug: "kettlebell-swing", es: "Swing con kettlebell", en: "Kettlebell Swing", muscle: "full_body", secondary: ["glutes", "hamstrings"], equipment: "kettlebell", pattern: "hinge" },
  { slug: "turkish-get-up", es: "Levantamiento turco", en: "Turkish Get-Up", muscle: "full_body", secondary: ["shoulders", "abs"], equipment: "kettlebell", pattern: "core", laterality: "unilateral" },
  { slug: "barbell-thruster", es: "Thruster con barra", en: "Barbell Thruster", muscle: "full_body", secondary: ["quads", "shoulders"], equipment: "barbell", pattern: "squat" },
  { slug: "power-clean", es: "Cargada de potencia", en: "Power Clean", muscle: "full_body", secondary: ["back", "traps", "quads"], equipment: "barbell", pattern: "olympic" },
  { slug: "hang-clean", es: "Cargada colgante", en: "Hang Clean", muscle: "full_body", secondary: ["back", "traps", "quads"], equipment: "barbell", pattern: "olympic" },
  { slug: "clean-and-jerk", es: "Dos tiempos", en: "Clean and Jerk", muscle: "full_body", secondary: ["shoulders", "quads"], equipment: "barbell", pattern: "olympic" },
  { slug: "snatch", es: "Arranque", en: "Snatch", muscle: "full_body", secondary: ["shoulders", "back", "quads"], equipment: "barbell", pattern: "olympic" },
  { slug: "burpee", es: "Burpees", en: "Burpee", muscle: "full_body", secondary: ["chest", "quads"], equipment: "bodyweight", pattern: "plyometric", tracking: "reps_only" },
  { slug: "medicine-ball-slam", es: "Lanzamiento de balón medicinal al suelo", en: "Medicine Ball Slam", muscle: "full_body", secondary: ["abs", "shoulders"], equipment: "medicine_ball", pattern: "plyometric", tracking: "reps_only" },
  { slug: "wall-ball", es: "Wall ball", en: "Wall Ball", muscle: "full_body", secondary: ["quads", "shoulders"], equipment: "medicine_ball", pattern: "squat", tracking: "reps_only" },
  { slug: "battle-ropes", es: "Cuerdas de batalla", en: "Battle Ropes", muscle: "full_body", secondary: ["shoulders"], equipment: "other", pattern: "cardio", tracking: "duration" },
  { slug: "jump-rope", es: "Saltar la cuerda", en: "Jump Rope", muscle: "full_body", secondary: ["calves"], equipment: "other", pattern: "cardio", tracking: "duration" },
  { slug: "rowing-machine", es: "Remo ergómetro", en: "Rowing Machine", muscle: "full_body", equipment: "machine", pattern: "cardio", tracking: "distance" },
  { slug: "treadmill-run", es: "Correr en cinta", en: "Treadmill Run", muscle: "full_body", equipment: "machine", pattern: "cardio", tracking: "distance" },
  { slug: "outdoor-run", es: "Correr al aire libre", en: "Outdoor Run", muscle: "full_body", equipment: "other", pattern: "cardio", tracking: "distance" },
  { slug: "stationary-bike", es: "Bicicleta estática", en: "Stationary Bike", muscle: "full_body", equipment: "machine", pattern: "cardio", tracking: "duration" },
  { slug: "air-bike", es: "Bicicleta de aire", en: "Air Bike", muscle: "full_body", equipment: "machine", pattern: "cardio", tracking: "duration" },
  { slug: "elliptical", es: "Elíptica", en: "Elliptical", muscle: "full_body", equipment: "machine", pattern: "cardio", tracking: "duration" },
  { slug: "stair-climber", es: "Escaladora", en: "Stair Climber", muscle: "full_body", equipment: "machine", pattern: "cardio", tracking: "duration" },
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
    loadCount: entry.load ?? 1,
    notes: null,
  };
}
