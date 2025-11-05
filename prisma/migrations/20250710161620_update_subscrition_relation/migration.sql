/*
  Warnings:

  - You are about to drop the column `schoolId` on the `subscriptions` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_schoolId_fkey";

-- DropIndex
DROP INDEX "subscriptions_schoolId_key";

-- AlterTable
ALTER TABLE "profiles" ADD COLUMN     "subscriptionId" TEXT;

-- AlterTable
ALTER TABLE "subscriptions" DROP COLUMN "schoolId";

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
