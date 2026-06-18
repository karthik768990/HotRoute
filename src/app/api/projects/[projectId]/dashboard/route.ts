import { mapErrorToCode, mapErrorToStatus } from "@/lib/api/api.errors";
import { errorResponse, successResponse } from "@/lib/api/api.response";
import { requireAuthenticatedUser, requireAuthorizedProject } from "@/lib/auth/auth.helper";
import { getProjectDashboard } from "@/lib/dashboard/dashboard.services";

export async function GET(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
    try {
        const user  = await requireAuthenticatedUser(request)
        const {projectId} = await params
        // get the authenticated project using the helper 
        const project = await requireAuthorizedProject({userId:user.id , projectId:projectId})
        const result = await getProjectDashboard({projectId: project.id})
        return successResponse(result,200)

    } catch (error: any) {
        return errorResponse(error.message, mapErrorToCode(error), mapErrorToStatus(error))

    }
}