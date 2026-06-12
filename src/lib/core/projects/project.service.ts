import { CreateProjectInput, UpdateProjectInput } from "./project.types";
import { Project } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";
import { validateCreateProjectInput } from "./project.validation";
import { UserNotFoundError, UserNotVerifiedError } from "./helpers/project.errors";
export async function createProject({
    userId,
    name,
    url,
    interval
}: CreateProjectInput): Promise<Project> {
    const validatedInput = await validateCreateProjectInput({ userId, name, url, interval })
    //TODO add the validation for the user separately
    const existingUser = await prisma.user.findUnique({
        where: {
            id: validatedInput.userId
        }
    })
    if(!existingUser)throw new UserNotFoundError("User not found")
    if(existingUser.verifiedAt===null)throw new UserNotVerifiedError("User not verified complete verification using gmail")    
        const project = await prisma.project.create({
    data: {
        userId: validatedInput.userId,
        url: validatedInput.url,
        interval: validatedInput.interval,
        name: validatedInput.name
    }})

    return project
}