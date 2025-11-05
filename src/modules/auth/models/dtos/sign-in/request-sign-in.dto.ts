import { OmitType } from "@nestjs/mapped-types";
import { RequestSignUpDto } from "../sign-up/request-sign-up.dto";

export class RequestSignInDto extends OmitType(RequestSignUpDto, [
    "fullName",
    "confirmPassword",
] as const) {}
