import { PingJob } from "./queue.types";

export interface QueueService{
    enqueue(job:PingJob): Promise<void>
    dequeue() : Promise<PingJob | null>
    size() : Promise<number>

}