export class InvalidGoogleTokenError extends Error {
    constructor(message: string = "Invalid or expired Google credential") {
        super(message);
        this.name = "InvalidGoogleTokenError";
    }
}

export class OAuthAccountRequiredError extends Error {
    constructor(message: string = "This account uses Google Sign-In. Please log in with Google.") {
        super(message);
        this.name = "OAuthAccountRequiredError";
    }
}

export class TokenExpiredError extends Error{
    constructor(message: string = "the token has expired"){
        super(message)
        this.name = 'TokenExpiredError';
    }
}

export class TokenDoesNotExistError extends Error{
    constructor(message: string = "token does not exist"){
        super(message)
        this.name = 'TokenDoesNotExistError'    
    }
}