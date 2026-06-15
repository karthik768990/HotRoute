import { QueueService } from "../queue/queue.service";

export interface WorkerDependencies{
    queue  : QueueService
}
