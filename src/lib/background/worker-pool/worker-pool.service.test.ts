import { describe, it, beforeEach, afterEach, expect, vi, MockInstance } from "vitest";

import { InMemoryQueue } from "../queue/queue.memory";
import { WorkerPoolService } from "./worker-pool.service";
import { NegativeWorkerCountError } from "./worker-pool.errors";

// Adjust this import path to match where your performPing is located
import * as pingService from "../../ping/ping.service";

// Mock the ping service to prevent actual network calls and allow call counting
vi.mock("../../ping/ping.service", () => ({
    performPing: vi.fn()
}));

// Helper to flush the microtask queue so async event listeners complete
const flushPromises = () => new Promise(setImmediate);

let queue: InMemoryQueue;
let consoleErrorSpy: MockInstance;

describe('worker-pool module', () => {

    beforeEach(() => {
        queue = new InMemoryQueue();
        // Spy on console.error to keep terminal output clean during fault-tolerance tests
        consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('initialize()', () => {

        it('should create the configured number of workers ', async () => {
            const pool = new WorkerPoolService({
                workerCount: 3,
                queue
            });
            await pool.initialize();
            expect(pool.getWorkerCount()).toBe(3);
        });

        it('should subscribe to all workers', async () => {
            const subscribeSpy = vi.spyOn(queue, 'subscribe');

            const pool = new WorkerPoolService({
                workerCount: 3,
                queue
            });
            await pool.initialize();
            expect(subscribeSpy).toHaveBeenCalledTimes(3);
        });

        it('should throw when worker count is zero', async () => {
            const pool = new WorkerPoolService({
                workerCount: 0,
                queue
            });
            await expect(pool.initialize()).rejects.toThrow(NegativeWorkerCountError);
        });

        it('should throw when worker count is negative', async () => {
            const pool = new WorkerPoolService({
                workerCount: -2344,
                queue
            });
            await expect(pool.initialize()).rejects.toThrow(NegativeWorkerCountError);
        });

        it('should create one worker when the count is one ', async () => {
            const pool = new WorkerPoolService({
                workerCount: 1,
                queue
            });
            await pool.initialize();

            expect(pool.getWorkerCount()).toBe(1);
        });

    });

    describe("multi worker correctness checking", () => {
        
        it("should process single job exactly once with multiple workers", async () => {
            const pool = new WorkerPoolService({ workerCount: 3, queue });
            await pool.initialize();

            // Enqueue a single job
            await queue.enqueue({ projectId: "single-job-id" });
            
            // Wait for workers to process
            await flushPromises();

            // Assertions: No duplicate processing (Thundering Herd mitigated)
            expect(pingService.performPing).toHaveBeenCalledTimes(1);
            // FIXED: Added await here
            expect(await queue.size()).toBe(0);
        });

        it("should process all jobs when worker count equals job count", async () => {
            const pool = new WorkerPoolService({ workerCount: 3, queue });
            await pool.initialize();

            await queue.enqueue({ projectId: "job-1" });
            await queue.enqueue({ projectId: "job-2" });
            await queue.enqueue({ projectId: "job-3" });
            
            await flushPromises();

            expect(pingService.performPing).toHaveBeenCalledTimes(3);
            // FIXED: Added await here
            expect(await queue.size()).toBe(0);
        });

        it("should process all jobs when jobs exceed workers", async () => {
            // Boundary: 3 workers, 10 jobs
            const pool = new WorkerPoolService({ workerCount: 3, queue });
            await pool.initialize();

            for (let i = 0; i < 10; i++) {
                await queue.enqueue({ projectId: `job-${i}` });
            }
            
            await flushPromises();

            // Assertions: Queue drains completely and all jobs processed
            expect(pingService.performPing).toHaveBeenCalledTimes(10);
            // FIXED: Added await here
            expect(await queue.size()).toBe(0);
        });

        it("should process single job when workers exceed jobs", async () => {
            // Boundary: 5 workers, 1 job
            const pool = new WorkerPoolService({ workerCount: 5, queue });
            await pool.initialize();

            await queue.enqueue({ projectId: "lone-job" });
            
            await flushPromises();

            expect(pingService.performPing).toHaveBeenCalledTimes(1);
            // FIXED: Added await here
            expect(await queue.size()).toBe(0);
        });

        it("should continue processing remaining jobs when one job fails", async () => {
            // Force the 2nd call to throw an error (Poison Pill)
            vi.mocked(pingService.performPing)
                .mockResolvedValueOnce(null as never)                 // job 1: success
                .mockRejectedValueOnce(new Error("Ping failed"))    // job 2: throws
                .mockResolvedValueOnce(null as never);                // job 3: success

            const pool = new WorkerPoolService({ workerCount: 3, queue });
            await pool.initialize();

            await queue.enqueue({ projectId: "job-1" });
            await queue.enqueue({ projectId: "job-2" }); // This one will throw internally
            await queue.enqueue({ projectId: "job-3" });
            
            await flushPromises();

            // Assertions: Even though a job threw, the system didn't crash
            // and all subsequent jobs were still processed
            expect(pingService.performPing).toHaveBeenCalledTimes(3);
            
            // Verify our worker caught the error properly
            expect(consoleErrorSpy).toHaveBeenCalledWith("Error :Ping failed");
            
            // FIXED: Added await here
            expect(await queue.size()).toBe(0);
        });

    });

});