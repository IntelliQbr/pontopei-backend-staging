/*
  Warnings:

  - The `mondayActivity` column on the `weekly_plans` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `tuesdayActivity` column on the `weekly_plans` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `wednesdayActivity` column on the `weekly_plans` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `thursdayActivity` column on the `weekly_plans` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `fridayActivity` column on the `weekly_plans` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "weekly_plans" DROP COLUMN "mondayActivity",
ADD COLUMN     "mondayActivity" JSONB NOT NULL DEFAULT '[]',
DROP COLUMN "tuesdayActivity",
ADD COLUMN     "tuesdayActivity" JSONB NOT NULL DEFAULT '[]',
DROP COLUMN "wednesdayActivity",
ADD COLUMN     "wednesdayActivity" JSONB NOT NULL DEFAULT '[]',
DROP COLUMN "thursdayActivity",
ADD COLUMN     "thursdayActivity" JSONB NOT NULL DEFAULT '[]',
DROP COLUMN "fridayActivity",
ADD COLUMN     "fridayActivity" JSONB NOT NULL DEFAULT '[]';
