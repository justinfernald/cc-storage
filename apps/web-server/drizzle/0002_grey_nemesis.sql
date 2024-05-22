CREATE TABLE `storage_tags` (
	`storage_id` integer,
	`tag_id` integer,
	PRIMARY KEY(`storage_id`, `tag_id`),
	FOREIGN KEY (`storage_id`) REFERENCES `storages`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
ALTER TABLE `users` RENAME TO `storages`;--> statement-breakpoint
DROP INDEX IF EXISTS `users_name_unique`;--> statement-breakpoint
CREATE UNIQUE INDEX `storages_name_unique` ON `storages` (`name`);