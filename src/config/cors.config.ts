import { CorsOptions } from "@nestjs/common/interfaces/external/cors-options.interface";

export const corsConfig: CorsOptions = {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
};
