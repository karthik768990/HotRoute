import { AuthenticationRequiredError } from "../core/projects/helpers/project.errors";
import { User } from "../../generated/prisma/browser";
import prisma from "../prisma";
import { verifyToken } from "./jwt";


export async function getAuthenticatedUser(request: Request): Promise<User | null> {

    try {
        const authorization_header = request.headers.get('authorization')
        if (!authorization_header) return null
        const parts = authorization_header.split(' ')
        if (parts.length !== 2) return null
        if (parts[0].toLowerCase() !== 'bearer') return null;
        const token = parts[1]
        const payload = verifyToken(token)
        const existingUser = await prisma.user.findUnique({ where: { id: payload.userId } })
        if (!existingUser) return null
        return existingUser

    } catch (error: any) {
        return null
    }

}


export async function requireAuthenticatedUser(request: Request):Promise<User>{
    const user = await getAuthenticatedUser(request)
    if(user===null)throw new AuthenticationRequiredError("User authentication required")
       
    return user    
}