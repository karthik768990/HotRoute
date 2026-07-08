import { InvalidIntervalError, InvalidProjectNameError, InvalidProjectUrlError, UnsafeMonitoringTargetError } from "./project.errors";
import { canonicalURLConverter } from "./url.helper";
import { isLocalHost,isMetadataEndpoint,isPrivateIp } from "./security.helper";



const MIN_INTERVAL = 1;
const MAX_INTERVAL = 1440

export function validateInterval(interval: number) {
    if (!Number.isInteger(interval)) throw new InvalidIntervalError("Interval must be a integer")


    if (interval < MIN_INTERVAL) {
        throw new InvalidIntervalError(`Interval must be atleast ${MIN_INTERVAL} minutes`)
    }

    if (interval > MAX_INTERVAL) {
        throw new InvalidIntervalError(`Interval must not exceed ${MAX_INTERVAL} minutes`)

    }

}

const MIN_NAME_LENGTH = 3
const MAX_NAME_LENGTH = 50
export function validateProjectName(projectName: string) {
    projectName = projectName.trim()
    if (projectName.length === 0) throw new InvalidProjectNameError(`Project name should contain atleast one character other than space`)

    if (projectName.length < MIN_NAME_LENGTH) {
        throw new InvalidProjectNameError(`Project name should be atleast ${MIN_NAME_LENGTH} characters `)
    }

    if (projectName.length > MAX_NAME_LENGTH) {
        throw new InvalidProjectNameError(`Project name should have atmost ${MAX_NAME_LENGTH} characters `)

    }
    
}

export function validateAndSanitizeProjectURL(projectURL: string): string {
    projectURL = projectURL.trim();

    // 1. Empty URL
    if (projectURL.length === 0) {
        throw new InvalidProjectUrlError("Project URL cannot be empty");
    }

    // 2. Parse URL
    const parsedURL = canonicalURLConverter(projectURL);

    // 3. Protocol validation
    if (
        parsedURL.protocol !== "http:" &&
        parsedURL.protocol !== "https:"
    ) {
        throw new InvalidProjectUrlError(
            "Only HTTP and HTTPS URLs are allowed"
        );
    }

    // 4. Safe monitoring target validation
    const isSafe = !isLocalHost(parsedURL) && !isPrivateIp(parsedURL.hostname) && !isMetadataEndpoint(parsedURL.hostname);
    if (!isSafe) {
        throw new UnsafeMonitoringTargetError('Project url should neither be localhost nor private ip addresses nor metadata endpoints');
    }

    return parsedURL.toString();
}



