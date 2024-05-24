CREATE TABLE `storage_tags` (
	`storage_id` integer NOT NULL,
	`tag_id` integer NOT NULL,
	PRIMARY KEY(`storage_id`, `tag_id`),
	FOREIGN KEY (`storage_id`) REFERENCES `storages`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `storages` (
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
CREATE TABLE `tags` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `storages_name_unique` ON `storages` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `tags_name_unique` ON `tags` (`name`);