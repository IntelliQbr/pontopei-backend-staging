import { User } from "@prisma/client";

export class ResponseSignInDto {
    user: Omit<User, "password">;
    token: string;
}
