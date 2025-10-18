CREATE TABLE `guest_uploads` (
	`id` text PRIMARY KEY NOT NULL,
	`s3_key` text NOT NULL,
	`user_id` text NOT NULL,
	`url` text,
	`message` text,
	`created_at` integer,
	`status` text DEFAULT 'pending',
	`width` integer,
	`height` integer,
	`size_bytes` integer,
	`mime_type` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `guest_uploads_user_id_unique` ON `guest_uploads` (`user_id`);--> statement-breakpoint
CREATE TABLE `official_photos` (
	`id` text PRIMARY KEY NOT NULL,
	`s3_key` text NOT NULL,
	`url` text,
	`title` text NOT NULL,
	`description` text,
	`created_at` integer,
	`width` integer,
	`height` integer,
	`size_bytes` integer,
	`mime_type` text
);
