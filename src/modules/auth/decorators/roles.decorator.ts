import { Reflector } from "@nestjs/core";
import { ProfileRole } from "@prisma/client";

export const Roles = Reflector.createDecorator<ProfileRole[]>();
