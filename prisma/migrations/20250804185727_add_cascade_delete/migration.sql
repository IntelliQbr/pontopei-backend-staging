-- DropForeignKey
ALTER TABLE "classroom_assignments" DROP CONSTRAINT "classroom_assignments_classroomId_fkey";

-- DropForeignKey
ALTER TABLE "classroom_assignments" DROP CONSTRAINT "classroom_assignments_studentId_fkey";

-- DropForeignKey
ALTER TABLE "classroom_assignments" DROP CONSTRAINT "classroom_assignments_teacherId_fkey";

-- DropForeignKey
ALTER TABLE "notes" DROP CONSTRAINT "notes_createdById_fkey";

-- DropForeignKey
ALTER TABLE "notes" DROP CONSTRAINT "notes_studentId_fkey";

-- DropForeignKey
ALTER TABLE "peis" DROP CONSTRAINT "peis_createdById_fkey";

-- DropForeignKey
ALTER TABLE "peis" DROP CONSTRAINT "peis_studentId_fkey";

-- DropForeignKey
ALTER TABLE "weekly_plans" DROP CONSTRAINT "weekly_plans_createdById_fkey";

-- DropForeignKey
ALTER TABLE "weekly_plans" DROP CONSTRAINT "weekly_plans_studentId_fkey";

-- AddForeignKey
ALTER TABLE "classroom_assignments" ADD CONSTRAINT "classroom_assignments_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classroom_assignments" ADD CONSTRAINT "classroom_assignments_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classroom_assignments" ADD CONSTRAINT "classroom_assignments_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "classrooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "peis" ADD CONSTRAINT "peis_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "peis" ADD CONSTRAINT "peis_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weekly_plans" ADD CONSTRAINT "weekly_plans_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weekly_plans" ADD CONSTRAINT "weekly_plans_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
