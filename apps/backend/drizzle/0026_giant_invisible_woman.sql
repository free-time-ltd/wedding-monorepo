PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_poll_answers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`poll_id` text NOT NULL,
	`answer` text NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`poll_id`) REFERENCES `polls`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`answer`) REFERENCES `poll_options`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_poll_answers`("id", "user_id", "poll_id", "answer", "created_at") SELECT "id", "user_id", "poll_id", "answer", "created_at" FROM `poll_answers`;--> statement-breakpoint
DROP TABLE `poll_answers`;--> statement-breakpoint
ALTER TABLE `__new_poll_answers` RENAME TO `poll_answers`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `answer_index` ON `poll_answers` (`poll_id`,`answer`);--> statement-breakpoint
CREATE UNIQUE INDEX `userpoll_index` ON `poll_answers` (`user_id`,`poll_id`);