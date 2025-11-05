import { ConfigModuleOptions } from "@nestjs/config";

export const configModuleConfig: ConfigModuleOptions = {
    isGlobal: true,
    cache: true,
    expandVariables: true,
};
