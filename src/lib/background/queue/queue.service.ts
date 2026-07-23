import { PingJob, QueuedJob, DeadLetterJob } from "./queue.types";
import { QueueListener } from "./queue.listener";

export interface QueueService {
    enqueue(job: PingJob): Promise<void>;
    leaseJob(workerId: number): Promise<QueuedJob | null>;
    ackJob(jobId: string, workerId: number): Promise<void>;
    renewLease(jobId: string, workerId: number): Promise<void>;
    size(): Promise<number>;
    subscribe(listener: QueueListener): Promise<void>;
    unsubscribe(listener: QueueListener): Promise<void>;
    
    // DLQ Methods
    getDeadLetterQueue(): Promise<DeadLetterJob[]>;
    requeueDeadLetterJob(jobId: string): Promise<void>;
    removeDeadLetterJob(jobId: string): Promise<void>;
}
