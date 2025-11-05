import { Module } from "@nestjs/common";
import { ClassroomsModule } from "../classrooms/classrooms.module";
import { PaymentsModule } from "../payments/payments.module";
import { SchoolsModule } from "../schools/schools.module";
import { SubscriptionsModule } from "../subscriptions/subscriptions.module";
import { TeachersModule } from "../teachers/teachers.module";
import { AdminAIRequestsController } from "./controllers/admin-ai-requests.controller";
import { AdminClassroomsController } from "./controllers/admin-classrooms.controller";
import { AdminMetricsController } from "./controllers/admin-metrics.controller";
import { AdminNotesController } from "./controllers/admin-notes.controller";
import { AdminSchoolsController } from "./controllers/admin-schools.controller";
import { AdminStudentsController } from "./controllers/admin-students.controller";
import { AdminSubscriptionsController } from "./controllers/admin-subscriptions.controller";
import { AdminTeachersController } from "./controllers/admin-teachers.controller";
import { AdminUsersController } from "./controllers/admin-users.controller";
import { AdminWeeklyPlansController } from "./controllers/admin-weekly-plans.controller";
import { AdminAIRequestsService } from "./services/admin-ai-requests.service";
import { AdminClassroomsService } from "./services/admin-classrooms.service";
import { AdminMetricsService } from "./services/admin-metrics.service";
import { AdminNotesService } from "./services/admin-notes.service";
import { AdminSchoolsService } from "./services/admin-schools.service";
import { AdminStudentsService } from "./services/admin-students.service";
import { AdminSubscriptionsService } from "./services/admin-subscriptions.service";
import { AdminTeachersService } from "./services/admin-teachers.service";
import { AdminUsersService } from "./services/admin-users.service";
import { AdminWeeklyPlansService } from "./services/admin-weekly-plans.service";

@Module({
    imports: [
        TeachersModule,
        ClassroomsModule,
        SchoolsModule,
        PaymentsModule,
        SubscriptionsModule,
    ],
    controllers: [
        AdminUsersController,
        AdminSchoolsController,
        AdminStudentsController,
        AdminTeachersController,
        AdminClassroomsController,
        AdminSubscriptionsController,
        AdminAIRequestsController,
        AdminMetricsController,
        AdminWeeklyPlansController,
        AdminNotesController,
    ],
    providers: [
        AdminUsersService,
        AdminSchoolsService,
        AdminStudentsService,
        AdminTeachersService,
        AdminClassroomsService,
        AdminSubscriptionsService,
        AdminAIRequestsService,
        AdminMetricsService,
        AdminWeeklyPlansService,
        AdminNotesService,
    ],
})
export class AdminModule {}
