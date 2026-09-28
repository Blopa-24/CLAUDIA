CREATE TABLE `exercises` (
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
	`notes` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer,
	CONSTRAINT "exercises_primary_muscle" CHECK("exercises"."primary_muscle" IN ('chest', 'back', 'shoulders', 'biceps', 'triceps', 'forearms', 'abs', 'quads', 'hamstrings', 'glutes', 'calves', 'full_body')),
	CONSTRAINT "exercises_equipment" CHECK("exercises"."equipment" IN ('barbell', 'dumbbell', 'machine', 'cable', 'smith_machine', 'kettlebell', 'band', 'bodyweight', 'other')),
	CONSTRAINT "exercises_movement_pattern" CHECK("exercises"."movement_pattern" IN ('horizontal_push', 'vertical_push', 'horizontal_pull', 'vertical_pull', 'squat', 'hinge', 'lunge', 'carry', 'isolation', 'core', 'cardio')),
	CONSTRAINT "exercises_laterality" CHECK("exercises"."laterality" IN ('bilateral', 'unilateral')),
	CONSTRAINT "exercises_tracking_type" CHECK("exercises"."tracking_type" IN ('weight_reps', 'reps_only', 'duration', 'distance')),
	CONSTRAINT "exercises_names" CHECK(length(trim("exercises"."name_es")) > 0 AND length(trim("exercises"."name_en")) > 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `exercises_slug_unique` ON `exercises` (`slug`);--> statement-breakpoint
CREATE TABLE `sets` (
	`id` text PRIMARY KEY NOT NULL,
	`workout_exercise_id` text NOT NULL,
	`position` integer NOT NULL,
	`type` text NOT NULL,
	`weight_kg` real,
	`entered_unit` text,
	`reps` integer,
	`rir` integer,
	`rpe` real,
	`duration_s` integer,
	`distance_m` real,
	`rest_s` integer,
	`completed_at` integer,
	`parent_set_id` text,
	`notes` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer,
	FOREIGN KEY (`workout_exercise_id`) REFERENCES `workout_exercises`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`parent_set_id`) REFERENCES `sets`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "sets_type" CHECK("sets"."type" IN ('warmup', 'working', 'dropset', 'failure', 'amrap')),
	CONSTRAINT "sets_entered_unit" CHECK("sets"."entered_unit" IS NULL OR "sets"."entered_unit" IN ('kg', 'lb')),
	CONSTRAINT "sets_weight" CHECK("sets"."weight_kg" IS NULL OR ("sets"."weight_kg" >= 0 AND "sets"."weight_kg" <= 1500)),
	CONSTRAINT "sets_reps" CHECK("sets"."reps" IS NULL OR "sets"."reps" >= 0),
	CONSTRAINT "sets_rir" CHECK("sets"."rir" IS NULL OR ("sets"."rir" >= 0 AND "sets"."rir" <= 10)),
	CONSTRAINT "sets_rpe" CHECK("sets"."rpe" IS NULL OR ("sets"."rpe" >= 1 AND "sets"."rpe" <= 10 AND "sets"."rpe" * 2 = CAST("sets"."rpe" * 2 AS INTEGER))),
	CONSTRAINT "sets_duration" CHECK("sets"."duration_s" IS NULL OR "sets"."duration_s" >= 0),
	CONSTRAINT "sets_distance" CHECK("sets"."distance_m" IS NULL OR "sets"."distance_m" >= 0),
	CONSTRAINT "sets_rest" CHECK("sets"."rest_s" IS NULL OR "sets"."rest_s" >= 0)
);
--> statement-breakpoint
CREATE INDEX `sets_workout_exercise_id` ON `sets` (`workout_exercise_id`);--> statement-breakpoint
CREATE TABLE `workout_exercises` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`exercise_id` text NOT NULL,
	`exercise_name_snapshot` text NOT NULL,
	`position` integer NOT NULL,
	`superset_group` integer,
	`notes` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer,
	FOREIGN KEY (`session_id`) REFERENCES `workout_sessions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `workout_exercises_session_id` ON `workout_exercises` (`session_id`);--> statement-breakpoint
CREATE INDEX `workout_exercises_exercise_id` ON `workout_exercises` (`exercise_id`);--> statement-breakpoint
CREATE TABLE `workout_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`routine_id` text,
	`routine_name_snapshot` text,
	`status` text NOT NULL,
	`started_at` integer,
	`ended_at` integer,
	`paused_at` integer,
	`paused_ms` integer DEFAULT 0 NOT NULL,
	`notes` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer,
	CONSTRAINT "workout_sessions_status" CHECK("workout_sessions"."status" IN ('planned', 'active', 'paused', 'completed', 'abandoned')),
	CONSTRAINT "workout_sessions_times" CHECK("workout_sessions"."ended_at" IS NULL OR "workout_sessions"."started_at" IS NULL OR "workout_sessions"."ended_at" >= "workout_sessions"."started_at"),
	CONSTRAINT "workout_sessions_paused_ms" CHECK("workout_sessions"."paused_ms" >= 0)
);
--> statement-breakpoint
CREATE INDEX `workout_sessions_started_at` ON `workout_sessions` (`started_at`);--> statement-breakpoint
CREATE INDEX `workout_sessions_status` ON `workout_sessions` (`status`);