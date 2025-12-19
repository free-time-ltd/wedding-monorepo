CREATE TABLE `guestbook_likes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`guestbook_id` integer NOT NULL,
	`user_id` text NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`guestbook_id`) REFERENCES `guest_book`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `vote` ON `guestbook_likes` (`guestbook_id`,`user_id`);--> statement-breakpoint
CREATE TABLE `guest_book` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`title` text,
	`message` text,
	`is_private` integer,
	`is_approved` integer DEFAULT false,
	`likes` integer DEFAULT 0,
	`created_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `search_idx` ON `guest_book` (`is_private`,`is_approved`);--> statement-breakpoint
CREATE TABLE `hotels` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text,
	`distance` text,
	`website_url` text,
	`created_at` integer
);
