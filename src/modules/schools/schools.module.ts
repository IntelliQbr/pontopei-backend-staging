import { Module } from "@nestjs/common";
import { SchoolsController } from "./controllers/scholls.controller";
import { SchoolsService } from "./services/schools.service";

@Module({
    controllers: [SchoolsController],
    providers: [SchoolsService],
    exports: [SchoolsService],
})
export class SchoolsModule {}
