CREATE TABLE `accounts` (
	`id` text NOT NULL,
	`workspace_id` text NOT NULL,
	`name` text NOT NULL,
	`account_kind` text NOT NULL,
	`currency` text NOT NULL,
	`liquidity_class` text,
	`archived_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	PRIMARY KEY(`workspace_id`, `id`),
	FOREIGN KEY (`workspace_id`) REFERENCES `workspaces`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "accounts_kind_ck" CHECK("accounts"."account_kind" IN ('asset', 'liability', 'equity', 'income', 'expense')),
	CONSTRAINT "accounts_currency_ck" CHECK("accounts"."currency" IN ('CAD', 'CNY', 'JPY'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `accounts_workspace_id_currency_uq` ON `accounts` (`workspace_id`,`id`,`currency`);--> statement-breakpoint
CREATE INDEX `accounts_workspace_name_idx` ON `accounts` (`workspace_id`,`name`);--> statement-breakpoint
CREATE TABLE `journal_transactions` (
	`id` text NOT NULL,
	`workspace_id` text NOT NULL,
	`actor_id` text NOT NULL,
	`kind` text NOT NULL,
	`occurred_at` text NOT NULL,
	`status` text DEFAULT 'posted' NOT NULL,
	`description` text NOT NULL,
	`reversal_of_id` text,
	`idempotency_key` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	PRIMARY KEY(`workspace_id`, `id`),
	FOREIGN KEY (`workspace_id`) REFERENCES `workspaces`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`workspace_id`,`reversal_of_id`) REFERENCES `journal_transactions`(`workspace_id`,`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `journal_transactions_idempotency_uq` ON `journal_transactions` (`workspace_id`,`idempotency_key`);--> statement-breakpoint
CREATE INDEX `journal_transactions_workspace_occurred_idx` ON `journal_transactions` (`workspace_id`,`occurred_at`);--> statement-breakpoint
CREATE TABLE `memberships` (
	`workspace_id` text NOT NULL,
	`user_id` text NOT NULL,
	`role` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	PRIMARY KEY(`workspace_id`, `user_id`),
	FOREIGN KEY (`workspace_id`) REFERENCES `workspaces`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "memberships_role_ck" CHECK("memberships"."role" IN ('owner', 'editor', 'viewer'))
);
--> statement-breakpoint
CREATE TABLE `postings` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace_id` text NOT NULL,
	`transaction_id` text NOT NULL,
	`account_id` text NOT NULL,
	`side` text NOT NULL,
	`amount_minor` integer NOT NULL,
	`currency` text NOT NULL,
	FOREIGN KEY (`workspace_id`,`transaction_id`) REFERENCES `journal_transactions`(`workspace_id`,`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`workspace_id`,`account_id`,`currency`) REFERENCES `accounts`(`workspace_id`,`id`,`currency`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "postings_side_ck" CHECK("postings"."side" IN ('debit', 'credit')),
	CONSTRAINT "postings_amount_ck" CHECK(typeof("postings"."amount_minor") = 'integer' AND "postings"."amount_minor" > 0),
	CONSTRAINT "postings_currency_ck" CHECK("postings"."currency" IN ('CAD', 'CNY', 'JPY'))
);
--> statement-breakpoint
CREATE INDEX `postings_workspace_account_idx` ON `postings` (`workspace_id`,`account_id`);--> statement-breakpoint
CREATE INDEX `postings_workspace_transaction_idx` ON `postings` (`workspace_id`,`transaction_id`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email_normalized` text,
	`auth_provider_subject` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `workspaces` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`reporting_currency` text NOT NULL,
	`timezone` text NOT NULL,
	`created_by` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "workspaces_reporting_currency_ck" CHECK("workspaces"."reporting_currency" IN ('CAD', 'CNY', 'JPY'))
);
