/*
  Warnings:

  - You are about to drop the column `evaluationMethods` on the `peis` table. All the data in the column will be lost.
  - You are about to drop the column `objectives` on the `peis` table. All the data in the column will be lost.
  - You are about to drop the column `strategies` on the `peis` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "peis" DROP COLUMN "evaluationMethods",
DROP COLUMN "objectives",
DROP COLUMN "strategies",
ADD COLUMN     "formQuestions" JSONB NOT NULL DEFAULT '{}';
