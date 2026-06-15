import { QueueListener } from "../queue/queue.listener";
import { QueueService } from "../queue/queue.service";
import { performPing } from "../ping/ping.service";



export class WorkerService implements QueueListener {

    // TODO:
    // Use this when introducing worker concurrency control
    // to prevent overlapping processing in the same worker.
    private processing: boolean = false; // dont use it rather



    constructor(private readonly workerId: number,
        private readonly queue: QueueService,
        private readonly performPingFn = performPing
    ) { }


    async notify(): Promise<void> {
        await this.processNextJob();
    }

    async processNextJob(): Promise<void> {
        const job = await this.queue.dequeue()
        if (!job) return;

        try {
            await this.performPingFn({ projectId: job.projectId })
            return;
        } catch (error: any) {
            console.error(`Error :${error.message}`)
        }
    }
}