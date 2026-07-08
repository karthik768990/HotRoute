import { QueueService } from "../queue/queue.service";


export interface SchedulerDependencies{
    queue: QueueService
}
