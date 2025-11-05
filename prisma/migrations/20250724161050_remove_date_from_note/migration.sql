/*
  Warnings:

  - You are about to drop the column `date` on the `notes` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "notes" DROP COLUMN "date";

-- AlterTable
ALTER TABLE "students" ALTER COLUMN "gender" SET DEFAULT 'MALE';
