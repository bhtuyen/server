-- CreateTable
CREATE TABLE `Account` (
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `avatar` VARCHAR(255) NULL,
    `role` ENUM('Owner', 'Employee', 'Guest') NOT NULL DEFAULT 'Employee',
    `phone` VARCHAR(50) NOT NULL,
    `ownerId` CHAR(36) NULL,
    `isVerified` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Account_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Dish` (
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `price` DECIMAL(10, 4) NULL,
    `description` TEXT NULL,
    `image` VARCHAR(255) NULL,
    `status` ENUM('Available', 'Unavailable', 'Hidden') NOT NULL DEFAULT 'Available',
    `category` ENUM('Buffet', 'Paid') NOT NULL DEFAULT 'Paid',
    `options` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `groupId` CHAR(36) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DishSnapshot` (
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `price` DECIMAL(10, 4) NULL,
    `description` TEXT NULL,
    `image` VARCHAR(255) NULL,
    `status` ENUM('Available', 'Unavailable', 'Hidden') NOT NULL DEFAULT 'Available',
    `category` ENUM('Buffet', 'Paid') NOT NULL DEFAULT 'Paid',
    `options` TEXT NULL,
    `dishId` CHAR(36) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `groupId` CHAR(36) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DishGroup` (
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `DishGroup_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Table` (
    `id` CHAR(36) NOT NULL,
    `number` VARCHAR(50) NOT NULL,
    `capacity` INTEGER NOT NULL,
    `status` ENUM('Available', 'Hidden', 'Reserved') NOT NULL DEFAULT 'Available',
    `token` VARCHAR(255) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Table_number_key`(`number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Order` (
    `id` CHAR(36) NOT NULL,
    `guestId` CHAR(36) NOT NULL,
    `tableNumber` VARCHAR(50) NOT NULL,
    `dishSnapshotId` CHAR(36) NOT NULL,
    `options` TEXT NULL,
    `quantity` INTEGER NOT NULL,
    `orderHandlerId` CHAR(36) NULL,
    `status` ENUM('Pending', 'Processing', 'Rejected', 'Delivered', 'Paid') NOT NULL DEFAULT 'Pending',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Order_dishSnapshotId_key`(`dishSnapshotId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RefreshToken` (
    `token` VARCHAR(255) NOT NULL,
    `accountId` CHAR(36) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`token`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Guest` (
    `id` CHAR(36) NOT NULL,
    `tableNumber` VARCHAR(50) NOT NULL,
    `refreshToken` VARCHAR(255) NULL,
    `refreshTokenExpiresAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Socket` (
    `socketId` CHAR(36) NOT NULL,
    `accountId` CHAR(36) NULL,
    `guestId` CHAR(36) NULL,

    UNIQUE INDEX `Socket_accountId_key`(`accountId`),
    UNIQUE INDEX `Socket_guestId_key`(`guestId`),
    PRIMARY KEY (`socketId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Account` ADD CONSTRAINT `Account_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `Account`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Dish` ADD CONSTRAINT `Dish_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `DishGroup`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DishSnapshot` ADD CONSTRAINT `DishSnapshot_dishId_fkey` FOREIGN KEY (`dishId`) REFERENCES `Dish`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `DishSnapshot` ADD CONSTRAINT `DishSnapshot_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `DishGroup`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_guestId_fkey` FOREIGN KEY (`guestId`) REFERENCES `Guest`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_tableNumber_fkey` FOREIGN KEY (`tableNumber`) REFERENCES `Table`(`number`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_dishSnapshotId_fkey` FOREIGN KEY (`dishSnapshotId`) REFERENCES `DishSnapshot`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_orderHandlerId_fkey` FOREIGN KEY (`orderHandlerId`) REFERENCES `Account`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `RefreshToken` ADD CONSTRAINT `RefreshToken_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `Account`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Guest` ADD CONSTRAINT `Guest_tableNumber_fkey` FOREIGN KEY (`tableNumber`) REFERENCES `Table`(`number`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Socket` ADD CONSTRAINT `Socket_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `Account`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Socket` ADD CONSTRAINT `Socket_guestId_fkey` FOREIGN KEY (`guestId`) REFERENCES `Guest`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;
