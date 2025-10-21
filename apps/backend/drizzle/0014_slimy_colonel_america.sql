CREATE TABLE `cache` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`cache_key` text,
	`cache_value` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer,
	`expires_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `cache_cache_key_unique` ON `cache` (`cache_key`);--> statement-breakpoint
CREATE INDEX `expireIndex` ON `cache` (`expires_at`);