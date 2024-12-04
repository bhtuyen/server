-- AlterTable
ALTER TABLE `dish` MODIFY `price` INTEGER NULL,
    MODIFY `description` TEXT NULL,
    MODIFY `image` VARCHAR(255) NULL,
    MODIFY `options` TEXT NULL;

-- AlterTable
ALTER TABLE `dishsnapshot` MODIFY `price` INTEGER NULL,
    MODIFY `description` TEXT NULL,
    MODIFY `image` VARCHAR(255) NULL,
    MODIFY `options` TEXT NULL;
