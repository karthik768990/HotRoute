import { describe, it, beforeEach, expect, vi } from "vitest";

import { InMemoryQueue } from "../queue/queue.memory";
import { WorkerPoolService } from "./worker-pool.service";
import { NegativeWorkerCountError } from "./worker-pool.errors";

let queue: InMemoryQueue

describe('worker-pool module ', () => {

    beforeEach(() => {
        queue = new InMemoryQueue()
    })

    describe('initialize()', () => {

        it('should create the configured number of workers ', async () => {
            const pool = new WorkerPoolService({
                workerCount: 3,
                queue
            })
            await pool.initialize()
            expect(pool.getWorkerCount()).toBe(3)

        })

        it('should subscribe to all workers', async () => {
            const subscribeSpy = vi.spyOn(queue, 'subscribe')

            const pool = new WorkerPoolService({
                workerCount: 3,
                queue
            })
            await pool.initialize()
            expect(subscribeSpy).toHaveBeenCalledTimes(3)

        })
        it('should throw when worker count is zero', async () => {
            const pool = new WorkerPoolService({
                workerCount: 0,
                queue
            })
            await expect( pool.initialize()).rejects.toThrow(NegativeWorkerCountError)
        })

        it('should throw when worker count is negative', async () => {
            const pool = new WorkerPoolService({
                workerCount: -2344,
                queue
            })
            await expect( pool.initialize()).rejects.toThrow(NegativeWorkerCountError)
        })

        it('should create one worker when the count is one ', async () => {
            const pool = new WorkerPoolService({
                workerCount: 1,
                queue
            })
            await pool.initialize()

            expect(pool.getWorkerCount()).toBe(1)
        })

    })
})