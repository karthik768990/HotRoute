import { CreateProjectInput, UpdateProjectInput } from "./project.types";
import { Project } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";
import { validateCreateProjectInput } from "./project.validation";
import { UserNotFoundError } from "./helpers/project.errors";
export async function createProject({
    userId,
    name,
    url,
    interval
}: CreateProjectInput): Promise<Project> {
    validateCreateProjectInput({ userId, name, url, interval })

    const existingUser = await prisma.user.findUnique({
        where: {
            id: userId
        }
    })

    
}