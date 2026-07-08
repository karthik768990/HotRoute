import { WorkerPoolService } from "../worker-pool/worker-pool.service";
import { monitoringQueue } from "./queue";

const WORKER_COUNT = 5; // Default worker count

const globalForWorkerPool = globalThis as unknown as {
    __workerPool: WorkerPoolService | undefined;
};

export const workerPool = globalForWorkerPool.__workerPool ?? new WorkerPoolService({
    workerCount: WORKER_COUNT,
    queue: monitoringQueue
});

if (process.env.NODE_ENV !== "production") {
    globalForWorkerPool.__workerPool = workerPool;
}
