import { beforeEach, describe, expect, it, vi } from "vitest";
import { InMemoryQueue } from "./queue.memory";
import { PingJob } from "./queue.types";
import { NullJobError } from "./helpers/queue.errors";
import { QueueListener } from "./queue.listener";

let queue: InMemoryQueue;

describe('In-memory queue module', () => {
    beforeEach(() => {
        queue = new InMemoryQueue();
        vi.useFakeTimers();
    });

    describe('enqueue()', () => {
        it('should start with the size 0', async () => {
            expect(await queue.size()).toBe(0);
        });

        it('should increase the size upon enqueue', async () => {
            const initialSize = await queue.size();
            const job: PingJob = { projectId: 'project-1' };
            await queue.enqueue(job);
            expect(await queue.size()).toBe(initialSize + 1);
        });

        it('should throw enqueueing null job', async () => {
            await expect(queue.enqueue(null as unknown as PingJob)).rejects.toThrow(NullJobError);
        });
    });

    describe('leaseJob() & ackJob()', () => {
        it('should return null when queue is empty', async () => {
            const result = await queue.leaseJob(1);
            expect(result).toBeNull();
        });

        it('should lease a job and mark it as leased', async () => {
            await queue.enqueue({ projectId: 'project-1' });
            const job = await queue.leaseJob(1);
            expect(job).not.toBeNull();
            expect(job?.projectId).toBe('project-1');
            expect(job?.status).toBe('leased');
            expect(job?.leasedBy).toBe(1);
        });

        it('should not allow another worker to lease an active job', async () => {
            await queue.enqueue({ projectId: 'project-1' });
            await queue.leaseJob(1);
            const job2 = await queue.leaseJob(2);
            expect(job2).toBeNull(); // No other jobs available
        });

        it('should allow ack from the same worker and remove job', async () => {
            await queue.enqueue({ projectId: 'project-1' });
            const job = await queue.leaseJob(1);
            expect(await queue.size()).toBe(1);

            await queue.ackJob(job!.jobId, 1);
            expect(await queue.size()).toBe(0);
        });

        it('should fail ack from a different worker', async () => {
            await queue.enqueue({ projectId: 'project-1' });
            const job = await queue.leaseJob(1);

            await expect(queue.ackJob(job!.jobId, 2)).rejects.toThrow();
            expect(await queue.size()).toBe(1); // Still in queue
        });
    });

    describe('lease expiration & retry', () => {
        it('should allow another worker to lease after timeout', async () => {
            await queue.enqueue({ projectId: 'project-1' });
            await queue.leaseJob(1);

            // Advance time past LEASE_TIMEOUT (100,000 ms)
            vi.advanceTimersByTime(100001);

            const job2 = await queue.leaseJob(2);
            expect(job2).not.toBeNull();
            expect(job2?.leasedBy).toBe(2);
            expect(job2?.retryCount).toBe(1);
        });

        it('should renew lease to extend timeout', async () => {
            await queue.enqueue({ projectId: 'project-1' });
            const job = await queue.leaseJob(1);

            vi.advanceTimersByTime(50000);
            await queue.renewLease(job!.jobId, 1);

            vi.advanceTimersByTime(60000); // Total 110,000, but renewed at 50,000, so expires at 150,000

            const job2 = await queue.leaseJob(2);
            expect(job2).toBeNull(); // Still leased by 1
        });

        it('should move to dead letter queue after max retries', async () => {
            await queue.enqueue({ projectId: 'project-1' });

            for (let i = 0; i <= 5; i++) {
                await queue.leaseJob(1);
                vi.advanceTimersByTime(100001);
            }

            // Next lease should fail as it moves to DLQ
            const job = await queue.leaseJob(2);
            expect(job).toBeNull();
            expect(await queue.size()).toBe(0);

            const dlq = await queue.getDeadLetterQueue();
            expect(dlq.length).toBe(1);
            expect(dlq[0].originalJob.projectId).toBe('project-1');
            expect(dlq[0].retryCount).toBe(6);
        });
        
        it('should requeue from dead letter queue', async () => {
            await queue.enqueue({ projectId: 'project-1' });

            for (let i = 0; i <= 5; i++) {
                await queue.leaseJob(1);
                vi.advanceTimersByTime(100001);
            }
            // Move to DLQ on 6th attempt
            await queue.leaseJob(1);

            const dlq = await queue.getDeadLetterQueue();
            expect(dlq.length).toBe(1);

            await queue.requeueDeadLetterJob(dlq[0].originalJob.jobId);
            
            expect(await queue.size()).toBe(1);
            expect((await queue.getDeadLetterQueue()).length).toBe(0);
            
            const reqJob = await queue.leaseJob(1);
            expect(reqJob?.retryCount).toBe(0); // Retry count reset
            expect(reqJob?.projectId).toBe('project-1');
        });
    });

    describe('subscribe() & unsubscribe()', () => {
        it('should register the listener', async () => {
            const listener = { notify: vi.fn().mockResolvedValue(undefined) };
            await queue.subscribe(listener);
            await queue.enqueue({ projectId: 'project-1' });
            expect(listener.notify).toHaveBeenCalledTimes(1);
        });

        it('should not remove the job after notification', async () => {
            const listener = { notify: vi.fn().mockResolvedValue(undefined) };
            await queue.subscribe(listener);
            await queue.enqueue({ projectId: 'project-1' });
            expect(await queue.size()).toBe(1);
        });

        it('should throw when subscribing null listener', async () => {
            await expect(queue.subscribe(null as unknown as QueueListener)).rejects.toThrow();
        });

        it('should unsubscribe listener', async () => {
            const listener = { notify: vi.fn().mockResolvedValue(undefined) };
            await queue.subscribe(listener);
            await queue.unsubscribe(listener);
            await queue.enqueue({ projectId: 'project-1' });
            expect(listener.notify).not.toHaveBeenCalled();
        });
    });
});