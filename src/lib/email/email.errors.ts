export class EmailServiceError extends Error {
    constructor(message: string = "Failed to send email. Please try again later.") {
        super(message);
        this.name = 'EmailServiceError';
    }
}
