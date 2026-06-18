import { mapErrorToCode, mapErrorToStatus } from "@/lib/api/api.errors"
import { errorResponse, successResponse } from "@/lib/api/api.response"
import { requireAuthenticatedUser, requireAuthorizedProject } from "@/lib/auth/auth.helper"
import { performPing } from "@/lib/core/ping/ping.service"
import { ProjectInactiveError } from "@/lib/core/projects/helpers/project.errors"



export async function POST(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
    try {
        const user = await requireAuthenticatedUser(request)
        const { projectId } = await params
        // get the authenticated project using the helper 
        const project = await requireAuthorizedProject({ userId: user.id, projectId: projectId })
        const result = await performPing({ projectId: project.id })
        if (result === null) throw new ProjectInactiveError("Project inactive")
        return successResponse(result, 200)
    } catch (error: any) {
        return errorResponse(error.message, mapErrorToCode(error), mapErrorToStatus(error))

    }

}