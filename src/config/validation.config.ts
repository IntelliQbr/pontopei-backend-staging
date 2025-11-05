import { BadRequestException, ValidationPipeOptions } from "@nestjs/common";

export const validationConfig: ValidationPipeOptions = {
    whitelist: true,
    transform: true,
    exceptionFactory: (errors) => {
        const message = errors.map((error) => {
            if (!error?.constraints) return [];
            return Object.values(error.constraints)[0];
        })[0];

        return new BadRequestException(message);
    },
};
