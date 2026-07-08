import { beforeEach, it, describe, vi, expect, Mock } from "vitest";

import { InMemoryQueue } from "../queue/queue.memory";
import { WorkerService } from "./worker.service";

let queue: InMemoryQueue;
let performPingMock: Mock
let worker: WorkerService


beforeEach(() => {
    queue = new InMemoryQueue()
    performPingMock = vi.fn()

    worker = new WorkerService(
        1,
        queue,
        performPingMock
    )

})


describe('worker service ', () => {
    describe('notify()', () => {
        it('should not call perform ping when queue is empty ', async () => {
            await worker.notify()
            expect(performPingMock).not.toHaveBeenCalled()
        })

        it('should call perform ping when job exists', async () => {

            await queue.enqueue({
                projectId: 'project-1'
            })
            await worker.notify()

            expect(performPingMock).toHaveBeenCalledTimes(1)
        })

        it('should pass correct project id to performPing', async () => {
            await queue.enqueue({
                projectId: 'project-1'
            });

            await worker.notify();

            expect(performPingMock).toHaveBeenCalledWith({
                projectId: 'project-1'
            });
        });


        it('should survive performPing errors', async () => {
            performPingMock.mockRejectedValue(
                new Error('Ping failed')
            );

            await queue.enqueue({
                projectId: 'project-1'
            });

            await expect(
                worker.notify()
            ).resolves.not.toThrow();
        });

        it('should remove job from queue after processing', async () => {
            await queue.enqueue({
                projectId: 'project-1'
            });

            expect(await queue.size()).toBe(1);

            await worker.processNextJob();

            expect(await queue.size()).toBe(0);
        });

        it('should process jobs in FIFO order', async () => {
            await queue.enqueue({
                projectId: 'project-1'
            });

            await queue.enqueue({
                projectId: 'project-2'
            });

            await worker.processNextJob();

            expect(performPingMock).toHaveBeenNthCalledWith(
                1,
                {
                    projectId: 'project-1'
                }
            );

            await worker.processNextJob();

            expect(performPingMock).toHaveBeenNthCalledWith(
                2,
                {
                    projectId: 'project-2'
                }
            );
        });


        it('should return when queue is empty', async () => {
            await expect(
                worker.processNextJob()
            ).resolves.not.toThrow();
        });

    })
})