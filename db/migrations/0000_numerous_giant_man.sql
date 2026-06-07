CREATE TABLE `audit_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`action` text NOT NULL,
	`entity` text,
	`entity_id` text,
	`meta_json` text,
	`ip` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `blog_post_translations` (
	`post_id` text NOT NULL,
	`locale` text NOT NULL,
	`title` text NOT NULL,
	`excerpt` text,
	`body` text,
	`seo_json` text,
	`published_at` text,
	PRIMARY KEY(`post_id`, `locale`),
	FOREIGN KEY (`post_id`) REFERENCES `blog_posts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `blog_posts` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`cover_url` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `blog_posts_slug_unique` ON `blog_posts` (`slug`);--> statement-breakpoint
CREATE TABLE `campaigns` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`subject` text NOT NULL,
	`template_id` text,
	`segment_id` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`locale` text,
	`scheduled_at` text,
	`sent_at` text,
	`stats_json` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`template_id`) REFERENCES `email_templates`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`segment_id`) REFERENCES `segments`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `contact_notes` (
	`id` text PRIMARY KEY NOT NULL,
	`contact_id` text NOT NULL,
	`author_id` text,
	`body` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`contact_id`) REFERENCES `contacts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `contact_tags` (
	`contact_id` text NOT NULL,
	`tag_id` text NOT NULL,
	PRIMARY KEY(`contact_id`, `tag_id`),
	FOREIGN KEY (`contact_id`) REFERENCES `contacts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `contacts` (
	`id` text PRIMARY KEY NOT NULL,
	`first_name` text,
	`last_name` text,
	`email` text NOT NULL,
	`phone` text,
	`country` text,
	`locale` text DEFAULT 'fr' NOT NULL,
	`status` text DEFAULT 'lead' NOT NULL,
	`source` text,
	`email_consent` integer DEFAULT false NOT NULL,
	`orders_count` integer DEFAULT 0 NOT NULL,
	`total_spent` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `contacts_email_unique` ON `contacts` (`email`);--> statement-breakpoint
CREATE TABLE `email_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`campaign_id` text,
	`contact_id` text,
	`type` text NOT NULL,
	`resend_id` text,
	`status` text,
	`opened_at` text,
	`clicked_at` text,
	`bounced_at` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`campaign_id`) REFERENCES `campaigns`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`contact_id`) REFERENCES `contacts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `email_templates` (
	`id` text PRIMARY KEY NOT NULL,
	`key` text NOT NULL,
	`name` text NOT NULL,
	`locale` text NOT NULL,
	`subject` text NOT NULL,
	`html` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `media_assets` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text,
	`url` text NOT NULL,
	`alt` text,
	`position` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`variant_id` text,
	`name_snapshot` text NOT NULL,
	`unit_price` integer NOT NULL,
	`qty` integer DEFAULT 1 NOT NULL,
	`custom_text` text,
	`production_status` text,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`variant_id`) REFERENCES `product_variants`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`number` text NOT NULL,
	`contact_id` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`subtotal` integer DEFAULT 0 NOT NULL,
	`shipping` integer DEFAULT 0 NOT NULL,
	`tax` integer DEFAULT 0 NOT NULL,
	`total` integer DEFAULT 0 NOT NULL,
	`currency` text DEFAULT 'EUR' NOT NULL,
	`locale` text DEFAULT 'fr' NOT NULL,
	`shipping_address_json` text,
	`stripe_session_id` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`contact_id`) REFERENCES `contacts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `orders_number_unique` ON `orders` (`number`);--> statement-breakpoint
CREATE TABLE `pages` (
	`key` text NOT NULL,
	`locale` text NOT NULL,
	`title` text,
	`body` text,
	`seo_json` text,
	`status` text DEFAULT 'draft' NOT NULL,
	PRIMARY KEY(`key`, `locale`)
);
--> statement-breakpoint
CREATE TABLE `permissions` (
	`id` text PRIMARY KEY NOT NULL,
	`key` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `permissions_key_unique` ON `permissions` (`key`);--> statement-breakpoint
CREATE TABLE `product_translations` (
	`product_id` text NOT NULL,
	`locale` text NOT NULL,
	`name` text NOT NULL,
	`short_desc` text,
	`long_desc` text,
	PRIMARY KEY(`product_id`, `locale`),
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `product_variants` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`sku` text NOT NULL,
	`name` text,
	`price` integer NOT NULL,
	`stock` integer DEFAULT 0 NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `product_variants_sku_unique` ON `product_variants` (`sku`);--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`category` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`featured` integer DEFAULT false NOT NULL,
	`customizable` integer DEFAULT false NOT NULL,
	`base_price` integer NOT NULL,
	`currency` text DEFAULT 'EUR' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `products_slug_unique` ON `products` (`slug`);--> statement-breakpoint
CREATE TABLE `role_permissions` (
	`role_id` text NOT NULL,
	`permission_id` text NOT NULL,
	PRIMARY KEY(`role_id`, `permission_id`),
	FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `roles` (
	`id` text PRIMARY KEY NOT NULL,
	`key` text NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `roles_key_unique` ON `roles` (`key`);--> statement-breakpoint
CREATE TABLE `segments` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`definition_json` text
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value_json` text
);
--> statement-breakpoint
CREATE TABLE `stock_movements` (
	`id` text PRIMARY KEY NOT NULL,
	`variant_id` text NOT NULL,
	`delta` integer NOT NULL,
	`reason` text,
	`author_id` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`variant_id`) REFERENCES `product_variants`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `tags` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`color` text
);
--> statement-breakpoint
CREATE TABLE `testimonials` (
	`id` text PRIMARY KEY NOT NULL,
	`author` text NOT NULL,
	`country` text,
	`locale` text NOT NULL,
	`body` text NOT NULL,
	`rating` integer,
	`published` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE `translations` (
	`namespace` text NOT NULL,
	`key` text NOT NULL,
	`locale` text NOT NULL,
	`value` text NOT NULL,
	PRIMARY KEY(`namespace`, `key`, `locale`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`name` text NOT NULL,
	`locale` text DEFAULT 'fr' NOT NULL,
	`role_id` text,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);