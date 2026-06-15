import { QueueListener } from "./queue.listener";

export interface QueueEvents{
    subscribe(listener: QueueListener):Promise<void>

    unsubscribe(listener: QueueListener): Promise<void>;
}
