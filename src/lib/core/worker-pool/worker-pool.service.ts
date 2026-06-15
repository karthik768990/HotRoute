import { WorkerService } from "../worker/worker.service";
import { NegativeWorkerCountError } from "./worker-pool.errors";
import { WorkerPoolConfig } from "./worker-pool.types";

export class WorkerPoolService{
    private workers: WorkerService[] = []
    constructor(
        private readonly config: WorkerPoolConfig
    ){}

    async initialize():Promise<void>{
        if(this.config.workerCount <=0) throw new NegativeWorkerCountError("Worker cannot be zero or negative ")
            
            for(let workerId = 1; workerId<=this.config.workerCount;workerId++){
                const worker = new WorkerService(workerId,this.config.queue)

                await this.config.queue.subscribe(worker)
                this.workers.push(worker)
            }
            
        }

     getWorkerCount(): number{
        return this.workers.length
    }    
}