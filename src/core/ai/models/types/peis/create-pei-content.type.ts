import { Classroom, Profile, School, Student, User } from "@prisma/client";

export type CreatePEIContentType = {
    formQuestions: Record<string, any>;
    secondFormQuestions?: Record<string, any>;
    student: Student;
    teacher: Profile & { user: User };
    classroom: Classroom;
    school: School;
    startDate: Date;
    endDate: Date;
};
