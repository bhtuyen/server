/*
  Warnings:

  - You are about to alter the column `price` on the `dish` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Decimal(10,4)`.
  - You are about to alter the column `price` on the `dishsnapshot` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Decimal(10,4)`.

*/
-- AlterTable
ALTER TABLE `dish` MODIFY `price` DECIMAL(10, 4) NULL;

-- AlterTable
ALTER TABLE `dishsnapshot` MODIFY `price` DECIMAL(10, 4) NULL;
