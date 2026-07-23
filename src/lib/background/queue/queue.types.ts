export interface PingJob {
    projectId: string;
}

export type JobStatus = 'queued' | 'leased' | 'completed';

export interface QueuedJob extends PingJob {
    jobId: string;
    createdAt: Date;
    status: JobStatus;
    leasedBy: number | null;
    leasedUntil: Date | null;
    retryCount: number;
}

export interface DeadLetterJob {
    originalJob: QueuedJob;
    retryCount: number;
    lastErrorMessage: string;
    failedAt: Date;
}
