import { startScheduler } from "./scheduler";
import { workerPool } from "./worker-pool";

const globalForBootstrap = globalThis as unknown as {
    __isBootstrapped: boolean | undefined;
};

export async function bootstrap() {
    if (globalForBootstrap.__isBootstrapped) {
        console.log("[Monitoring System] Already bootstrapped. Skipping.");
        return;
    }

    console.log("[Monitoring System] Bootstrapping...");

    try {
        await workerPool.initialize();
        console.log(`[Monitoring System] Worker pool initialized with ${workerPool.getWorkerCount()} workers.`);

        startScheduler();
        console.log("[Monitoring System] Scheduler started.");

        globalForBootstrap.__isBootstrapped = true;
        console.log("[Monitoring System] Bootstrapped successfully.");
    } catch (error) {
        console.error("[Monitoring System] Failed to bootstrap:", error);
        // Depending on requirements, we might want to throw or exit process,
        // but for safety in Next.js we log it.
    }
}
