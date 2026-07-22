import { ProjectInactiveError, ProjectNotFoundError, UserNotFoundError, UserNotVerifiedError, InvalidProjectUrlError, InvalidIntervalError, InvalidProjectNameError, ProjectValidationError, UserValidationError, UnsafeMonitoringTargetError, UnauthorizedProjectAccessError, DuplicateProjectError, AuthenticationRequiredError, InvalidCredentialsError, UserAlreadyExistsError, AlreadyVerifiedError } from "../projects/helpers/project.errors";
import { NullJobError } from "../background/queue/helpers/queue.errors";
import { NegativeWorkerCountError } from "../background/worker-pool/worker-pool.errors";
import { InvalidGoogleTokenError, OAuthAccountRequiredError, TokenExpiredError, TokenDoesNotExistError } from "../auth/google/helpers/google.errors";


export function mapErrorToStatus(error: Error): number {
    if (error instanceof ProjectNotFoundError || error instanceof UserNotFoundError || error instanceof TokenDoesNotExistError) return 404;
    if (error instanceof NullJobError || error instanceof NegativeWorkerCountError) return 422;
    if (error instanceof UserNotVerifiedError || error instanceof UnsafeMonitoringTargetError || error instanceof UnauthorizedProjectAccessError) return 403;
    if (error instanceof InvalidProjectNameError || error instanceof InvalidIntervalError || error instanceof InvalidProjectUrlError || error instanceof OAuthAccountRequiredError || error instanceof AlreadyVerifiedError || error instanceof TokenExpiredError) return 400;
    if (error instanceof AuthenticationRequiredError || error instanceof InvalidGoogleTokenError || error instanceof InvalidCredentialsError) return 401;
    if (error instanceof ProjectValidationError || error instanceof UserValidationError) return 422;
    if (error instanceof DuplicateProjectError || error instanceof ProjectInactiveError || error instanceof UserAlreadyExistsError) return 409;
    return 500;
}

export function mapErrorToCode(error: Error): string {
    if (error instanceof ProjectNotFoundError) return 'PROJECT_NOT_FOUND';
    if (error instanceof UserNotFoundError) return 'USER_NOT_FOUND';
    if (error instanceof UserNotVerifiedError) return 'USER_NOT_VERIFIED';
    if (error instanceof InvalidIntervalError) return 'INVALID_INTERVAL';
    if (error instanceof InvalidProjectNameError) return 'INVALID_PROJECT_NAME';
    if (error instanceof InvalidProjectUrlError) return 'INVALID_PROJECT_URL';
    if (error instanceof ProjectValidationError) return 'INVALID_PROJECT_CREATION';
    if (error instanceof UserValidationError) return 'USER_NOT_VALIDATED';
    if (error instanceof UnsafeMonitoringTargetError) return 'UNSAFE_MONITORING_TARGET';
    if (error instanceof UnauthorizedProjectAccessError) return 'UNAUTHORISED_PROJECT_ACCESS';
    if (error instanceof DuplicateProjectError) return 'DUPLICATE_PROJECT';
    if (error instanceof NullJobError) return 'JOB_NOT_FOUND';
    if (error instanceof NegativeWorkerCountError) return 'INVALID_WORKER_COUNT';
    if (error instanceof AuthenticationRequiredError) return 'AUTHENTICATION_REQUIRED';
    if (error instanceof ProjectInactiveError) return 'PROJECT_INACTIVE';
    if (error instanceof InvalidGoogleTokenError) return 'INVALID_GOOGLE_TOKEN';
    if (error instanceof OAuthAccountRequiredError) return 'OAUTH_ACCOUNT_REQUIRED';
    if (error instanceof InvalidCredentialsError) return 'INVALID_CREDENTIALS';
    if (error instanceof UserAlreadyExistsError) return 'USER_ALREADY_EXISTS';
    if (error instanceof AlreadyVerifiedError) return 'ALREADY_VERIFIED';
    if (error instanceof TokenExpiredError) return 'TOKEN_EXPIRED';
    if (error instanceof TokenDoesNotExistError) return 'TOKEN_NOT_FOUND';

    return 'INTERNAL_SERVER_ERROR';
}   