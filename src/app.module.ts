import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { configModuleConfig } from "./config/config-module.config";
import { AIModule } from "./core/ai/ai.module";
import { DatabaseModule } from "./core/database/database.module";
import { AdminModule } from "./modules/admin/admin.module";
import { AuthModule } from "./modules/auth/auth.module";
import { ClassroomsModule } from "./modules/classrooms/classrooms.module";
import { NotesModule } from "./modules/notes/notes.module";
import { PaymentsModule } from "./modules/payments/payments.module";
import { PEIModule } from "./modules/pei/pei.module";
import { ProfileModule } from "./modules/profile/profile.module";
import { SchoolsModule } from "./modules/schools/schools.module";
import { StudentsModule } from "./modules/students/students.module";
import { SubscriptionsModule } from "./modules/subscriptions/subscriptions.module";
import { TeachersModule } from "./modules/teachers/teachers.module";
import { WeeklyPlansModule } from "./modules/weekly-plans/weekly-plans.module";

@Module({
    imports: [
        ConfigModule.forRoot(configModuleConfig),
        ScheduleModule.forRoot(),
        DatabaseModule,
        AuthModule,
        SchoolsModule,
        TeachersModule,
        PaymentsModule,
        ClassroomsModule,
        AIModule,
        StudentsModule,
        PEIModule,
        NotesModule,
        WeeklyPlansModule,
        ProfileModule,
        SubscriptionsModule,
        AdminModule,
    ],
})
export class AppModule {}
