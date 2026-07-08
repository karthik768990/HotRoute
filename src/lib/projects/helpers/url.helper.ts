import { InvalidProjectUrlError } from "./project.errors";



function canonicalURLConverter(projectURL:string):URL{
    projectURL = projectURL.trim().toLowerCase()
    
    try {
            const parsedURL= new URL(projectURL);
            return parsedURL;
        } catch {
            throw new InvalidProjectUrlError("Invalid URL format");
        }
}
export {canonicalURLConverter}