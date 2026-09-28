// Tipos del dominio (skill gym-domain). No dependen de la UI ni de la base de datos.

export type SetType = "warmup" | "working" | "dropset" | "failure" | "amrap";

/** Qué registra un ejercicio: define qué campos de la serie tienen sentido. */
export type TrackingType = "weight_reps" | "reps_only" | "duration" | "distance";

export type Laterality = "bilateral" | "unilateral";

export interface ExerciseTracking {
  trackingType: TrackingType;
  laterality: Laterality;
}

/** Lo que realmente se hizo en una serie. Los campos que no aplican quedan en null. */
export interface SetPerformance {
  type: SetType;
  weightKg: number | null;
  reps: number | null;
  completed: boolean;
}
