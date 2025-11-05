/*
  Warnings:

  - You are about to drop the column `adaptedContent` on the `weekly_plans` table. All the data in the column will be lost.
  - Added the required column `content` to the `weekly_plans` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "weekly_plans" DROP COLUMN "adaptedContent",
ADD COLUMN     "content" TEXT NOT NULL,
ADD COLUMN     "formQuestions" JSONB NOT NULL DEFAULT '{}';
