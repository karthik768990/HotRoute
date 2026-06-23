import { CreateProjectInput, DeleteProjectInput, GetProjectByIdInput, ListProjectsInput, UpdateProjectInput } from "./project.types";
import { Project } from "../../../generated/prisma/browser"
import prisma from "../../prisma"
import { validateCreateProjectInput } from "./project.validation";
import { DuplicateProjectError, ProjectNotFoundError, UnauthorizedProjectAccessError, UserNotFoundError, UserNotVerifiedError } from "./helpers/project.errors";
import { validateUser } from "./userValidation";
import { validateProjectName, validateInterval, validateProjectURL, validateUnsafeMonitoring } from "./helpers/project.helper";



export async function createProject({
    userId,
    name,
    url,
    interval
}: CreateProjectInput): Promise<Project> {
    const validatedInput = validateCreateProjectInput({ userId, name, url, interval })
    await validateUser(validatedInput.userId)

    const existingProject = await prisma.project.findFirst({
        where: {
            userId: validatedInput.userId,
            url: validatedInput.url
        }
    })
    if (existingProject) {
        throw new DuplicateProjectError("A project with this url already exists")
    }
    const project = await prisma.project.create({
        data: {
            userId: validatedInput.userId,
            url: validatedInput.url,
            interval: validatedInput.interval,
            name: validatedInput.name
        }
    })

    return project
}






export async function updateProject({
    projectId,
    userId,
    name,
    url,
    interval,
    active,
}: UpdateProjectInput): Promise<Project> {

    if (
        name === undefined &&
        url === undefined &&
        interval === undefined &&
        active === undefined
    ) {
        throw new Error("No fields provided for update");
    }


    const existingProject = await prisma.project.findUnique({
        where: {
            id: projectId
        }
    })
    if (!existingProject) {
        throw new Error("Project not found")
    }
    if (existingProject?.userId !== userId) {
        throw new UnauthorizedProjectAccessError("UnauthorizedProjectAccessError")
    }


    const updateData: {
        name?: string;
        url?: string;
        interval?: number;
        active?: boolean;
    } = {};
    if (name !== undefined) {
        validateProjectName(name)
        updateData.name = name
    }
    if (url !== undefined) {
        validateProjectURL(url)
        validateUnsafeMonitoring(url)

        const duplicateProject = await prisma.project.findFirst({
            where: {
                userId: userId,
                url: url,
                NOT: { id: projectId }

            }
        })

        if (duplicateProject) {
            throw new DuplicateProjectError("A project with this url already exists")
        }
        updateData.url = url
    }

    if (interval !== undefined) {
        validateInterval(interval)
        updateData.interval = interval
    }
    if (active !== undefined) {
        updateData.active = active
    }
    return await prisma.project.update({
        where: { id: projectId },
        data: updateData
    })

}





export async function getProjectById({ userId, projectId }: GetProjectByIdInput): Promise<Project> {
    await validateUser(userId)
    const project = await prisma.project.findUnique({ where: { id: projectId } })
    if (!project) {
        throw new ProjectNotFoundError("Project not found")
    }
    if (project.userId !== userId) {
        throw new UnauthorizedProjectAccessError('The requested project does not belong to you')
    }
    return project
}

export async function listProjects({ userId }: ListProjectsInput): Promise<Array<Project>> {
    await validateUser(userId)
    const projects = await prisma.project.findMany({
        where: {
            userId: userId
        },
        include: {
            pingLogs: {
                orderBy: { createdAt: 'desc' },
                take: 24
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    })
    return projects

}

export async function deleteProject({ userId, projectId }: DeleteProjectInput): Promise<Project> {
    await validateUser(userId)
    const project = await prisma.project.findUnique({
        where: {
            id: projectId
        }
    })
    if (!project) throw new ProjectNotFoundError("Project not found ")

    if (project.userId !== userId) throw new UnauthorizedProjectAccessError("Access to other's projects not allowed")

    await prisma.project.delete({
        where: { id: projectId }
    })
    return project
}

