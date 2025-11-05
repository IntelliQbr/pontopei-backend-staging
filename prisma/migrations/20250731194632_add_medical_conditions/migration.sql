/*
  Warnings:

  - You are about to drop the column `medicalConditions` on the `students` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "students" DROP COLUMN "medicalConditions";

-- CreateTable
CREATE TABLE "medical_conditions" (
    "id" TEXT NOT NULL,
    "condition" TEXT NOT NULL,
    "age" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medical_conditions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "medical_conditions" ADD CONSTRAINT "medical_conditions_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
