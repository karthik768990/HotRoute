import { validateExistingUser,validateUserVerification } from "./helpers/uservalidation.helpers";


export async function validateUser(userId:string):Promise<void>{
    await validateExistingUser(userId)
    await validateUserVerification(userId)
}