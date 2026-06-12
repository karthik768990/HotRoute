import prisma from "../../../prisma"
import { InvalidIntervalError, InvalidProjectNameError, InvalidProjectUrlError, UnsafeMonitoringTargetError, UserNotFoundError, UserNotVerifiedError } from "./project.errors";
 


export async function validateExistingUser(userId:string){
    const existingUser = await prisma.user.findUnique({
        where:{
            id:userId
        }
    })

    if(!existingUser){
        throw new UserNotFoundError("User does not exist")
    }
}

export async function validateUserVerification(userId:string){
    const existingUser =await  prisma.user.findUnique({
        where:{
            id:userId
        }
    })
    if(!existingUser)
        throw new UserNotFoundError("User does not exist")

    if(existingUser.verifiedAt===null)throw new UserNotVerifiedError("User has not verified yet")
}
