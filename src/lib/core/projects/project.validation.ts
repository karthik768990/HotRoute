import { validateExistingUser,validateUserVerification } from "./helpers/uservalidation.helpers";
import { validateProjectName,validateInterval,validateProjectURL,validateUnsafeMonitoring } from "./helpers/project.helper";
import { CreateProjectInput } from "./project.types";
export async function validateCreateProjectInput({userId,name,url,interval}: CreateProjectInput):Promise<CreateProjectInput>{    
    await validateExistingUser(userId);
    await validateUserVerification(userId)
    validateProjectName(name)
    validateProjectURL(url)
    validateUnsafeMonitoring(url)
    validateInterval(interval)
    return {
        userId,name,url,interval
    } 
}