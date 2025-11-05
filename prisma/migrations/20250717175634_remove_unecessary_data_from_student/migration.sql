/*
  Warnings:

  - You are about to drop the column `class` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `grade` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `period` on the `students` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "students" DROP COLUMN "class",
DROP COLUMN "grade",
DROP COLUMN "period",
ADD COLUMN     "cid" TEXT,
ADD COLUMN     "hasCamping" BOOLEAN NOT NULL DEFAULT false;
