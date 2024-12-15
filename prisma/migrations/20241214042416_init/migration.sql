-- DropForeignKey
ALTER TABLE `dish_combo` DROP FOREIGN KEY `dish_combo_combo_id_fkey`;

-- DropForeignKey
ALTER TABLE `dish_combo` DROP FOREIGN KEY `dish_combo_dish_id_fkey`;

-- AddForeignKey
ALTER TABLE `dish_combo` ADD CONSTRAINT `dish_combo_dish_id_fkey` FOREIGN KEY (`dish_id`) REFERENCES `dish`(`dish_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dish_combo` ADD CONSTRAINT `dish_combo_combo_id_fkey` FOREIGN KEY (`combo_id`) REFERENCES `dish`(`dish_id`) ON DELETE CASCADE ON UPDATE CASCADE;
