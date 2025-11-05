/*
  Warnings:

  - You are about to drop the column `features` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `limits` on the `subscriptions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "subscriptions" DROP COLUMN "features",
DROP COLUMN "limits";

-- CreateTable
CREATE TABLE "subscription_limits" (
    "id" TEXT NOT NULL,
    "maxStudents" INTEGER NOT NULL,
    "maxPeiPerTrimester" INTEGER NOT NULL,
    "maxWeeklyPlans" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "subscriptionId" TEXT NOT NULL,

    CONSTRAINT "subscription_limits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_features" (
    "id" TEXT NOT NULL,
    "premiumSupport" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "subscriptionId" TEXT NOT NULL,

    CONSTRAINT "subscription_features_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subscription_limits_subscriptionId_key" ON "subscription_limits"("subscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_features_subscriptionId_key" ON "subscription_features"("subscriptionId");

-- AddForeignKey
ALTER TABLE "subscription_limits" ADD CONSTRAINT "subscription_limits_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_features" ADD CONSTRAINT "subscription_features_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
