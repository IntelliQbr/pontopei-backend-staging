import { SubscriptionPlan, SubscriptionStatus } from "@prisma/client";

export type PlanConfig = {
    price: number;
    limits: {
        max_students: number;
        max_pei_per_trimester: number;
        max_weekly_plans: number;
    };
    features: {
        premium_support: boolean;
    };
};

export const PLANS_CONFIG: Record<
    Exclude<SubscriptionPlan, "PLUS">,
    PlanConfig
> = {
    FIT: {
        price: 249.0,
        limits: {
            max_students: 5,
            max_pei_per_trimester: 5,
            max_weekly_plans: 20,
        },
        features: {
            premium_support: false,
        },
    },
    BASIC: {
        price: 399.0,
        limits: {
            max_students: 10,
            max_pei_per_trimester: 10,
            max_weekly_plans: 40,
        },
        features: {
            premium_support: false,
        },
    },
    PREMIUM: {
        price: 697.0,
        limits: {
            max_students: 20,
            max_pei_per_trimester: 20,
            max_weekly_plans: 100,
        },
        features: {
            premium_support: true,
        },
    },
};

export const PRE_APPROVAL_STATUS_MAP: Record<SubscriptionStatus, string> = {
    ACTIVE: "authorized",
    CANCELLED: "cancelled",
    EXPIRED: "paused",
    INACTIVE: "paused",
    PENDING: "pending",
};
