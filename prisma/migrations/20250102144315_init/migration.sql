/*
  Warnings:

  - You are about to drop the column `is_verified` on the `account` table. All the data in the column will be lost.
  - You are about to alter the column `created_at` on the `account` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `updated_at` on the `account` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `created_at` on the `dish` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `updated_at` on the `dish` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `created_at` on the `dish_group` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `updated_at` on the `dish_group` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `created_at` on the `dish_snapshot` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `updated_at` on the `dish_snapshot` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `expired_at` on the `guest` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `created_at` on the `guest` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `updated_at` on the `guest` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `created_at` on the `order` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `updated_at` on the `order` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `expires_at` on the `refresh_token` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `created_at` on the `refresh_token` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `created_at` on the `table` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `updated_at` on the `table` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `transaction_date` on the `transaction` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `created_at` on the `transaction` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.

*/
-- AlterTable
ALTER TABLE `account` DROP COLUMN `is_verified`,
    MODIFY `created_at` DATETIME NOT NULL DEFAULT now(),
    MODIFY `updated_at` DATETIME NOT NULL;

-- AlterTable
ALTER TABLE `dish` MODIFY `created_at` DATETIME NOT NULL DEFAULT now(),
    MODIFY `updated_at` DATETIME NOT NULL;

-- AlterTable
ALTER TABLE `dish_group` MODIFY `created_at` DATETIME NOT NULL DEFAULT now(),
    MODIFY `updated_at` DATETIME NOT NULL;

-- AlterTable
ALTER TABLE `dish_snapshot` MODIFY `created_at` DATETIME NOT NULL DEFAULT now(),
    MODIFY `updated_at` DATETIME NOT NULL;

-- AlterTable
ALTER TABLE `guest` MODIFY `expired_at` DATETIME NULL,
    MODIFY `created_at` DATETIME NOT NULL DEFAULT now(),
    MODIFY `updated_at` DATETIME NOT NULL;

-- AlterTable
ALTER TABLE `order` MODIFY `created_at` DATETIME NOT NULL DEFAULT now(),
    MODIFY `updated_at` DATETIME NOT NULL;

-- AlterTable
ALTER TABLE `refresh_token` MODIFY `expires_at` DATETIME NOT NULL,
    MODIFY `created_at` DATETIME NOT NULL DEFAULT now();

-- AlterTable
ALTER TABLE `table` MODIFY `created_at` DATETIME NOT NULL DEFAULT now(),
    MODIFY `updated_at` DATETIME NOT NULL;

-- AlterTable
ALTER TABLE `transaction` MODIFY `transaction_date` DATETIME NOT NULL DEFAULT now(),
    MODIFY `created_at` DATETIME NOT NULL DEFAULT now();
