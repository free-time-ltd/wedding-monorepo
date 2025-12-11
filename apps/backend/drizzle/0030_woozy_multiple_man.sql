DROP INDEX `userPairKey`;--> statement-breakpoint
CREATE UNIQUE INDEX `userPairKey` ON `users_extra` (`user_id`,`invited_user_id`);