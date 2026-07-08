import { CreateProjectInput, DeleteProjectInput, GetProjectByIdInput, ListProjectsInput, UpdateProjectInput } from "./project.types";
import { Project } from "../../generated/prisma/browser"
import prisma from "../prisma"
import { validateCreateProjectInput, validateUpdateProjectInput } from "./project.validation";
import { DuplicateProjectError, ProjectNotFoundError, UnauthorizedProjectAccessError } from "./helpers/project.errors";
import { validateUser } from "./user.validation";



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

export async function getProjectByIdInternal(projectId: string): Promise<Project> {
    const project = await prisma.project.findUnique({ where: { id: projectId } })
    if (!project) {
        throw new ProjectNotFoundError("Project not found")
    }
    return project
}

async function verifyProjectOwnership(projectId: string, userId: string): Promise<Project> {
    const project = await getProjectByIdInternal(projectId);
    if (project.userId !== userId) {
        throw new UnauthorizedProjectAccessError("Unauthorized project access");
    }
    return project;
}

export async function updateProjectLastPing(projectId: string): Promise<Project> {
    const project = await getProjectByIdInternal(projectId)
    return await prisma.project.update({
        where: { id: project.id },
        data: {
            lastPingAt: new Date()
        }
    })
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


    await verifyProjectOwnership(projectId, userId);


    const validatedUpdate = validateUpdateProjectInput({ name, url, interval, active });

    if (validatedUpdate.url !== undefined) {
        const duplicateProject = await prisma.project.findFirst({
            where: {
                userId: userId,
                url: validatedUpdate.url,
                NOT: { id: projectId }
            }
        });

        if (duplicateProject) {
            throw new DuplicateProjectError("A project with this url already exists");
        }
    }

    return await prisma.project.update({
        where: { id: projectId },
        data: validatedUpdate
    });

}





export async function getProjectById({ userId, projectId }: GetProjectByIdInput): Promise<Project> {
    await validateUser(userId);
    return await verifyProjectOwnership(projectId, userId);
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
    await validateUser(userId);
    const project = await verifyProjectOwnership(projectId, userId);

    await prisma.project.delete({
        where: { id: projectId }
    })
    return project
}

