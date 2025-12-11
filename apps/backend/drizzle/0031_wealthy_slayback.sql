ALTER TABLE `users_extra` RENAME TO `invitation_users`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_invitation_users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`invitation_id` integer,
	`user_id` text,
	`invited_user_id` text,
	`created_at` integer,
	FOREIGN KEY (`invitation_id`) REFERENCES `invitations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`invited_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_invitation_users`("id", "invitation_id", "user_id", "invited_user_id", "created_at") SELECT "id", "invitation_id", "user_id", "invited_user_id", "created_at" FROM `invitation_users`;--> statement-breakpoint
DROP TABLE `invitation_users`;--> statement-breakpoint
ALTER TABLE `__new_invitation_users` RENAME TO `invitation_users`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `invite_idx` ON `invitation_users` (`invitation_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_uniq_key` ON `invitation_users` (`user_id`,`invited_user_id`);--> statement-breakpoint
ALTER TABLE `invitations` ADD `plus_one_names` text;