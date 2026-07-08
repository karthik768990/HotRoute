import { validateProjectName, validateInterval, validateAndSanitizeProjectURL } from "./helpers/project.helper";
import { CreateProjectInput, UpdateProjectInput } from "./project.types";

export function validateCreateProjectInput({ userId, name, url, interval }: CreateProjectInput): CreateProjectInput {    
    validateProjectName(name);
    url = validateAndSanitizeProjectURL(url);
    validateInterval(interval);
    
    return { userId, name, url, interval };
}

export function validateUpdateProjectInput(input: Partial<UpdateProjectInput>): Partial<UpdateProjectInput> {
    const validatedInput: Partial<UpdateProjectInput> = { ...input };

    if (validatedInput.name !== undefined) {
        validateProjectName(validatedInput.name);
    }
    
    if (validatedInput.url !== undefined) {
        validateAndSanitizeProjectURL(validatedInput.url);
    }
    
    if (validatedInput.interval !== undefined) {
        validateInterval(validatedInput.interval);
    }

    return validatedInput;
}