CREATE TABLE `alerts` (
	`id` text PRIMARY KEY NOT NULL,
	`monitor_id` text NOT NULL,
	`type` text NOT NULL,
	`message` text NOT NULL,
	`acknowledged` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`monitor_id`) REFERENCES `monitors`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `monitor_id_created_at_idx` ON `alerts` (`monitor_id`,`created_at`);--> statement-breakpoint
ALTER TABLE `monitors` ADD `discord_webhook` text;