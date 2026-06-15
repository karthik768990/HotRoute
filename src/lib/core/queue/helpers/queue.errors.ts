export  class NullJobError extends Error{
    constructor(message: string){
        super(message)
        this.name = 'NullJobError'
    }
}