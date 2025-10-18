PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_invitations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`attending` integer,
	`plus_one` integer,
	`menu_choice` text,
	`transportation` text,
	`accommodation` integer,
	`notes` text,
	`views` integer DEFAULT 0,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_invitations`("id", "user_id", "attending", "plus_one", "menu_choice", "transportation", "accommodation", "notes", "views", "created_at") SELECT "id", "user_id", "attending", "plus_one", "menu_choice", "transportation", "accommodation", "notes", "views", "created_at" FROM `invitations`;--> statement-breakpoint
DROP TABLE `invitations`;--> statement-breakpoint
ALTER TABLE `__new_invitations` RENAME TO `invitations`;--> statement-breakpoint
PRAGMA foreign_keys=ON;