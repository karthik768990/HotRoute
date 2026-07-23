import { QueueListener } from "../queue/queue.listener";
import { QueueService } from "../queue/queue.service";
import { performPing } from "../../ping/ping.service";



export class WorkerService implements QueueListener {

 
    private processing: boolean = false; 



    constructor(private readonly workerId: number,
        private readonly queue: QueueService,
        private readonly performPingFn = performPing
    ) { }


    async notify(): Promise<void> {
        await this.processNextJob();
    }

    async processNextJob(): Promise<void> {
        if (this.processing) return;
        this.processing = true;

        try {
            while (true) {
                const job = await this.queue.leaseJob(this.workerId);
                if (!job) break;

                try {
                    await this.performPingFn({ projectId: job.projectId });
                    await this.queue.ackJob(job.jobId, this.workerId);
                } catch (jobError) {
                    console.error(`Job ${job.jobId} failed: ${jobError instanceof Error ? jobError.message : String(jobError)}`);
                    // Note: Intentionally not acknowledging so the lease expires
                }
            }
        } catch (error) {
            console.error(`Worker error: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            this.processing = false;
        }
    }
}