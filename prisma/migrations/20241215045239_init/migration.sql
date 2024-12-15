/*
  Warnings:

  - You are about to alter the column `price` on the `dish` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,4)` to `Decimal(18,4)`.
  - You are about to alter the column `price` on the `dish_snapshot` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,4)` to `Decimal(18,4)`.

*/
-- AlterTable
ALTER TABLE `dish` MODIFY `price` DECIMAL(18, 4) NULL;

-- AlterTable
ALTER TABLE `dish_snapshot` MODIFY `price` DECIMAL(18, 4) NULL;
