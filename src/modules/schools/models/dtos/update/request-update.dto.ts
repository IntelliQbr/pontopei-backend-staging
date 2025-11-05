import { PartialType } from "@nestjs/mapped-types";
import { RequestCreateSchoolDto } from "../create/request-create.dto";

export class RequestUpdateSchoolDto extends PartialType(
    RequestCreateSchoolDto,
) {}
