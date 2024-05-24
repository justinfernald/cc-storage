CREATE TABLE `users` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`display_name` text,
	`location_x` integer,
	`location_y` integer,
	`location_z` integer,
	`location_world` text,
	`description` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_name_unique` ON `users` (`name`);