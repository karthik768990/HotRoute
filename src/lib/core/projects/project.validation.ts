import { validateProjectName,validateInterval,validateProjectURL,validateUnsafeMonitoring } from "./helpers/project.helper";
import { CreateProjectInput } from "./project.types";
export  function validateCreateProjectInput({userId,name,url,interval}: CreateProjectInput):CreateProjectInput{    
    
    validateProjectName(name)
    url = validateProjectURL(url)
    validateUnsafeMonitoring(url)
    validateInterval(interval)
    return {
        userId,name,url,interval
    } 
}