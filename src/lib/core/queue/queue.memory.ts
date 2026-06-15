import { QueueService } from "./queue.service";
import { PingJob } from "./queue.types";
import { NullJobError } from "./helpers/queue.errors";
import { QueueListener } from "./queue.listener";
import { QueueEvents } from "./queue.events";
import { DuplicateListenerError, NullListenerError } from "./helpers/listener.types";




export class InMemoryQueue implements QueueService,QueueEvents{
    private jobs : PingJob[] = [];
    private listeners= new Set<QueueListener>();






    async enqueue(job:PingJob): Promise<void>{
        if(!job){
            throw new NullJobError("Job cannot be empty")
        }
        this.jobs.push(job)

        for(const listener of  this.listeners){
            try{await listener.notify()}
            catch(error: any){
                throw new Error(error.message);
            }
        }
    }

    async dequeue() : Promise<PingJob | null>{
        if(this.jobs.length===0){
            return null
        }
        const job = this.jobs.shift()
        return job??null
    }

    async size() : Promise<number>{
        return this.jobs.length
    }
    


    async subscribe(listener: QueueListener):Promise<void>{
        if(!listener){
            throw new NullListenerError("listener is empty ")
        }

        this.listeners.add(listener)
    }
    
    async unsubscribe(listener:QueueListener):Promise<void>{
        if(!listener){
            throw new NullListenerError("listener is empty")
        }
        this.listeners.delete(listener)
    }
    
}