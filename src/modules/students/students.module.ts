import { Module } from "@nestjs/common";
import { SubscriptionsModule } from "../subscriptions/subscriptions.module";
import { StudentsController } from "./controller/students.controller";
import { StudentsService } from "./services/students.service";

@Module({
    imports: [SubscriptionsModule],
    controllers: [StudentsController],
    providers: [StudentsService],
})
export class StudentsModule {}
