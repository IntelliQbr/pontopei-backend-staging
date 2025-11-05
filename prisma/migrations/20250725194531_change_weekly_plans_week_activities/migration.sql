/*
  Warnings:

  - You are about to drop the column `fridayActivity` on the `weekly_plans` table. All the data in the column will be lost.
  - You are about to drop the column `mondayActivity` on the `weekly_plans` table. All the data in the column will be lost.
  - You are about to drop the column `thursdayActivity` on the `weekly_plans` table. All the data in the column will be lost.
  - You are about to drop the column `tuesdayActivity` on the `weekly_plans` table. All the data in the column will be lost.
  - You are about to drop the column `wednesdayActivity` on the `weekly_plans` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "weekly_plans" DROP COLUMN "fridayActivity",
DROP COLUMN "mondayActivity",
DROP COLUMN "thursdayActivity",
DROP COLUMN "tuesdayActivity",
DROP COLUMN "wednesdayActivity",
ADD COLUMN     "weekActivities" JSONB NOT NULL DEFAULT '{}';
