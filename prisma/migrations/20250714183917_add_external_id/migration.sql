/*
  Warnings:

  - A unique constraint covering the columns `[externalId]` on the table `subscriptions` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_externalId_key" ON "subscriptions"("externalId");
