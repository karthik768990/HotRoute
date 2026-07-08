import { registerUser } from "../../../../lib/auth/auth.service"
import { errorResponse, successResponse } from "../../../../lib/api/api.response"
import { mapErrorToCode, mapErrorToStatus } from "../../../../lib/api/api.errors"

export async function POST(request: Request) {
    // since this is un protected route we can implement it directly 
    try {

        const jsonRequest = await request.json()
        const username: string = jsonRequest.username
        const email: string = jsonRequest.email
        const password: string = jsonRequest.password

        
        
        const result = await registerUser({ name: username, email, password });

        return successResponse(result, 201)

    } catch (error: unknown) {
        const e = error as Error;
        return errorResponse(e.message, mapErrorToCode(e), mapErrorToStatus(e))
    }



}