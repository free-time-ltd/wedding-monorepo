CREATE TABLE `families` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`created_at` integer
);
--> statement-breakpoint
ALTER TABLE `users` ADD `family_id` integer REFERENCES families(id);