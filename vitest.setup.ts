import { beforeAll, afterAll } from "vitest";
import dotenv from "dotenv";
import path from "path";

// 1. Force load the test environment variables BEFORE anything else imports prisma
dotenv.config({ path: path.resolve(__dirname, ".env.test"), override: true });

// Vitest automatically sets NODE_ENV to 'test', no need to assign it manually.

// 2. Import prisma AFTER the environment variables are securely overridden
import prisma from "./src/lib/prisma";

beforeAll(async () => {
    console.log("[Test Setup] Connected to test database:", process.env.DATABASE_URL?.split('@')[1]);

    // Safety check: ABSOLUTELY ensure we are not wiping a production or development database
    if (!process.env.DATABASE_URL?.includes("hotroute_test")) {
        console.warn("⚠️ WARNING: Test database URL does not contain 'hotroute_test'.");
        console.warn("⚠️ Skipping automatic database truncation to prevent accidental data loss.");
        return;
    }

    try {
        // 3. Completely wipe the test database to ensure a pristine state for every test run
        console.log("[Test Setup] Wiping test database tables...");
        
        // Delete in order to respect foreign key constraints
        await prisma.pingLog.deleteMany();
        await prisma.project.deleteMany();
        await prisma.user.deleteMany();

        console.log("[Test Setup] Database wiped successfully.");
    } catch (error) {
        console.error("[Test Setup] Failed to wipe database:", error);
    }
});

afterAll(async () => {
    // Cleanly disconnect Prisma after tests finish
    await prisma.$disconnect();
});
