import { InMemoryQueue } from "../core/queue/queue.memory";

const globalForQueue = globalThis as unknown as {
    __monitoringQueue: InMemoryQueue | undefined;
};

export const monitoringQueue = globalForQueue.__monitoringQueue ?? new InMemoryQueue();

if (process.env.NODE_ENV !== "production") {
    globalForQueue.__monitoringQueue = monitoringQueue;
}
