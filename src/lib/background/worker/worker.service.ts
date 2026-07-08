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
        try {
            const job = await this.queue.dequeue()
            if (!job) return;

            await this.performPingFn({ projectId: job.projectId })
            return;
        } catch (error) {
            console.error(`Error :${error instanceof Error ? error.message : String(error)}`)
        }
    }
}