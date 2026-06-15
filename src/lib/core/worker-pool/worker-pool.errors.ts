export class  NegativeWorkerCountError extends Error{
    constructor(message:string){
        super(message)
        this.name = 'NegativeWorkerCountError'
    }
}