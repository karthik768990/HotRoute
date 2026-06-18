import { mapErrorToCode, mapErrorToStatus } from "@/lib/api/api.errors";
import { errorResponse, successResponse } from "@/lib/api/api.response";
import { requireAuthenticatedUser } from "@/lib/auth/auth.helper";
import { deleteProject, getProjectById, updateProject } from "@/lib/core/projects/project.service";

export async function GET(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
    try {
        const user = await requireAuthenticatedUser(request)
        const { projectId } = await params
        const result = await getProjectById({ userId: user.id, projectId })
        return successResponse(result, 200)
    } catch (error: any) {
        return errorResponse(error.message, mapErrorToCode(error), mapErrorToStatus(error))

    }
}

export async function PATCH(request:Request, { params }: { params: Promise<{ projectId: string }> }){
    try{
        const user = await requireAuthenticatedUser(request)
        const { projectId } = await params
        const {name,url,interval,active} = await request.json()
        const result = await updateProject({projectId: projectId,userId:user.id,name,url,interval,active})
        return successResponse(result,200)
    }catch(error: any){
        return errorResponse(error.message, mapErrorToCode(error), mapErrorToStatus(error))   
    }
}

export async function  DELETE(request:Request, { params }: { params: Promise<{ projectId: string }> }){
    try{
        const user = await requireAuthenticatedUser(request)
        const {projectId} = await params
        const result = await deleteProject({userId:(user).id,projectId})
        return successResponse(result,200)
    }catch(error: any){
        return errorResponse(error.message, mapErrorToCode(error), mapErrorToStatus(error))   
    }
}