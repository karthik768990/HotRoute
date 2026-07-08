export class NullListenerError extends Error{
    constructor(message: string){
        super(message)
        this.name  = "NullListenerError"
    }
}

export class DuplicateListenerError extends Error{
    constructor(message: string){
        super(message)
        this.name = 'DuplicateListenerError'
    }
}