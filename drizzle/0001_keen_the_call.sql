CREATE TABLE `fee_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentName` varchar(150) NOT NULL,
	`rollNumber` varchar(80) NOT NULL,
	`course` varchar(150) NOT NULL,
	`amount` decimal(12,2) NOT NULL,
	`status` enum('Paid','Pending') NOT NULL DEFAULT 'Pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `fee_records_id` PRIMARY KEY(`id`)
);
