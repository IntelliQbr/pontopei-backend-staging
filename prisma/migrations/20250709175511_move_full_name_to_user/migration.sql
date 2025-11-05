/*
  Warnings:

  - You are about to drop the column `fullName` on the `profiles` table. All the data in the column will be lost.
  - Added the required column `fullName` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "profiles" DROP COLUMN "fullName";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "fullName" TEXT NOT NULL;
