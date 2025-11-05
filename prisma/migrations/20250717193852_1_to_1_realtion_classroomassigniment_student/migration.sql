/*
  Warnings:

  - A unique constraint covering the columns `[studentId]` on the table `classroom_assignments` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "classroom_assignments_studentId_key" ON "classroom_assignments"("studentId");
