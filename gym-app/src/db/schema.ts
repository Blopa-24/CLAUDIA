// Esquema de SQLite (docs/propuesta-inicial.md, sección 3). Cambiarlo exige una migración nueva:
// `npm run db:generate`. Nunca edites una migración ya publicada.
//
// Convenciones:
// - IDs de texto. Los ejercicios incluidos usan `system:<slug>`, estable entre teléfonos; lo que
//   crea la persona usa UUID (M3 en adelante).
// - Fechas en milisegundos UTC. `deleted_at` marca el borrado lógico: el historial nunca queda
//   apuntando a algo que ya no existe.
// - El peso se guarda en kg sin redondear, junto a la unidad en que se ingresó.
// - Los CHECK son la última red contra datos corruptos; la validación con mensajes vive en los
//   servicios.

import { sql } from "drizzle-orm";
import {
  type AnySQLiteColumn,
  check,
  index,
  integer,
  real,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

import {
  EQUIPMENT,
  LATERALITIES,
  MOVEMENT_PATTERNS,
  MUSCLES,
  type Muscle,
  TRACKING_TYPES,
} from "@/domain/exercise";
import type { LoadCount, SetType } from "@/domain/types";
import type { WeightUnit } from "@/domain/units";
import type { SessionStatus } from "@/domain/workout-session";

const SESSION_STATUSES = [
  "planned",
  "active",
  "paused",
  "completed",
  "abandoned",
] as const satisfies readonly SessionStatus[];
const SET_TYPES = [
  "warmup",
  "working",
  "dropset",
  "failure",
  "amrap",
] as const satisfies readonly SetType[];
const WEIGHT_UNITS = ["kg", "lb"] as const satisfies readonly WeightUnit[];

/** Límites de la propuesta, sección 3.4. */
export const LIMITS = { maxWeightKg: 1500, maxRir: 10, minRpe: 1, maxRpe: 10 } as const;

const timestamps = {
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
  deletedAt: integer("deleted_at"),
};

/** `columna IN ('a', 'b')` para los CHECK de valores permitidos. */
const oneOf = (column: AnySQLiteColumn, values: readonly string[]) =>
  sql`${column} IN (${sql.raw(values.map((value) => `'${value}'`).join(", "))})`;

export const exercises = sqliteTable(
  "exercises",
  {
    id: text("id").primaryKey(),
    slug: text("slug").unique(),
    nameEs: text("name_es").notNull(),
    nameEn: text("name_en").notNull(),
    isCustom: integer("is_custom", { mode: "boolean" }).notNull(),
    primaryMuscle: text("primary_muscle", { enum: MUSCLES }).notNull(),
    secondaryMuscles: text("secondary_muscles", { mode: "json" })
      .$type<Muscle[]>()
      .notNull()
      .default(sql`'[]'`),
    equipment: text("equipment", { enum: EQUIPMENT }).notNull(),
    movementPattern: text("movement_pattern", { enum: MOVEMENT_PATTERNS }).notNull(),
    laterality: text("laterality", { enum: LATERALITIES }).notNull(),
    trackingType: text("tracking_type", { enum: TRACKING_TYPES }).notNull(),
    /** Cargas iguales que se mueven a la vez (dos mancuernas = 2); se anota el peso de una. */
    loadCount: integer("load_count").$type<LoadCount>().notNull().default(1),
    notes: text("notes"),
    ...timestamps,
  },
  (table) => [
    check("exercises_primary_muscle", oneOf(table.primaryMuscle, MUSCLES)),
    check("exercises_equipment", oneOf(table.equipment, EQUIPMENT)),
    check("exercises_movement_pattern", oneOf(table.movementPattern, MOVEMENT_PATTERNS)),
    check("exercises_laterality", oneOf(table.laterality, LATERALITIES)),
    check("exercises_tracking_type", oneOf(table.trackingType, TRACKING_TYPES)),
    check("exercises_load_count", sql`${table.loadCount} IN (1, 2)`),
    check(
      "exercises_names",
      sql`length(trim(${table.nameEs})) > 0 AND length(trim(${table.nameEn})) > 0`,
    ),
  ],
);

/** Lo que realmente se hizo. Los campos de tiempo son los de `SessionTiming` del dominio. */
export const workoutSessions = sqliteTable(
  "workout_sessions",
  {
    id: text("id").primaryKey(),
    // La tabla de rutinas llega en M4; hasta entonces es un ID sin clave foránea.
    routineId: text("routine_id"),
    routineNameSnapshot: text("routine_name_snapshot"),
    status: text("status", { enum: SESSION_STATUSES }).notNull(),
    startedAt: integer("started_at"),
    endedAt: integer("ended_at"),
    pausedAt: integer("paused_at"),
    pausedMs: integer("paused_ms").notNull().default(0),
    notes: text("notes"),
    ...timestamps,
  },
  (table) => [
    index("workout_sessions_started_at").on(table.startedAt),
    index("workout_sessions_status").on(table.status),
    check("workout_sessions_status", oneOf(table.status, SESSION_STATUSES)),
    // Uno planificado y abandonado tiene fin sin inicio.
    check(
      "workout_sessions_times",
      sql`${table.endedAt} IS NULL OR ${table.startedAt} IS NULL OR ${table.endedAt} >= ${table.startedAt}`,
    ),
    check("workout_sessions_paused_ms", sql`${table.pausedMs} >= 0`),
  ],
);

export const workoutExercises = sqliteTable(
  "workout_exercises",
  {
    id: text("id").primaryKey(),
    sessionId: text("session_id")
      .notNull()
      .references(() => workoutSessions.id, { onDelete: "cascade" }),
    // RESTRICT: un ejercicio usado nunca se borra de verdad, solo se marca con deleted_at.
    exerciseId: text("exercise_id")
      .notNull()
      .references(() => exercises.id, { onDelete: "restrict" }),
    exerciseNameSnapshot: text("exercise_name_snapshot").notNull(),
    position: integer("position").notNull(),
    supersetGroup: integer("superset_group"),
    /** Cuándo se terminó el ejercicio en el entrenamiento; null mientras se está haciendo. */
    completedAt: integer("completed_at"),
    // Objetivos copiados de la rutina al empezar (null en un entrenamiento libre). Sin CHECK para
    // poder agregarlos con ALTER TABLE; los valida el dominio (validateTarget).
    targetSets: integer("target_sets"),
    targetRepsMin: integer("target_reps_min"),
    targetRepsMax: integer("target_reps_max"),
    targetRir: integer("target_rir"),
    restS: integer("rest_s"),
    notes: text("notes"),
    ...timestamps,
  },
  (table) => [
    index("workout_exercises_session_id").on(table.sessionId),
    index("workout_exercises_exercise_id").on(table.exerciseId),
  ],
);

export const sets = sqliteTable(
  "sets",
  {
    id: text("id").primaryKey(),
    workoutExerciseId: text("workout_exercise_id")
      .notNull()
      .references(() => workoutExercises.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
    type: text("type", { enum: SET_TYPES }).notNull(),
    weightKg: real("weight_kg"),
    enteredUnit: text("entered_unit", { enum: WEIGHT_UNITS }),
    reps: integer("reps"),
    rir: integer("rir"),
    rpe: real("rpe"),
    durationS: integer("duration_s"),
    distanceM: real("distance_m"),
    restS: integer("rest_s"),
    completedAt: integer("completed_at"),
    /** Enlaza cada tramo de un dropset con su serie principal. */
    parentSetId: text("parent_set_id").references((): AnySQLiteColumn => sets.id, {
      onDelete: "cascade",
    }),
    notes: text("notes"),
    ...timestamps,
  },
  (table) => [
    index("sets_workout_exercise_id").on(table.workoutExerciseId),
    check("sets_type", oneOf(table.type, SET_TYPES)),
    check(
      "sets_entered_unit",
      sql`${table.enteredUnit} IS NULL OR ${oneOf(table.enteredUnit, WEIGHT_UNITS)}`,
    ),
    check(
      "sets_weight",
      sql`${table.weightKg} IS NULL OR (${table.weightKg} >= 0 AND ${table.weightKg} <= ${sql.raw(String(LIMITS.maxWeightKg))})`,
    ),
    check("sets_reps", sql`${table.reps} IS NULL OR ${table.reps} >= 0`),
    check(
      "sets_rir",
      sql`${table.rir} IS NULL OR (${table.rir} >= 0 AND ${table.rir} <= ${sql.raw(String(LIMITS.maxRir))})`,
    ),
    // RPE de 1 a 10 en pasos de 0,5.
    check(
      "sets_rpe",
      sql`${table.rpe} IS NULL OR (${table.rpe} >= ${sql.raw(String(LIMITS.minRpe))} AND ${table.rpe} <= ${sql.raw(String(LIMITS.maxRpe))} AND ${table.rpe} * 2 = CAST(${table.rpe} * 2 AS INTEGER))`,
    ),
    check("sets_duration", sql`${table.durationS} IS NULL OR ${table.durationS} >= 0`),
    check("sets_distance", sql`${table.distanceM} IS NULL OR ${table.distanceM} >= 0`),
    check("sets_rest", sql`${table.restS} IS NULL OR ${table.restS} >= 0`),
  ],
);

/** Plantillas de entrenamiento. Borrarlas es lógico; los entrenamientos guardan su nombre aparte. */
export const routines = sqliteTable(
  "routines",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    notes: text("notes"),
    position: integer("position").notNull(),
    ...timestamps,
  },
  (table) => [check("routines_name", sql`length(trim(${table.name})) > 0`)],
);

export const routineExercises = sqliteTable(
  "routine_exercises",
  {
    id: text("id").primaryKey(),
    routineId: text("routine_id")
      .notNull()
      .references(() => routines.id, { onDelete: "cascade" }),
    exerciseId: text("exercise_id")
      .notNull()
      .references(() => exercises.id, { onDelete: "restrict" }),
    position: integer("position").notNull(),
    supersetGroup: integer("superset_group"),
    targetSets: integer("target_sets"),
    targetRepsMin: integer("target_reps_min"),
    targetRepsMax: integer("target_reps_max"),
    targetRir: integer("target_rir"),
    restS: integer("rest_s"),
    notes: text("notes"),
    ...timestamps,
  },
  (table) => [
    index("routine_exercises_routine_id").on(table.routineId),
    check(
      "routine_exercises_sets",
      sql`${table.targetSets} IS NULL OR (${table.targetSets} >= 1 AND ${table.targetSets} <= 20)`,
    ),
    check(
      "routine_exercises_reps",
      sql`(${table.targetRepsMin} IS NULL AND ${table.targetRepsMax} IS NULL) OR (${table.targetRepsMin} >= 1 AND ${table.targetRepsMax} >= ${table.targetRepsMin} AND ${table.targetRepsMax} <= 100)`,
    ),
    check(
      "routine_exercises_rir",
      sql`${table.targetRir} IS NULL OR (${table.targetRir} >= 0 AND ${table.targetRir} <= 10)`,
    ),
    check(
      "routine_exercises_rest",
      sql`${table.restS} IS NULL OR (${table.restS} >= 0 AND ${table.restS} <= 900)`,
    ),
  ],
);

export type ExerciseRow = typeof exercises.$inferSelect;
export type NewExerciseRow = typeof exercises.$inferInsert;
