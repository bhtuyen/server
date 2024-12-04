/*
  Warnings:

  - You are about to alter the column `status` on the `dish` table. The data in that column could be lost. The data in that column will be cast from `VarChar(50)` to `Enum(EnumId(2))`.
  - You are about to alter the column `category` on the `dish` table. The data in that column could be lost. The data in that column will be cast from `VarChar(50)` to `Enum(EnumId(3))`.
  - You are about to alter the column `status` on the `dishsnapshot` table. The data in that column could be lost. The data in that column will be cast from `VarChar(50)` to `Enum(EnumId(2))`.
  - You are about to alter the column `category` on the `dishsnapshot` table. The data in that column could be lost. The data in that column will be cast from `VarChar(50)` to `Enum(EnumId(3))`.

*/
-- AlterTable
ALTER TABLE `dish` MODIFY `status` ENUM('Available', 'Unavailable', 'Hidden') NOT NULL DEFAULT 'Available',
    MODIFY `category` ENUM('Buffet', 'Paid') NOT NULL DEFAULT 'Paid';

-- AlterTable
ALTER TABLE `dishsnapshot` MODIFY `status` ENUM('Available', 'Unavailable', 'Hidden') NOT NULL DEFAULT 'Available',
    MODIFY `category` ENUM('Buffet', 'Paid') NOT NULL DEFAULT 'Paid';
