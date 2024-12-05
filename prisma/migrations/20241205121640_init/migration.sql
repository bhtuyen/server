/*
  Warnings:

  - You are about to alter the column `role` on the `account` table. The data in that column could be lost. The data in that column will be cast from `VarChar(50)` to `Enum(EnumId(0))`.
  - You are about to drop the column `code` on the `dishgroup` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `guest` table. All the data in the column will be lost.
  - You are about to alter the column `status` on the `order` table. The data in that column could be lost. The data in that column will be cast from `VarChar(50)` to `Enum(EnumId(6))`.
  - You are about to alter the column `status` on the `table` table. The data in that column could be lost. The data in that column will be cast from `VarChar(50)` to `Enum(EnumId(5))`.
  - Made the column `dishId` on table `dishsnapshot` required. This step will fail if there are existing NULL values in that column.
  - Made the column `tableNumber` on table `guest` required. This step will fail if there are existing NULL values in that column.
  - Made the column `guestId` on table `order` required. This step will fail if there are existing NULL values in that column.
  - Made the column `tableNumber` on table `order` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `dishsnapshot` DROP FOREIGN KEY `DishSnapshot_dishId_fkey`;

-- DropForeignKey
ALTER TABLE `guest` DROP FOREIGN KEY `Guest_tableNumber_fkey`;

-- DropForeignKey
ALTER TABLE `order` DROP FOREIGN KEY `Order_guestId_fkey`;

-- DropForeignKey
ALTER TABLE `order` DROP FOREIGN KEY `Order_tableNumber_fkey`;

-- DropIndex
DROP INDEX `DishGroup_code_key` ON `dishgroup`;

-- AlterTable
ALTER TABLE `account` MODIFY `role` ENUM('Owner', 'Employee', 'Guest') NOT NULL DEFAULT 'Employee';

-- AlterTable
ALTER TABLE `dishgroup` DROP COLUMN `code`;

-- AlterTable
ALTER TABLE `dishsnapshot` MODIFY `dishId` CHAR(36) NOT NULL;

-- AlterTable
ALTER TABLE `guest` DROP COLUMN `name`,
    MODIFY `tableNumber` VARCHAR(50) NOT NULL;

-- AlterTable
ALTER TABLE `order` MODIFY `guestId` CHAR(36) NOT NULL,
    MODIFY `tableNumber` VARCHAR(50) NOT NULL,
    MODIFY `status` ENUM('Pending', 'Processing', 'Rejected', 'Delivered', 'Paid') NOT NULL DEFAULT 'Pending';

-- AlterTable
ALTER TABLE `table` MODIFY `status` ENUM('Available', 'Hidden', 'Reserved') NOT NULL DEFAULT 'Available';

-- AddForeignKey
ALTER TABLE `DishSnapshot` ADD CONSTRAINT `DishSnapshot_dishId_fkey` FOREIGN KEY (`dishId`) REFERENCES `Dish`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_guestId_fkey` FOREIGN KEY (`guestId`) REFERENCES `Guest`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_tableNumber_fkey` FOREIGN KEY (`tableNumber`) REFERENCES `Table`(`number`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Guest` ADD CONSTRAINT `Guest_tableNumber_fkey` FOREIGN KEY (`tableNumber`) REFERENCES `Table`(`number`) ON DELETE NO ACTION ON UPDATE CASCADE;
