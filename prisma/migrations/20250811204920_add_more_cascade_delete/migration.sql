-- DropForeignKey
ALTER TABLE "classrooms" DROP CONSTRAINT "classrooms_createdById_fkey";

-- DropForeignKey
ALTER TABLE "classrooms" DROP CONSTRAINT "classrooms_schoolId_fkey";

-- DropForeignKey
ALTER TABLE "medical_conditions" DROP CONSTRAINT "medical_conditions_studentId_fkey";

-- DropForeignKey
ALTER TABLE "schools" DROP CONSTRAINT "schools_createdById_fkey";

-- DropForeignKey
ALTER TABLE "students" DROP CONSTRAINT "students_createdById_fkey";

-- DropForeignKey
ALTER TABLE "students" DROP CONSTRAINT "students_schoolId_fkey";

-- AddForeignKey
ALTER TABLE "schools" ADD CONSTRAINT "schools_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classrooms" ADD CONSTRAINT "classrooms_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classrooms" ADD CONSTRAINT "classrooms_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_conditions" ADD CONSTRAINT "medical_conditions_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
