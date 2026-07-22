import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, ".env.test"), override: true });

export default async function setup() {
    console.log("[Global Setup] Connected to test database:", process.env.DATABASE_URL?.split('@')[1]);

    if (!process.env.DATABASE_URL?.includes("neondb")) {
        console.warn("⚠️ WARNING: Test database URL does not contain 'neondb'. Skipping wipe.");
        return;
    }

    const { default: prisma } = await import("./src/lib/prisma");

    try {
        console.log("[Global Setup] Wiping test database tables...");
        await prisma.pingLog.deleteMany();
        await prisma.project.deleteMany();
        await prisma.user.deleteMany();
        console.log("[Global Setup] Database wiped successfully.");
    } catch (error) {
        console.error("[Global Setup] Failed to wipe database:", error);
    } finally {
        await prisma.$disconnect();
    }
}
