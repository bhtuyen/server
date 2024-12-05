/*
  Warnings:

  - Made the column `isVerified` on table `account` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `account` MODIFY `isVerified` BOOLEAN NOT NULL DEFAULT false;
