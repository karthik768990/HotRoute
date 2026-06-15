import { beforeEach, describe, expect, it, vi } from "vitest";
import { InMemoryQueue } from "./queue.memory";
import { PingJob } from "./queue.types";
import { NullJobError } from "./helpers/queue.errors";
import { unsubscribe } from "diagnostics_channel";

let queue: InMemoryQueue

describe('In-memory queue module', () => {
    beforeEach(() => {
        queue = new InMemoryQueue()
    })

    describe('enqueue()', () => {
        it('should start with the size 0', async () => {
            expect(await queue.size()).toBe(0)
        })

        it('should increase the size upon enqueue', async () => {
            const initialSize = await queue.size()
            const job: PingJob = {
                projectId: 'eoigherger'
            }
            queue.enqueue(job)
            expect(await queue.size()).toBe(initialSize + 1)
        })
    })
    describe('dequeue()', () => {

        it('should dequeue the inserted job ', async () => {
            const job: PingJob = {
                projectId: 'eoigherger'
            }
            queue.enqueue(job)
            const result = await queue.dequeue()
            expect(result).toEqual(job)
        })

        it('should decrease the size after the dequeue ', async () => {
            const job: PingJob = {
                projectId: 'eoigherger'
            }
            queue.enqueue(job)
            const size = await queue.size()
            const result = await queue.dequeue()
            const newSize = await queue.size()
            expect(newSize).toBe(size - 1)
        })
        it('should return null when the queue is empty ', async () => {

            const result = await queue.dequeue()
            expect(result).toBe(null)
        })

        it('should dequeue jobs in FIFO order', async () => {
            const job1: PingJob = { projectId: 'project-1' }
            const job2: PingJob = { projectId: 'project-2' }
            const job3: PingJob = { projectId: 'project-3' }
            await queue.enqueue(job1)
            await queue.enqueue(job2)
            await queue.enqueue(job3)
            expect(await queue.dequeue()).toBe(job1)
            expect(await queue.dequeue()).toBe(job2)
            expect(await queue.dequeue()).toBe(job3)

        })

        it('should throw enqueueing null job', async () => {
            await expect(queue.enqueue(null as any)).rejects.toThrow(NullJobError)

        })

    })

    describe('subscribe()', () => {

        
        it('should register the listener', async () => {
            const listener = {
                notify: vi.fn().mockResolvedValue(undefined)
            };

            await queue.subscribe(listener);

            await queue.enqueue({
                projectId: 'project-1'
            });

            expect(listener.notify).toHaveBeenCalledTimes(1);
        });

        it('should notify multiple listeners', async () => {
            const listener1 = {
                notify: vi.fn().mockResolvedValue(undefined)
            };

            const listener2 = {
                notify: vi.fn().mockResolvedValue(undefined)
            };

            await queue.subscribe(listener1);
            await queue.subscribe(listener2);

            await queue.enqueue({
                projectId: 'project-1'
            });

            expect(listener1.notify).toHaveBeenCalledTimes(1);
            expect(listener2.notify).toHaveBeenCalledTimes(1);
        });



        it('should not remove the job after notification', async () => {
            const listener = {
                notify: vi.fn().mockResolvedValue(undefined)
            };

            await queue.subscribe(listener);

            await queue.enqueue({
                projectId: 'project-1'
            });

            expect(await queue.size()).toBe(1);
        });



        it('should throw when subscribing null listener', async () => {
            await expect(
                queue.subscribe(null as any)
            ).rejects.toThrow();
        });
    })
    describe('unsubscribe()', () => {


        it('should unsubscribe listener', async () => {
            const listener = {
                notify: vi.fn().mockResolvedValue(undefined)
            };

            await queue.subscribe(listener);

            await queue.unsubscribe(listener);

            await queue.enqueue({
                projectId: 'project-1'
            });

            expect(listener.notify).not.toHaveBeenCalled();
        });

        it('should unsubscribe only target listener', async () => {
            const listener1 = {
                notify: vi.fn().mockResolvedValue(undefined)
            };

            const listener2 = {
                notify: vi.fn().mockResolvedValue(undefined)
            };

            await queue.subscribe(listener1);
            await queue.subscribe(listener2);

            await queue.unsubscribe(listener1);

            await queue.enqueue({
                projectId: 'project-1'
            });

            expect(listener1.notify).not.toHaveBeenCalled();

            expect(listener2.notify).toHaveBeenCalledTimes(1);
        });


        it('should throw when unsubscribing null listener', async () => {
            await expect(
                queue.unsubscribe(null as any)
            ).rejects.toThrow();
        });
    })

})