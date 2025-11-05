import { PEI, Profile, Student, User } from "@prisma/client";
import { ActivityDto } from "src/modules/weekly-plans/models/dtos/create/request-create-weekly-plan.dto";

export type CreateWeeklyPlanContentType = {
    teacher: Profile & { user: User };
    student: Student;
    weekStart: string;
    weekEnd: string;
    weekActivities: Record<string, ActivityDto[]>;
    formQuestions: Record<string, string>;
    previousPEI: PEI;
};
