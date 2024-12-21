/*
  Warnings:

  - The primary key for the `refresh_token` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE `guest` MODIFY `refresh_token` VARCHAR(500) NULL;

-- AlterTable
ALTER TABLE `refresh_token` DROP PRIMARY KEY,
    MODIFY `token` VARCHAR(500) NOT NULL,
    ADD PRIMARY KEY (`token`);
