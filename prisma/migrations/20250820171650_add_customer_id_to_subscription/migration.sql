/*
  Warnings:

  - A unique constraint covering the columns `[customerId]` on the table `subscriptions` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."subscriptions" ADD COLUMN     "customerId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_customerId_key" ON "public"."subscriptions"("customerId");
