import { ClassSerializerInterceptor, ValidationPipe } from "@nestjs/common";
import { NestFactory, Reflector } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { json } from "express";
import { AppModule } from "./app.module";
import { corsConfig } from "./config/cors.config";
import { validationConfig } from "./config/validation.config";

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
        cors: corsConfig,
    });

    app.useGlobalPipes(new ValidationPipe(validationConfig));
    app.useGlobalInterceptors(
        new ClassSerializerInterceptor(app.get(Reflector)),
    );

    app.use(
        "/payments/webhook",
        json({
            verify: (req, _res, buf) => {
                req["rawBody"] = buf;
            },
        }),
    );

    app.use(json());

    await app.listen(8080);
}

void bootstrap();
