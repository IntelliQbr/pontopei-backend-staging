import { Classroom, Note, PEI, Profile, School, Student, User } from "@prisma/client";
import { CreatePEIContentType } from "./create-pei-content.type";

export type RenewPEIContentType = CreatePEIContentType & {
    previousPEI: PEI;
    latestNotes: Note[];
};
