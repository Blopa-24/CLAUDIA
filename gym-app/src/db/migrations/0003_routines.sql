CREATE TABLE `routine_exercises` (
	`id` text PRIMARY KEY NOT NULL,
	`routine_id` text NOT NULL,
	`exercise_id` text NOT NULL,
	`position` integer NOT NULL,
	`superset_group` integer,
	`target_sets` integer,
	`target_reps_min` integer,
	`target_reps_max` integer,
	`target_rir` integer,
	`rest_s` integer,
	`notes` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer,
	FOREIGN KEY (`routine_id`) REFERENCES `routines`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "routine_exercises_sets" CHECK("routine_exercises"."target_sets" IS NULL OR ("routine_exercises"."target_sets" >= 1 AND "routine_exercises"."target_sets" <= 20)),
	CONSTRAINT "routine_exercises_reps" CHECK(("routine_exercises"."target_reps_min" IS NULL AND "routine_exercises"."target_reps_max" IS NULL) OR ("routine_exercises"."target_reps_min" >= 1 AND "routine_exercises"."target_reps_max" >= "routine_exercises"."target_reps_min" AND "routine_exercises"."target_reps_max" <= 100)),
	CONSTRAINT "routine_exercises_rir" CHECK("routine_exercises"."target_rir" IS NULL OR ("routine_exercises"."target_rir" >= 0 AND "routine_exercises"."target_rir" <= 10)),
	CONSTRAINT "routine_exercises_rest" CHECK("routine_exercises"."rest_s" IS NULL OR ("routine_exercises"."rest_s" >= 0 AND "routine_exercises"."rest_s" <= 900))
);
--> statement-breakpoint
CREATE INDEX `routine_exercises_routine_id` ON `routine_exercises` (`routine_id`);--> statement-breakpoint
CREATE TABLE `routines` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`notes` text,
	`position` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer,
	CONSTRAINT "routines_name" CHECK(length(trim("routines"."name")) > 0)
);
--> statement-breakpoint
ALTER TABLE `workout_exercises` ADD `target_sets` integer;--> statement-breakpoint
ALTER TABLE `workout_exercises` ADD `target_reps_min` integer;--> statement-breakpoint
ALTER TABLE `workout_exercises` ADD `target_reps_max` integer;--> statement-breakpoint
ALTER TABLE `workout_exercises` ADD `target_rir` integer;--> statement-breakpoint
ALTER TABLE `workout_exercises` ADD `rest_s` integer;