import { Injectable, NotFoundException } from "@nestjs/common";
import { Note } from "@prisma/client";
import { PrismaService } from "src/core/database/services/prisma.service";
import { FindAllQuery } from "src/core/models/find-all-query";
import { RequestCreateNoteDto } from "../models/dtos/request-create-note.dto";
import { FindAllNotesToDirectorQuery } from "../models/queries/find-all-notes-to-director.query";
import { FindAllNotesToTeacherQuery } from "../models/queries/find-all-notes-to-teacher.query";

@Injectable()
export class NotesService {
    constructor(private readonly prisma: PrismaService) {}

    async createNote(
        dto: RequestCreateNoteDto,
        teacherId: string,
    ): Promise<Note> {
        const student = await this.prisma.student.findUnique({
            where: {
                id: dto.studentId,
                classroomAssignment: {
                    teacherId,
                },
            },
        });

        if (!student) {
            throw new NotFoundException("Aluno não encontrado");
        }

        const note = await this.prisma.note.create({
            data: {
                content: dto.content,
                studentId: dto.studentId,
                createdById: teacherId,
            },
        });

        return note;
    }

    async findAllToTeacher(
        query: FindAllNotesToTeacherQuery,
        teacherId: string,
    ) {
        const { studentId, skip, take } = query;

        const student = await this.prisma.student.findUnique({
            where: {
                id: studentId,
                classroomAssignment: {
                    teacherId,
                },
            },
        });

        if (!student) {
            throw new NotFoundException("Aluno não encontrado");
        }

        const [notes, total] = await this.prisma.$transaction([
            this.prisma.note.findMany({
                where: {
                    studentId,
                },
                skip,
                take,
            }),

            this.prisma.note.count({
                where: {
                    studentId,
                },
            }),
        ]);

        return {
            notes,
            total,
        };
    }

    async findAllToDirector(
        query: FindAllNotesToDirectorQuery,
        directorId: string,
    ) {
        const { teacherId, ...rest } = query;

        const teacher = await this.prisma.profile.findUnique({
            where: {
                id: teacherId,
                createdById: directorId,
            },
        });

        if (!teacher) {
            throw new NotFoundException("Professor não encontrado");
        }

        return await this.findAllToTeacher(rest, teacherId);
    }

    async latestsNotesToTeacher(teacherId: string) {
        const notes = await this.prisma.note.findMany({
            where: {
                createdById: teacherId,
            },
            orderBy: {
                createdAt: "desc",
            },
            take: 5,
            include: {
                student: {
                    include: {
                        classroomAssignment: {
                            include: {
                                classroom: true,
                            },
                        },
                    },
                },
            },
        });

        return notes;
    }

    async findAllByStudentId(
        studentId: string,
        directorId: string,
        query: Exclude<FindAllQuery, "search">,
    ) {
        const { skip, take } = query;

        const student = await this.prisma.student.findUnique({
            where: {
                id: studentId,
                classroomAssignment: {
                    teacher: {
                        createdById: directorId,
                    },
                },
            },
        });

        if (!student) {
            throw new NotFoundException("Aluno não encontrado");
        }

        const [notes, total] = await this.prisma.$transaction([
            this.prisma.note.findMany({
                where: {
                    studentId,
                },
                skip,
                take,
            }),

            this.prisma.note.count({
                where: {
                    studentId,
                },
            }),
        ]);

        return {
            notes,
            total,
        };
    }
}
