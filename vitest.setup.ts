import { beforeAll, afterAll } from "vitest";
import dotenv from "dotenv";
import path from "path";

// 1. Force load the test environment variables BEFORE anything else imports prisma
dotenv.config({ path: path.resolve(__dirname, ".env.test"), override: true });

// Vitest automatically sets NODE_ENV to 'test', no need to assign it manually.

beforeAll(async () => {
    // Database is wiped once globally in vitest.global.ts
});

afterAll(async () => {
    // Cleanly disconnect Prisma after tests finish
    const { default: prisma } = await import("./src/lib/prisma");
    await prisma.$disconnect();
});
