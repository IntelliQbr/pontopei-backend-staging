import { PartialType } from "@nestjs/mapped-types";
import { CreateTeacherDto } from "../create/request-create-teacher.dto";

export class UpdateTeacherDto extends PartialType(CreateTeacherDto) {}
