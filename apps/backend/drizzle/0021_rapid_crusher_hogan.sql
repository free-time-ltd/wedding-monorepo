ALTER TABLE `newsletter` ADD `updated_at` integer;--> statement-breakpoint
CREATE UNIQUE INDEX `newsletter_email_unique` ON `newsletter` (`email`);