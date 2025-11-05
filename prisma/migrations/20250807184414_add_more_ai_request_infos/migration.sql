/*
  Warnings:

  - You are about to drop the `audit_logs` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "ai_requests" ADD COLUMN     "inputTokens" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "model" TEXT NOT NULL DEFAULT 'gemini-2.0-flash-001',
ADD COLUMN     "outputTokens" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalTokens" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "audit_logs";
