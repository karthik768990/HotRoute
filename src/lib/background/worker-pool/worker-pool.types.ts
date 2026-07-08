import { QueueEvents } from "../queue/queue.events";
import { QueueService } from "../queue/queue.service";

export interface WorkerPoolConfig{
    workerCount : number
    queue: QueueService & QueueEvents
}
