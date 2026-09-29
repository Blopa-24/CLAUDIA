-- Rehace la tabla exercises para ampliar los valores permitidos y agregar load_count.
-- Corregido a mano sobre lo que generó drizzle-kit: copiaba load_count desde la tabla vieja (no
-- existe) y dejaba los CHECK apuntando a __new_exercises. Las claves foráneas se desactivan fuera
-- de la transacción en src/db/migrator.ts, como pide SQLite para rehacer tablas.
CREATE TABLE `__new_exercises` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text,
	`name_es` text NOT NULL,
	`name_en` text NOT NULL,
	`is_custom` integer NOT NULL,
	`primary_muscle` text NOT NULL,
	`secondary_muscles` text DEFAULT '[]' NOT NULL,
	`equipment` text NOT NULL,
	`movement_pattern` text NOT NULL,
	`laterality` text NOT NULL,
	`tracking_type` text NOT NULL,
	`load_count` integer DEFAULT 1 NOT NULL,
	`notes` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer,
	CONSTRAINT "exercises_primary_muscle" CHECK("primary_muscle" IN ('chest', 'back', 'lower_back', 'traps', 'shoulders', 'biceps', 'triceps', 'forearms', 'abs', 'quads', 'hamstrings', 'glutes', 'adductors', 'abductors', 'calves', 'tibialis', 'full_body')),
	CONSTRAINT "exercises_equipment" CHECK("equipment" IN ('barbell', 'ez_bar', 'trap_bar', 'dumbbell', 'machine', 'cable', 'smith_machine', 'kettlebell', 'landmine', 'plate', 'medicine_ball', 'band', 'suspension', 'bodyweight', 'other')),
	CONSTRAINT "exercises_movement_pattern" CHECK("movement_pattern" IN ('horizontal_push', 'vertical_push', 'horizontal_pull', 'vertical_pull', 'squat', 'hinge', 'lunge', 'carry', 'isolation', 'core', 'olympic', 'plyometric', 'cardio')),
	CONSTRAINT "exercises_laterality" CHECK("laterality" IN ('bilateral', 'unilateral')),
	CONSTRAINT "exercises_tracking_type" CHECK("tracking_type" IN ('weight_reps', 'reps_only', 'duration', 'distance')),
	CONSTRAINT "exercises_load_count" CHECK("load_count" IN (1, 2)),
	CONSTRAINT "exercises_names" CHECK(length(trim("name_es")) > 0 AND length(trim("name_en")) > 0)
);
--> statement-breakpoint
INSERT INTO `__new_exercises`("id", "slug", "name_es", "name_en", "is_custom", "primary_muscle", "secondary_muscles", "equipment", "movement_pattern", "laterality", "tracking_type", "notes", "created_at", "updated_at", "deleted_at") SELECT "id", "slug", "name_es", "name_en", "is_custom", "primary_muscle", "secondary_muscles", "equipment", "movement_pattern", "laterality", "tracking_type", "notes", "created_at", "updated_at", "deleted_at" FROM `exercises`;--> statement-breakpoint
DROP TABLE `exercises`;--> statement-breakpoint
ALTER TABLE `__new_exercises` RENAME TO `exercises`;--> statement-breakpoint
CREATE UNIQUE INDEX `exercises_slug_unique` ON `exercises` (`slug`);