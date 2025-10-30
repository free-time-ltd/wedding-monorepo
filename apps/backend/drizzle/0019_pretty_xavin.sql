CREATE TABLE `newsletter` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`user_id` text,
	`created_at` integer
);
