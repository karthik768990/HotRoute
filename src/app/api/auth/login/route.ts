import { errorResponse, successResponse } from "../../../../lib/api/api.response"
import { loginUser } from "../../../../lib/auth/auth.service"
import { mapErrorToCode, mapErrorToStatus } from "../../../../lib/api/api.errors"

export async function POST(request: Request) {
    try {
        const requestBody = await request.json()

        const email: string = requestBody.email
        const password: string = requestBody.password
        const result = await loginUser({ email: email, password: password })

        return successResponse(result, 200)
    } catch (error: any) {
        return errorResponse(error.message, mapErrorToCode(error), mapErrorToStatus(error))

    }
}