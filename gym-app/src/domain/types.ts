// Tipos del dominio (skill gym-domain). No dependen de la UI ni de la base de datos.

export type SetType = "warmup" | "working" | "dropset" | "failure" | "amrap";

/** Qué registra un ejercicio: define qué campos de la serie tienen sentido. */
export type TrackingType = "weight_reps" | "reps_only" | "duration" | "distance";

export type Laterality = "bilateral" | "unilateral";

/**
 * Cuántas cargas iguales se mueven a la vez. Se anota el peso de UNA: dos mancuernas de 30 kg se
 * anotan "30 kg" con loadCount 2. Una barra, una máquina o una sola mancuerna: 1.
 */
export type LoadCount = 1 | 2;

export interface ExerciseTracking {
  trackingType: TrackingType;
  laterality: Laterality;
  loadCount: LoadCount;
}

/** Lo que realmente se hizo en una serie. Los campos que no aplican quedan en null. */
export interface SetPerformance {
  type: SetType;
  weightKg: number | null;
  reps: number | null;
  completed: boolean;
}
