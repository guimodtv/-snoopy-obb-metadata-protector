CREATE TABLE `clicks` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`linkId` int NOT NULL,
	`userId` int NOT NULL,
	`ipAddress` varchar(45) NOT NULL,
	`userAgent` text,
	`referrer` text,
	`isValid` boolean NOT NULL DEFAULT true,
	`fraudReason` varchar(255),
	`earningsGenerated` decimal(12,2) NOT NULL DEFAULT '0.00',
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `clicks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fraud_attempts` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`linkId` int,
	`userId` int,
	`ipAddress` varchar(45) NOT NULL,
	`fraudType` varchar(64) NOT NULL,
	`details` text,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `fraud_attempts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `referrals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`referrerId` int NOT NULL,
	`referredUserId` int NOT NULL,
	`totalCommissionEarned` decimal(12,2) NOT NULL DEFAULT '0.00',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `referrals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cpm` decimal(10,4) NOT NULL DEFAULT '0.50',
	`referralCommissionPercentage` decimal(5,2) NOT NULL DEFAULT '30.00',
	`minimumWithdrawal` decimal(12,2) NOT NULL DEFAULT '10.00',
	`maxClicksPerIpPerHour` int NOT NULL DEFAULT 5,
	`isSystemActive` boolean NOT NULL DEFAULT true,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `settings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `short_links` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`originalUrl` text NOT NULL,
	`shortCode` varchar(32) NOT NULL,
	`clicks` int NOT NULL DEFAULT 0,
	`validClicks` int NOT NULL DEFAULT 0,
	`earnings` decimal(12,2) NOT NULL DEFAULT '0.00',
	`title` varchar(255),
	`description` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `short_links_id` PRIMARY KEY(`id`),
	CONSTRAINT `short_links_shortCode_unique` UNIQUE(`shortCode`),
	CONSTRAINT `shortCode_idx` UNIQUE(`shortCode`)
);
--> statement-breakpoint
CREATE TABLE `withdrawals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`amount` decimal(12,2) NOT NULL,
	`status` enum('pending','paid','rejected') NOT NULL DEFAULT 'pending',
	`notes` text,
	`requestedAt` timestamp NOT NULL DEFAULT (now()),
	`processedAt` timestamp,
	`processedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `withdrawals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `email` varchar(320) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `passwordHash` text;--> statement-breakpoint
ALTER TABLE `users` ADD `balance` decimal(12,2) DEFAULT '0.00' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `totalEarnings` decimal(12,2) DEFAULT '0.00' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `totalClicks` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `referrerId` int;--> statement-breakpoint
ALTER TABLE `users` ADD `referralCode` varchar(32);--> statement-breakpoint
ALTER TABLE `users` ADD `referralCommissionEarned` decimal(12,2) DEFAULT '0.00' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `apiKey` varchar(64);--> statement-breakpoint
ALTER TABLE `users` ADD `apiKeyCreatedAt` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `isActive` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_email_unique` UNIQUE(`email`);--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_referralCode_unique` UNIQUE(`referralCode`);--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_apiKey_unique` UNIQUE(`apiKey`);--> statement-breakpoint
CREATE INDEX `linkId_idx` ON `clicks` (`linkId`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `clicks` (`userId`);--> statement-breakpoint
CREATE INDEX `ipAddress_idx` ON `clicks` (`ipAddress`);--> statement-breakpoint
CREATE INDEX `timestamp_idx` ON `clicks` (`timestamp`);--> statement-breakpoint
CREATE INDEX `linkId_idx` ON `fraud_attempts` (`linkId`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `fraud_attempts` (`userId`);--> statement-breakpoint
CREATE INDEX `ipAddress_idx` ON `fraud_attempts` (`ipAddress`);--> statement-breakpoint
CREATE INDEX `referrerId_idx` ON `referrals` (`referrerId`);--> statement-breakpoint
CREATE INDEX `referredUserId_idx` ON `referrals` (`referredUserId`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `short_links` (`userId`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `withdrawals` (`userId`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `withdrawals` (`status`);--> statement-breakpoint
CREATE INDEX `referrerId_idx` ON `users` (`referrerId`);--> statement-breakpoint
CREATE INDEX `apiKey_idx` ON `users` (`apiKey`);--> statement-breakpoint
CREATE INDEX `email_idx` ON `users` (`email`);