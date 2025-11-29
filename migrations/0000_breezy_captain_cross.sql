CREATE TABLE `measurements` (
	`id` text PRIMARY KEY NOT NULL,
	`monitor_id` text NOT NULL,
	`location` text NOT NULL,
	`country` text,
	`city` text,
	`network_type` text,
	`status_code` integer,
	`latency` real NOT NULL,
	`status` text NOT NULL,
	`error_message` text,
	`timestamp` text NOT NULL,
	FOREIGN KEY (`monitor_id`) REFERENCES `monitors`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `monitor_id_timestamp_idx` ON `measurements` (`monitor_id`,`timestamp`);--> statement-breakpoint
CREATE TABLE `monitors` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`url` text NOT NULL,
	`interval` integer DEFAULT 300 NOT NULL,
	`locations` text NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
