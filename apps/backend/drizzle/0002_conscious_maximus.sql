ALTER TABLE `rooms` ADD `created_by` text REFERENCES users(id);--> statement-breakpoint
ALTER TABLE `rooms` ADD `created_at` integer;