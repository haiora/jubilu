CREATE TABLE `rate_limits` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`action` text NOT NULL,
	`count` integer DEFAULT 1 NOT NULL,
	`window_start` text NOT NULL,
	`expires_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `resend_webhook_events` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`email_log_id` text,
	`payload_json` text NOT NULL,
	`processed_at` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`email_log_id`) REFERENCES `email_logs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`token` text NOT NULL,
	`ip` text,
	`user_agent` text,
	`expires_at` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sessions_token_unique` ON `sessions` (`token`);