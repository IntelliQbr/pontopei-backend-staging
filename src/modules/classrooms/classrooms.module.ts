import { Module } from "@nestjs/common";
import { ClassroomsController } from "./controllers/classrooms.controller";
import { ClassroomsService } from "./services/classrooms.service";

@Module({
    controllers: [ClassroomsController],
    providers: [ClassroomsService],
    exports: [ClassroomsService],
})
export class ClassroomsModule {}
