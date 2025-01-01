-- CreateTable
CREATE TABLE `account` (
    `account_id` CHAR(36) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `avatar` VARCHAR(255) NULL,
    `role` ENUM('Owner', 'Employee', 'Guest') NOT NULL DEFAULT 'Employee',
    `phone` VARCHAR(50) NOT NULL,
    `is_verified` BIT(1) NOT NULL DEFAULT false,
    `created_at` DATETIME NOT NULL DEFAULT now(),
    `updated_at` DATETIME NOT NULL,
    `owner_id` CHAR(36) NULL,

    UNIQUE INDEX `account_email_key`(`email`),
    PRIMARY KEY (`account_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dish` (
    `dish_id` CHAR(36) NOT NULL,
    `dish_name` VARCHAR(255) NOT NULL,
    `price` DECIMAL(18, 4) NULL,
    `description` TEXT NULL,
    `image` VARCHAR(255) NULL,
    `status` ENUM('Available', 'Unavailable', 'Hidden') NOT NULL DEFAULT 'Available',
    `category` ENUM('Buffet', 'Paid', 'ComboBuffet', 'ComboPaid') NOT NULL DEFAULT 'Paid',
    `options` TEXT NULL,
    `created_at` DATETIME NOT NULL DEFAULT now(),
    `updated_at` DATETIME NOT NULL,
    `group_id` CHAR(36) NOT NULL,

    PRIMARY KEY (`dish_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dish_snapshot` (
    `snapshot_id` CHAR(36) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `price` DECIMAL(18, 4) NULL,
    `description` TEXT NULL,
    `image` VARCHAR(255) NULL,
    `status` ENUM('Available', 'Unavailable', 'Hidden') NOT NULL DEFAULT 'Available',
    `category` ENUM('Buffet', 'Paid', 'ComboBuffet', 'ComboPaid') NOT NULL DEFAULT 'Paid',
    `options` TEXT NULL,
    `created_at` DATETIME NOT NULL DEFAULT now(),
    `updated_at` DATETIME NOT NULL,
    `dish_id` CHAR(36) NOT NULL,

    PRIMARY KEY (`snapshot_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dish_combo` (
    `dish_id` CHAR(36) NOT NULL,
    `combo_id` CHAR(36) NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,

    UNIQUE INDEX `dish_combo_dish_id_combo_id_key`(`dish_id`, `combo_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dish_group` (
    `group_id` CHAR(36) NOT NULL,
    `group_name` VARCHAR(255) NOT NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME NOT NULL DEFAULT now(),
    `updated_at` DATETIME NOT NULL,

    UNIQUE INDEX `dish_group_group_name_key`(`group_name`),
    PRIMARY KEY (`group_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `table` (
    `table_id` CHAR(36) NOT NULL,
    `table_number` VARCHAR(50) NOT NULL,
    `paymentStatus` ENUM('Unpaid', 'Paid', 'Cancelled') NOT NULL DEFAULT 'Unpaid',
    `capacity` INTEGER NOT NULL DEFAULT 1,
    `status` ENUM('Available', 'Hidden', 'Reserved') NOT NULL DEFAULT 'Available',
    `token` VARCHAR(255) NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT now(),
    `updated_at` DATETIME NOT NULL,

    UNIQUE INDEX `table_table_number_key`(`table_number`),
    PRIMARY KEY (`table_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order` (
    `order_id` CHAR(36) NOT NULL,
    `options` TEXT NULL,
    `quantity` INTEGER NOT NULL,
    `status` ENUM('Pending', 'Processing', 'Rejected', 'Delivered', 'Paid') NOT NULL DEFAULT 'Pending',
    `created_at` DATETIME NOT NULL DEFAULT now(),
    `updated_at` DATETIME NOT NULL,
    `guest_id` CHAR(36) NULL,
    `table_number` VARCHAR(50) NOT NULL,
    `token` VARCHAR(255) NOT NULL,
    `order_handler_id` CHAR(36) NULL,
    `dish_snapshot_id` CHAR(36) NOT NULL,

    UNIQUE INDEX `order_dish_snapshot_id_key`(`dish_snapshot_id`),
    PRIMARY KEY (`order_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `refresh_token` (
    `token` VARCHAR(500) NOT NULL,
    `expires_at` DATETIME NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT now(),
    `account_id` CHAR(36) NOT NULL,

    PRIMARY KEY (`token`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `guest` (
    `guest_id` CHAR(36) NOT NULL,
    `refresh_token` VARCHAR(500) NULL,
    `expired_at` DATETIME NULL,
    `created_at` DATETIME NOT NULL DEFAULT now(),
    `updated_at` DATETIME NOT NULL,
    `table_number` VARCHAR(50) NOT NULL,
    `token` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `guest_refresh_token_key`(`refresh_token`),
    PRIMARY KEY (`guest_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `socket` (
    `socket_id` CHAR(36) NOT NULL,
    `guest_id` CHAR(36) NULL,
    `account_id` CHAR(36) NULL,

    UNIQUE INDEX `socket_guest_id_key`(`guest_id`),
    UNIQUE INDEX `socket_account_id_key`(`account_id`),
    PRIMARY KEY (`socket_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transaction` (
    `transaction_id` CHAR(36) NOT NULL,
    `id_sepay` INTEGER NOT NULL,
    `gateway` VARCHAR(100) NOT NULL,
    `transaction_date` DATETIME NOT NULL DEFAULT now(),
    `account_number` VARCHAR(100) NULL,
    `sub_account` VARCHAR(250) NULL,
    `amount_in` DECIMAL(18, 4) NOT NULL DEFAULT 0,
    `amount_out` DECIMAL(18, 4) NOT NULL DEFAULT 0,
    `accumulated` DECIMAL(18, 4) NOT NULL DEFAULT 0,
    `code` VARCHAR(250) NULL,
    `transaction_content` TEXT NULL,
    `reference_number` VARCHAR(255) NULL,
    `body` TEXT NULL,
    `created_at` DATETIME NOT NULL DEFAULT now(),

    PRIMARY KEY (`transaction_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `account` ADD CONSTRAINT `account_owner_id_fkey` FOREIGN KEY (`owner_id`) REFERENCES `account`(`account_id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `dish` ADD CONSTRAINT `dish_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `dish_group`(`group_id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dish_snapshot` ADD CONSTRAINT `dish_snapshot_dish_id_fkey` FOREIGN KEY (`dish_id`) REFERENCES `dish`(`dish_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `dish_combo` ADD CONSTRAINT `dish_combo_dish_id_fkey` FOREIGN KEY (`dish_id`) REFERENCES `dish`(`dish_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dish_combo` ADD CONSTRAINT `dish_combo_combo_id_fkey` FOREIGN KEY (`combo_id`) REFERENCES `dish`(`dish_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order` ADD CONSTRAINT `order_guest_id_fkey` FOREIGN KEY (`guest_id`) REFERENCES `guest`(`guest_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `order` ADD CONSTRAINT `order_table_number_fkey` FOREIGN KEY (`table_number`) REFERENCES `table`(`table_number`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order` ADD CONSTRAINT `order_order_handler_id_fkey` FOREIGN KEY (`order_handler_id`) REFERENCES `account`(`account_id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `order` ADD CONSTRAINT `order_dish_snapshot_id_fkey` FOREIGN KEY (`dish_snapshot_id`) REFERENCES `dish_snapshot`(`snapshot_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `refresh_token` ADD CONSTRAINT `refresh_token_account_id_fkey` FOREIGN KEY (`account_id`) REFERENCES `account`(`account_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `guest` ADD CONSTRAINT `guest_table_number_fkey` FOREIGN KEY (`table_number`) REFERENCES `table`(`table_number`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `socket` ADD CONSTRAINT `socket_guest_id_fkey` FOREIGN KEY (`guest_id`) REFERENCES `guest`(`guest_id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `socket` ADD CONSTRAINT `socket_account_id_fkey` FOREIGN KEY (`account_id`) REFERENCES `account`(`account_id`) ON DELETE SET NULL ON UPDATE NO ACTION;
