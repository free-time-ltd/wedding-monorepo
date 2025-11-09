DROP INDEX `answer_index`;--> statement-breakpoint
CREATE INDEX `answer_poll_index` ON `poll_answers` (`poll_id`,`answer`);