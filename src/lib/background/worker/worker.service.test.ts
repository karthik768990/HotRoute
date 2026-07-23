import { beforeEach, it, describe, vi, expect, Mock } from "vitest";

import { InMemoryQueue } from "../queue/queue.memory";
import { WorkerService } from "./worker.service";

let queue: InMemoryQueue;
let performPingMock: Mock;
let worker: WorkerService;

beforeEach(() => {
    queue = new InMemoryQueue();
    performPingMock = vi.fn();

    worker = new WorkerService(
        1,
        queue,
        performPingMock
    );
});

describe('worker service', () => {
    describe('notify() / processNextJob()', () => {
        it('should not call perform ping when queue is empty', async () => {
            await worker.notify();
            expect(performPingMock).not.toHaveBeenCalled();
        });

        it('should call perform ping when job exists', async () => {
            await queue.enqueue({ projectId: 'project-1' });
            // Don't call notify, call processNextJob directly for testing
            await worker.processNextJob();

            expect(performPingMock).toHaveBeenCalledTimes(1);
            expect(performPingMock).toHaveBeenCalledWith({ projectId: 'project-1' });
        });

        it('should process all available jobs in one call', async () => {
            await queue.enqueue({ projectId: 'project-1' });
            await queue.enqueue({ projectId: 'project-2' });

            await worker.processNextJob();

            expect(performPingMock).toHaveBeenCalledTimes(2);
            expect(performPingMock).toHaveBeenNthCalledWith(1, { projectId: 'project-1' });
            expect(performPingMock).toHaveBeenNthCalledWith(2, { projectId: 'project-2' });
            expect(await queue.size()).toBe(0);
        });

        it('should remove job from queue after successful processing (ACK)', async () => {
            await queue.enqueue({ projectId: 'project-1' });
            expect(await queue.size()).toBe(1);

            await worker.processNextJob();

            expect(await queue.size()).toBe(0);
        });

        it('should NOT remove job from queue if performPing fails (no ACK)', async () => {
            performPingMock.mockRejectedValue(new Error('Ping failed'));

            await queue.enqueue({ projectId: 'project-1' });

            await expect(worker.processNextJob()).resolves.not.toThrow();

            // Job is not removed, it's just leased
            expect(await queue.size()).toBe(1);
            
            // Should not be available to lease again immediately
            const job = await queue.leaseJob(2);
            expect(job).toBeNull();
        });

        it('should return immediately if already processing', async () => {
            await queue.enqueue({ projectId: 'project-1' });
            
            // Make ping slow so we can call processNextJob again while it runs
            performPingMock.mockImplementation(async () => {
                await new Promise(r => setTimeout(r, 50));
            });

            const p1 = worker.processNextJob();
            const p2 = worker.processNextJob(); // Should return immediately

            await Promise.all([p1, p2]);

            // Only called once because the second call returned early due to processing flag
            expect(performPingMock).toHaveBeenCalledTimes(1);
        });
    });
});