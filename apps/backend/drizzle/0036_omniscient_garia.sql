CREATE TABLE `guest_upload_likes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`upload_id` text NOT NULL,
	`user_id` text NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`upload_id`) REFERENCES `guest_uploads`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `upload_like` ON `guest_upload_likes` (`upload_id`,`user_id`);--> statement-breakpoint
ALTER TABLE `user_rooms` ADD `last_read_message_id` integer REFERENCES messages(id);--> statement-breakpoint
CREATE INDEX `last_msg_idx` ON `user_rooms` (`last_read_message_id`);--> statement-breakpoint
ALTER TABLE `users` ADD `food_type` text;