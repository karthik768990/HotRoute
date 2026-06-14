import { CreateProjectInput, UpdateProjectInput } from "./project.types";
import { Project } from "../../../generated/prisma/browser"
import prisma from "../../prisma"
import { validateCreateProjectInput } from "./project.validation";
import { UnauthorizedProjectAccessError, UserNotFoundError, UserNotVerifiedError } from "./helpers/project.errors";
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



// getProjectById()
// listProjects()
// deleteProject()



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