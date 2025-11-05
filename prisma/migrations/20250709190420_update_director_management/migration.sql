/*
  Warnings:

  - The values [DIRECTION] on the enum `ProfileRole` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `createdById` to the `classrooms` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdById` to the `schools` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ProfileRole_new" AS ENUM ('DIRECTOR', 'TEACHER');
ALTER TABLE "profiles" ALTER COLUMN "role" TYPE "ProfileRole_new" USING ("role"::text::"ProfileRole_new");
ALTER TYPE "ProfileRole" RENAME TO "ProfileRole_old";
ALTER TYPE "ProfileRole_new" RENAME TO "ProfileRole";
DROP TYPE "ProfileRole_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "profiles" DROP CONSTRAINT "profiles_schoolId_fkey";

-- AlterTable
ALTER TABLE "classrooms" ADD COLUMN     "capacity" INTEGER,
ADD COLUMN     "createdById" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "profiles" ALTER COLUMN "schoolId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "schools" ADD COLUMN     "createdById" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schools" ADD CONSTRAINT "schools_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classrooms" ADD CONSTRAINT "classrooms_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
