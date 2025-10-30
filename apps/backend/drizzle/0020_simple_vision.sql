PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_newsletter` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`user_id` text,
	`created_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_newsletter`("id", "email", "user_id", "created_at") SELECT "id", "email", "user_id", "created_at" FROM `newsletter`;--> statement-breakpoint
DROP TABLE `newsletter`;--> statement-breakpoint
ALTER TABLE `__new_newsletter` RENAME TO `newsletter`;--> statement-breakpoint
PRAGMA foreign_keys=ON;