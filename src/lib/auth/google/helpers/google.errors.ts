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