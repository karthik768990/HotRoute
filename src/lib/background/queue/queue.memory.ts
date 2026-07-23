import { QueueService } from "./queue.service";
import { PingJob, QueuedJob, DeadLetterJob } from "./queue.types";
import { NullJobError } from "./helpers/queue.errors";
import { QueueListener } from "./queue.listener";
import { QueueEvents } from "./queue.events";
import { NullListenerError } from "./helpers/listener.types";
import { randomUUID } from "crypto";

const LEASE_TIMEOUT = 100000; // 100 seconds in ms
const MAX_RETRIES = 5;

export class InMemoryQueue implements QueueService, QueueEvents {
    private jobs: QueuedJob[] = [];
    private dlq: DeadLetterJob[] = [];
    private listeners = new Set<QueueListener>();

    async enqueue(job: PingJob): Promise<void> {
        if (!job) {
            throw new NullJobError("Job cannot be empty")
        }
        
        const queuedJob: QueuedJob = {
            ...job,
            jobId: randomUUID(),
            createdAt: new Date(),
            status: 'queued',
            leasedBy: null,
            leasedUntil: null,
            retryCount: 0
        };

        this.jobs.push(queuedJob)

        for (const listener of this.listeners) {
            try { await listener.notify() }
            catch (error) {
                throw new Error(error instanceof Error ? error.message : String(error));
            }
        }
    }

    async leaseJob(workerId: number): Promise<QueuedJob | null> {
        const now = new Date();

        for (let i = 0; i < this.jobs.length; i++) {
            const job = this.jobs[i];
            
            if (job.status === 'queued' || (job.status === 'leased' && job.leasedUntil && job.leasedUntil < now)) {
                if (job.status === 'leased') {
                    // Lease expired
                    job.retryCount++;
                    if (job.retryCount > MAX_RETRIES) {
                        // Move to DLQ
                        this.dlq.push({
                            originalJob: { ...job },
                            retryCount: job.retryCount,
                            lastErrorMessage: "Lease expired repeatedly",
                            failedAt: new Date()
                        });
                        this.jobs.splice(i, 1);
                        i--; // Adjust index after removal
                        continue;
                    }
                }
                
                job.status = 'leased';
                job.leasedBy = workerId;
                job.leasedUntil = new Date(now.getTime() + LEASE_TIMEOUT);
                return job;
            }
        }

        return null;
    }

    async ackJob(jobId: string, workerId: number): Promise<void> {
        const index = this.jobs.findIndex(j => j.jobId === jobId);
        if (index === -1) {
            throw new Error(`Job ${jobId} not found`);
        }
        
        const job = this.jobs[index];
        if (job.leasedBy !== workerId) {
            throw new Error(`Worker ${workerId} cannot ack job leased by ${job.leasedBy}`);
        }
        
        this.jobs.splice(index, 1);
    }

    async renewLease(jobId: string, workerId: number): Promise<void> {
        const job = this.jobs.find(j => j.jobId === jobId);
        if (!job) {
            throw new Error(`Job ${jobId} not found`);
        }
        if (job.leasedBy !== workerId) {
            throw new Error(`Worker ${workerId} cannot renew lease for job leased by ${job.leasedBy}`);
        }
        
        job.leasedUntil = new Date(Date.now() + LEASE_TIMEOUT);
    }

    async size(): Promise<number> {
        return this.jobs.length
    }

    async subscribe(listener: QueueListener): Promise<void> {
        if (!listener) {
            throw new NullListenerError("listener is empty ")
        }
        this.listeners.add(listener)
    }
    
    async unsubscribe(listener: QueueListener): Promise<void> {
        if (!listener) {
            throw new NullListenerError("listener is empty")
        }
        this.listeners.delete(listener)
    }

    // DLQ Methods
    async getDeadLetterQueue(): Promise<DeadLetterJob[]> {
        return [...this.dlq];
    }

    async requeueDeadLetterJob(jobId: string): Promise<void> {
        const index = this.dlq.findIndex(dj => dj.originalJob.jobId === jobId);
        if (index === -1) {
            throw new Error(`Dead letter job ${jobId} not found`);
        }

        const dlqJob = this.dlq[index];
        this.dlq.splice(index, 1);

        const requeuedJob: QueuedJob = {
            ...dlqJob.originalJob,
            status: 'queued',
            leasedBy: null,
            leasedUntil: null,
            retryCount: 0
        };

        this.jobs.push(requeuedJob);

        for (const listener of this.listeners) {
            try { await listener.notify() }
            catch (error) {
                console.error("Error notifying listener on requeue:", error);
            }
        }
    }

    async removeDeadLetterJob(jobId: string): Promise<void> {
        const index = this.dlq.findIndex(dj => dj.originalJob.jobId === jobId);
        if (index !== -1) {
            this.dlq.splice(index, 1);
        }
    }
}