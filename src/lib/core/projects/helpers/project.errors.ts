
export class ProjectValidationError extends Error{
    constructor(message:string){
        super(message)
        this.name = 'ProjectValidationError'
    }
}
export class UserValidationError extends Error{
    constructor(message: string){
        super(message)
        this.name= 'UserValidationError'
    }
}
export class InvalidIntervalError extends ProjectValidationError{
    constructor(message:string){
        super(message)
        this.name = 'InvalidIntervalError'
    }
    
}

export class InvalidProjectNameError extends ProjectValidationError{
    constructor(message: string){
        super(message)
        this.name = 'InvalidProjectNameError'
    }
}

export class InvalidProjectUrlError extends ProjectValidationError{
    constructor(message: string){
        super(message)
        this.name = 'InvalidProjectUrlError'
    }
}


export class UnsafeMonitoringTargetError extends ProjectValidationError{
    constructor(message: string){
        super(message)
        this.name = 'UnsafeMonitoringTargetError'
    }
}

export class UserNotFoundError extends UserValidationError{
    constructor(message: string){
        super(message)
        this.name = 'UserNotFoundError'
    }
}


export class UserNotVerifiedError extends UserValidationError{
    constructor(message: string){
        super(message)
        this.name = 'UserNotVerifiedError'
    }
}



// DuplicateProjectError



// this the extension for defining the errors and their classes 

export class UnauthorizedProjectAccessError extends Error{
    constructor(message: string){
        super(message)
        this.name = "UnauthorizedProjectAccessError"
    }
}

export class ProjectNotFoundError extends Error{
    constructor(message:string){
        super(message)
        this.name= 'ProjectNotFoundError'
    }
}