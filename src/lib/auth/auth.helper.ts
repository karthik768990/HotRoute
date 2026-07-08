import { AuthenticationRequiredError, ProjectNotFoundError, UnauthorizedProjectAccessError } from "../projects/helpers/project.errors";
import { User, Project } from "../../generated/prisma/browser";
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

    } catch {
        return null
    }

}


export async function requireAuthenticatedUser(request: Request): Promise<User> {
    const user = await getAuthenticatedUser(request)
    if (user === null) throw new AuthenticationRequiredError("User authentication required")

    return user
}

interface RequireAuthorizedProjectInput {
    userId: string,
    projectId: string
}
export async function requireAuthorizedProject({ userId, projectId }: RequireAuthorizedProjectInput): Promise<Project> {
    const project = await prisma.project.findUnique({ where: { id: projectId } })
    if (!project) throw new ProjectNotFoundError('Project not found ')

    if (project.userId !== userId) throw new UnauthorizedProjectAccessError('Unauthorized project access error ')
    return project
}   