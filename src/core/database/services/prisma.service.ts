import { OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

export class PrismaService
    extends PrismaClient
    implements OnModuleInit, OnModuleDestroy
{
    async onModuleInit() {
        try {
            await this.$connect();
        } catch (error) {
            console.error(error);
        }
    }

    async onModuleDestroy() {
        try {
            await this.$disconnect();
        } catch (error) {
            console.error(error);
        }
    }
}
