-- AlterTable
ALTER TABLE "profiles" ADD COLUMN     "createdById" TEXT;

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
