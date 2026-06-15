import { QueueService } from "../queue/queue.service";
import { QueueEvents } from "../queue/queue.events";

export interface SchedulerDependencies{
    queue: QueueService
}
