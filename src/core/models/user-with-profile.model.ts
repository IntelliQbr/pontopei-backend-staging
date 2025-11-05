import { Profile as ProfilePrisma, Subscription, User } from "@prisma/client";

export type UserWithProfile = User & {
    profile: Profile & {
        subscription: Subscription | null;
    };
};

export type Profile = ProfilePrisma;
