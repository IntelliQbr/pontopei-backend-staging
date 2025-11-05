import { Module } from "@nestjs/common";
import { SubscriptionsModule } from "../subscriptions/subscriptions.module";
import { PaymentsController } from "./controllers/payments.controller";
import { PaymentsService } from "./services/payments.service";

@Module({
    imports: [SubscriptionsModule],
    controllers: [PaymentsController],
    providers: [PaymentsService],
    exports: [PaymentsService],
})
export class PaymentsModule {}
