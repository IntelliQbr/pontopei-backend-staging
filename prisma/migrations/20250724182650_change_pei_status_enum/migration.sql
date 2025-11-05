/*
  Warnings:

  - The values [DRAFT,COMPLETED] on the enum `PEIStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PEIStatus_new" AS ENUM ('ACTIVE', 'INACTIVE', 'EXPIRED');
ALTER TABLE "peis" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "peis" ALTER COLUMN "status" TYPE "PEIStatus_new" USING ("status"::text::"PEIStatus_new");
ALTER TYPE "PEIStatus" RENAME TO "PEIStatus_old";
ALTER TYPE "PEIStatus_new" RENAME TO "PEIStatus";
DROP TYPE "PEIStatus_old";
ALTER TABLE "peis" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
COMMIT;
