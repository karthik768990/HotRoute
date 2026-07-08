import { mapErrorToCode, mapErrorToStatus } from "@/lib/api/api.errors";
import { errorResponse, successResponse } from "@/lib/api/api.response";
import { requireAuthenticatedUser } from "@/lib/auth/auth.helper";
import { createProject, listProjects } from "@/lib/projects/project.service";

export async function GET(request: Request) {
    try {
        const user = await requireAuthenticatedUser(request)

        const result = await listProjects({ userId: user.id })
        return successResponse(result, 200)
    } catch (error: unknown) {
        const e = error as Error;
        return errorResponse(e.message, mapErrorToCode(e), mapErrorToStatus(e))

    }

}


export async function  POST(request:Request){
    try{
        const jsonRequest  = await request.json()
        const name = jsonRequest.name
        const url= jsonRequest.url
        const interval = jsonRequest.interval
        const user = await requireAuthenticatedUser(request)
        const result= await createProject({userId: user.id, name,url,interval})
        return successResponse(result,201)

        
    }catch(error: unknown){
        const e = error as Error;
        return errorResponse(e.message, mapErrorToCode(e), mapErrorToStatus(e))
    }
}