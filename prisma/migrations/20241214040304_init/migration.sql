-- AlterTable
ALTER TABLE `dish_combo` ADD COLUMN `category` ENUM('Buffet', 'Paid') NOT NULL DEFAULT 'Paid';
