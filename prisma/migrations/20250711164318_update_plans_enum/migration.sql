/*
  Warnings:

  - The values [TRIAL] on the enum `SubscriptionPlan` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "SubscriptionPlan_new" AS ENUM ('BASIC', 'PREMIUM', 'ENTERPRISE');
ALTER TABLE "subscriptions" ALTER COLUMN "planType" TYPE "SubscriptionPlan_new" USING ("planType"::text::"SubscriptionPlan_new");
ALTER TYPE "SubscriptionPlan" RENAME TO "SubscriptionPlan_old";
ALTER TYPE "SubscriptionPlan_new" RENAME TO "SubscriptionPlan";
DROP TYPE "SubscriptionPlan_old";
COMMIT;
